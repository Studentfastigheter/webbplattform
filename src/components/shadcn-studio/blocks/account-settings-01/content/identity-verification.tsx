'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { authService, isAuthResponse } from '@/features/auth/services/auth-service'
import { useVerifyIdentity } from '@/features/auth/hooks/useAuthMutations'
import type { Locale } from '@/i18n/config'
import { useI18n } from '@/i18n/I18nProvider'
import { localizedText } from '@/i18n/text'
import type { FrejaAuthStatus, User } from '@/types'

const pollIntervalMs = 2000
const frejaLogoPath =
  '/FrejaBrandingPackNew/FrejaBrandingPack/Freja Logo/Freja/SVG/FrejaIndigo.svg'

const frejaAuthStatuses = [
  'PENDING',
  'MATCHES',
  'CLASHING',
  'DISAPPROVED',
  'EXPIRED',
  'CANCELED',
] as const satisfies readonly FrejaAuthStatus[]

const statusMessages: Record<FrejaAuthStatus, { sv: string; en: string }> = {
  PENDING: { sv: 'Väntar på Freja.', en: 'Waiting for Freja.' },
  MATCHES: { sv: 'Identiteten är verifierad.', en: 'Identity verified.' },
  CLASHING: { sv: 'Freja-identiteten matchade inte kontot.', en: 'The Freja identity did not match the account.' },
  DISAPPROVED: { sv: 'Verifieringen nekades.', en: 'The verification was rejected.' },
  EXPIRED: { sv: 'Verifieringen hann löpa ut.', en: 'The verification expired.' },
  CANCELED: { sv: 'Verifieringen avbröts.', en: 'The verification was canceled.' },
}

function getStatusMessage(status: FrejaAuthStatus, locale: Locale) {
  const message = statusMessages[status]
  return localizedText(locale, message.sv, message.en)
}

function isFrejaAuthStatus(value: unknown): value is FrejaAuthStatus {
  return (
    typeof value === 'string' &&
    (frejaAuthStatuses as readonly string[]).includes(value)
  )
}

function buildFrejaAuthUrl(authRef: string) {
  const url = new URL('https://app.test.frejaeid.com/freja')

  url.searchParams.set('action', 'bindUserToTransaction')
  url.searchParams.set('transactionReference', authRef)

  return url.toString()
}

function isVerified(value: unknown) {
  return value === true || value === 'true'
}

export default function IdentityVerification({
  enabled,
}: {
  enabled: boolean
}) {
  const { locale } = useI18n()
  const { user, completeAuth, refreshUser } = useAuth()
  const verifyIdentity = useVerifyIdentity()
  const [loading, setLoading] = useState(false)
  const [authRef, setAuthRef] = useState('')
  const [status, setStatus] = useState<FrejaAuthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkingMe, setCheckingMe] = useState(false)
  const [hasLoadedMe, setHasLoadedMe] = useState(false)
  const [meUser, setMeUser] = useState<User | null>(null)

  const verificationUser = meUser ?? user
  const identityVerified = isVerified(verificationUser?.verifiedIdentity)
  const hasFreshVerificationStatus = !enabled || !user || hasLoadedMe
  const canStartVerification =
    !!user && !identityVerified && hasFreshVerificationStatus && !checkingMe
  const frejaAuthUrl = useMemo(
    () => (authRef ? buildFrejaAuthUrl(authRef) : ''),
    [authRef]
  )

  const loadVerificationStatus = useCallback(async () => {
    if (!enabled || !user) return

    setCheckingMe(true)
    try {
      const currentUser = await authService.me()
      setMeUser(currentUser)
      if (isVerified(currentUser.verifiedIdentity)) {
        setAuthRef('')
        setStatus(null)
        setLoading(false)
      }
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : localizedText(locale, 'Kunde inte läsa verifieringsstatus.', 'Could not read verification status.')
      )
    } finally {
      setHasLoadedMe(true)
      setCheckingMe(false)
    }
  }, [enabled, locale, user])

  useEffect(() => {
    setMeUser(null)
    setHasLoadedMe(false)
    if (!enabled || !user) return

    void loadVerificationStatus()
  }, [enabled, loadVerificationStatus, user?.email, user?.id, user])

  useEffect(() => {
    if (!authRef) return

    let active = true
    let timeout: ReturnType<typeof setTimeout> | undefined

    async function poll() {
      try {
        const result = await authService.pollAuthStatus(authRef)
        if (!active) return

        if (isAuthResponse(result)) {
          completeAuth(result)
          setStatus('MATCHES')
          setLoading(false)
          await refreshUser()
          await loadVerificationStatus()
          return
        }

        if (!isFrejaAuthStatus(result)) {
          setError(localizedText(locale, 'Backend skickade en okänd Freja-status.', 'The backend returned an unknown Freja status.'))
          setLoading(false)
          return
        }

        setStatus(result)
        setError(null)

        if (result === 'PENDING') {
          timeout = setTimeout(poll, pollIntervalMs)
          return
        }

        setLoading(false)

        if (result === 'MATCHES') {
          await refreshUser()
          await loadVerificationStatus()
        }
      } catch {
        if (!active) return
        setError(localizedText(locale, 'Kunde inte kontrollera Freja-status. Försöker igen.', 'Could not check Freja status. Trying again.'))
        timeout = setTimeout(poll, pollIntervalMs)
      }
    }

    poll()

    return () => {
      active = false
      if (timeout) clearTimeout(timeout)
    }
  }, [authRef, completeAuth, loadVerificationStatus, locale, refreshUser])

  const startIdentityVerification = async () => {
    if (loading || !canStartVerification) return

    setLoading(true)
    setAuthRef('')
    setStatus(null)
    setError(null)

    try {
      const response = await verifyIdentity.mutateAsync()
      setAuthRef(response.authRef)
      setStatus('PENDING')
    } catch (err) {
      setLoading(false)
      setError(
        err instanceof Error ? err.message : localizedText(locale, 'Kunde inte starta Freja-verifieringen.', 'Could not start Freja verification.')
      )
    }
  }

  if (!enabled) return null

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>{localizedText(locale, 'Konto', 'Account')}</h3>
      </div>

      <div className='lg:col-span-2'>
        <div className='rounded-[8px] border border-gray-200 bg-white px-4 py-3'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-wrap items-center gap-2.5'>
              <Image
                src={frejaLogoPath}
                alt='Freja'
                width={64}
                height={16}
                className='h-auto w-16'
              />
              {identityVerified ? (
                <span className='inline-flex h-6 items-center gap-1.5 rounded-full border border-green-200 bg-white px-2 text-xs font-medium text-green-700'>
                  <CheckCircle2Icon className='size-3.5 text-green-700' />
                  {localizedText(locale, 'Verifierad', 'Verified')}
                </span>
              ) : (
                <span className='inline-flex h-6 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 text-xs font-medium text-muted-foreground'>
                  {localizedText(locale, 'Ej verifierad', 'Not verified')}
                </span>
              )}
              {!identityVerified && status ? (
                <span className='text-xs text-muted-foreground'>
                  {getStatusMessage(status, locale)}
                </span>
              ) : null}
            </div>

            {!identityVerified ? (
              <Button
                type='button'
                variant='outline'
                className='rounded-md border-gray-200 text-gray-900 sm:w-auto'
                isLoading={loading || checkingMe}
                isDisabled={loading || !canStartVerification}
                onClick={startIdentityVerification}
              >
                {hasFreshVerificationStatus
                  ? localizedText(locale, 'Verifiera', 'Verify')
                  : localizedText(locale, 'Kontrollerar', 'Checking')}
              </Button>
            ) : null}
          </div>

          {!identityVerified && frejaAuthUrl ? (
            <div className='mt-4 flex items-center gap-4 border-t border-gray-100 pt-4'>
              <div className='rounded-[8px] border border-gray-200 bg-white p-2'>
                <QRCodeSVG
                  value={frejaAuthUrl}
                  size={104}
                  fgColor='#111827'
                  bgColor='#ffffff'
                  level='M'
                  marginSize={2}
                />
              </div>
              <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                {loading ? <Loader2Icon className='size-4 animate-spin' /> : null}
              </p>
            </div>
          ) : null}

          {error ? <p className='mt-4 text-sm text-destructive'>{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
