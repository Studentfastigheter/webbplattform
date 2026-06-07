'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2Icon,
  Clock3Icon,
  Loader2Icon,
  TriangleAlertIcon,
  XCircleIcon,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { authService, isAuthResponse } from '@/features/auth/services/auth-service'
import { useVerifyIdentity } from '@/features/auth/hooks/useAuthMutations'
import type { Locale } from '@/i18n/config'
import { useI18n } from '@/i18n/I18nProvider'
import { localizedText } from '@/i18n/text'
import type { FrejaAuthStatus } from '@/types'

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

type LocalizedCopy = { sv: string; en: string }
type StatusCopy = {
  label: LocalizedCopy
  title: LocalizedCopy
  description: LocalizedCopy
}

const statusCopies: Record<FrejaAuthStatus, StatusCopy> = {
  PENDING: {
    label: { sv: 'Pågår', en: 'In progress' },
    title: { sv: 'Väntar på Freja', en: 'Waiting for Freja' },
    description: {
      sv: 'Verifieringen är startad. Godkänn begäran i Freja-appen eller avbryt den här.',
      en: 'The verification has started. Approve the request in the Freja app or cancel it here.',
    },
  },
  MATCHES: {
    label: { sv: 'Lyckades', en: 'Successful' },
    title: { sv: 'Verifieringen lyckades', en: 'Verification successful' },
    description: {
      sv: 'Din identitet är verifierad och kontot är uppdaterat.',
      en: 'Your identity is verified and the account has been updated.',
    },
  },
  CLASHING: {
    label: { sv: 'Krock', en: 'Clash' },
    title: { sv: 'Uppgifterna matchar inte', en: 'The details do not match' },
    description: {
      sv: 'Clashing betyder att identiteten från Freja inte stämmer med kontot som verifieras. Ingen verifiering sparades.',
      en: 'Clashing means the Freja identity does not match the account being verified. No verification was saved.',
    },
  },
  DISAPPROVED: {
    label: { sv: 'Nekad', en: 'Rejected' },
    title: { sv: 'Verifieringen nekades', en: 'Verification rejected' },
    description: {
      sv: 'Begäran nekades i Freja-appen. Du kan starta en ny verifiering när du vill.',
      en: 'The request was rejected in the Freja app. You can start a new verification whenever you want.',
    },
  },
  EXPIRED: {
    label: { sv: 'Utgången', en: 'Expired' },
    title: { sv: 'Tiden gick ut', en: 'The request expired' },
    description: {
      sv: 'Freja-begäran hann löpa ut innan den godkändes. Starta en ny verifiering för att försöka igen.',
      en: 'The Freja request expired before it was approved. Start a new verification to try again.',
    },
  },
  CANCELED: {
    label: { sv: 'Avbruten', en: 'Canceled' },
    title: { sv: 'Verifieringen avbröts', en: 'Verification canceled' },
    description: {
      sv: 'Du avbröt verifieringen här, eller så avbröts Freja-flödet. Ingen ändring har sparats.',
      en: 'You canceled the verification here, or the Freja flow was canceled. No change was saved.',
    },
  },
}

function getStatusCopy(status: FrejaAuthStatus, locale: Locale) {
  const copy = statusCopies[status]

  return {
    label: localizedText(locale, copy.label.sv, copy.label.en),
    title: localizedText(locale, copy.title.sv, copy.title.en),
    description: localizedText(locale, copy.description.sv, copy.description.en),
  }
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

function getStatusTone(status: FrejaAuthStatus) {
  if (status === 'MATCHES') return 'success'
  if (status === 'CLASHING') return 'warning'
  if (status === 'PENDING') return 'pending'

  return 'error'
}

function getStatusStyles(status: FrejaAuthStatus) {
  const tone = getStatusTone(status)

  if (tone === 'success') {
    return {
      panel: 'border-green-200 bg-green-50 text-green-900',
      icon: 'text-green-700',
      pill: 'border-green-200 bg-green-50 text-green-700',
    }
  }

  if (tone === 'warning') {
    return {
      panel: 'border-amber-200 bg-amber-50 text-amber-950',
      icon: 'text-amber-700',
      pill: 'border-amber-200 bg-amber-50 text-amber-800',
    }
  }

  if (tone === 'error') {
    return {
      panel: 'border-red-200 bg-red-50 text-red-950',
      icon: 'text-red-700',
      pill: 'border-red-200 bg-red-50 text-red-700',
    }
  }

  return {
    panel: 'border-[#3E3A93]/15 bg-[#3E3A93]/5 text-[#17142F]',
    icon: 'text-[#3E3A93]',
    pill: 'border-[#3E3A93]/15 bg-[#3E3A93]/5 text-[#3E3A93]',
  }
}

function getStatusIcon(status: FrejaAuthStatus) {
  const tone = getStatusTone(status)

  if (tone === 'success') return CheckCircle2Icon
  if (tone === 'warning') return TriangleAlertIcon
  if (tone === 'error') return XCircleIcon

  return Clock3Icon
}

export default function IdentityVerification({
  enabled,
}: {
  enabled: boolean
}) {
  const { locale } = useI18n()
  const { user, completeAuth, refreshUser, isLoading: authLoading } = useAuth()
  const verifyIdentity = useVerifyIdentity()
  const verificationRunRef = useRef(0)
  const [loading, setLoading] = useState(false)
  const [authRef, setAuthRef] = useState('')
  const [status, setStatus] = useState<FrejaAuthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const identityVerified = isVerified(user?.verifiedIdentity)
  const isStarting = loading && !authRef
  const isActiveVerification = Boolean(authRef) && status === 'PENDING' && !identityVerified
  const hasTerminalStatus = status !== null && status !== 'PENDING'
  const canStartVerification =
    !!user &&
    !authLoading &&
    !identityVerified &&
    !loading &&
    !isActiveVerification
  const frejaAuthUrl = useMemo(
    () => (authRef ? buildFrejaAuthUrl(authRef) : ''),
    [authRef]
  )
  const statusCopy = status ? getStatusCopy(status, locale) : null
  const statusStyles = status ? getStatusStyles(status) : null
  const StatusIcon = status ? getStatusIcon(status) : null

  useEffect(() => {
    if (identityVerified) {
      setAuthRef('')
      setLoading(false)
    }
  }, [identityVerified])

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
  }, [authRef, completeAuth, locale, refreshUser])

  const startIdentityVerification = async () => {
    if (loading || !canStartVerification) return

    const runId = verificationRunRef.current + 1
    verificationRunRef.current = runId
    setLoading(true)
    setAuthRef('')
    setStatus(null)
    setError(null)

    try {
      const response = await verifyIdentity.mutateAsync()
      if (verificationRunRef.current !== runId) return

      setAuthRef(response.authRef)
      setStatus('PENDING')
    } catch (err) {
      if (verificationRunRef.current !== runId) return

      setLoading(false)
      setError(
        err instanceof Error ? err.message : localizedText(locale, 'Kunde inte starta Freja-verifieringen.', 'Could not start Freja verification.')
      )
    }
  }

  const cancelIdentityVerification = () => {
    if (!loading && !authRef) return

    verificationRunRef.current += 1
    verifyIdentity.reset()
    setAuthRef('')
    setLoading(false)
    setStatus('CANCELED')
    setError(null)
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
                width={300}
                height={72}
                style={{ width: 64, height: 'auto' }}
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
              {!identityVerified && statusCopy && statusStyles ? (
                <span className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium ${statusStyles.pill}`}>
                  {statusCopy.label}
                </span>
              ) : null}
            </div>

            {!identityVerified ? (
              <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end'>
                {isStarting || isActiveVerification ? (
                  <Button
                    type='button'
                    variant='ghost'
                    className='rounded-md text-red-700 hover:bg-red-50 sm:w-auto'
                    onClick={cancelIdentityVerification}
                  >
                    {localizedText(locale, 'Avbryt', 'Cancel')}
                  </Button>
                ) : null}

                {!isActiveVerification ? (
                  <Button
                    type='button'
                    variant='outline'
                    className='rounded-md border-gray-200 text-gray-900 sm:w-auto'
                    isLoading={isStarting || authLoading}
                    isDisabled={!canStartVerification}
                    onClick={startIdentityVerification}
                  >
                    {authLoading
                      ? localizedText(locale, 'Kontrollerar', 'Checking')
                      : hasTerminalStatus
                        ? localizedText(locale, 'Starta igen', 'Start again')
                        : localizedText(locale, 'Verifiera', 'Verify')}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {!identityVerified && isActiveVerification && frejaAuthUrl ? (
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
                {localizedText(locale, 'Kontrollerar verifieringen automatiskt.', 'Checking the verification automatically.')}
              </p>
            </div>
          ) : null}

          {statusCopy && statusStyles && StatusIcon ? (
            <div
              className={`mt-4 flex gap-3 rounded-[8px] border px-3 py-3 text-sm ${statusStyles.panel}`}
              role={status === 'PENDING' ? 'status' : 'alert'}
              aria-live='polite'
            >
              <StatusIcon
                className={`mt-0.5 size-4 shrink-0 ${statusStyles.icon} ${
                  status === 'PENDING' ? 'animate-pulse' : ''
                }`}
              />
              <div className='min-w-0'>
                <p className='font-medium'>{statusCopy.title}</p>
                <p className='mt-1 text-xs leading-5'>{statusCopy.description}</p>
              </div>
            </div>
          ) : null}

          {error ? <p className='mt-4 text-sm text-destructive'>{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
