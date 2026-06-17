'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2Icon,
  Clock3Icon,
  Loader2Icon,
  TriangleAlertIcon,
  XCircleIcon,
} from "@/components/icons"
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/features/auth/services/auth-service'
import { useRegisterStudent } from '@/features/auth/hooks/useAuthMutations'
import {
  clearQuickRegisterAuthRef,
  startOrResumeQuickRegisterVerification,
  writeQuickRegisterAuthRef,
} from '@/features/auth/lib/freja-verification-storage'
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
    title: { sv: 'Kontot är verifierat', en: 'Account verified' },
    description: {
      sv: 'Ditt quick-register-konto har verifierats och uppdateras till ett riktigt konto.',
      en: 'Your quick-register account has been verified and is being upgraded to a full account.',
    },
  },
  CLASHING: {
    label: { sv: 'Krock', en: 'Clash' },
    title: { sv: 'Freja matchar inte kontot', en: 'Freja does not match the account' },
    description: {
      sv: 'Freja-identiteten matchade inte kontot som verifieras, eller så finns kontot redan.',
      en: 'The Freja identity did not match the account being verified, or the account already exists.',
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
  const router = useRouter()
  const { locale, localizedHref } = useI18n()
  const { user, refreshUser, isLoading: authLoading } = useAuth()
  const registerStudent = useRegisterStudent()
  const verificationRunRef = useRef(0)
  const [loading, setLoading] = useState(false)
  const [authRef, setAuthRef] = useState('')
  const [status, setStatus] = useState<FrejaAuthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isQuickRegister = user?.accountType === 'quick_register'
  const accountVerified = Boolean(user) && !isQuickRegister
  const isStarting = loading && !authRef
  const isActiveVerification = Boolean(authRef) && status === 'PENDING' && isQuickRegister
  const hasTerminalStatus = status !== null && status !== 'PENDING'
  const canStartVerification =
    isQuickRegister &&
    !authLoading &&
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
    if (accountVerified) {
      setAuthRef('')
      setLoading(false)
    }
  }, [accountVerified])

  useEffect(() => {
    if (!authRef) return

    let active = true
    let timeout: ReturnType<typeof setTimeout> | undefined

    async function poll() {
      try {
        const result = await authService.pollAuthStatus(authRef)
        if (!active) return

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
          clearQuickRegisterAuthRef(user)
          setAuthRef('')
          await refreshUser()
          router.replace(localizedHref('/housing'))
          return
        }

        clearQuickRegisterAuthRef(user)
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
  }, [authRef, locale, localizedHref, refreshUser, router, user])

  const startAccountVerification = async () => {
    if (loading || !canStartVerification) return

    const runId = verificationRunRef.current + 1
    verificationRunRef.current = runId
    setLoading(true)
    setAuthRef('')
    setStatus(null)
    setError(null)

    try {
      const response = await startOrResumeQuickRegisterVerification(user, () =>
        registerStudent.mutateAsync()
      )
      if (verificationRunRef.current !== runId) return

      writeQuickRegisterAuthRef(user, response.authRef)
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

  const cancelAccountVerification = () => {
    if (!loading && !authRef) return

    verificationRunRef.current += 1
    registerStudent.reset()
    setAuthRef('')
    setLoading(false)
    setStatus('CANCELED')
    setError(null)
  }

  if (!enabled) return null

  return (
    <div id='verify-account' className='grid scroll-mt-28 grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>{localizedText(locale, 'Verifiera konto', 'Verify account')}</h3>
        <p className='text-sm text-muted-foreground'>
          {isQuickRegister
            ? localizedText(locale, 'Verifiera med Freja när du vill för att få ett riktigt studentkonto.', 'Verify with Freja whenever you want to get a full student account.')
            : localizedText(locale, 'Ditt konto är redan ett riktigt konto.', 'Your account is already a full account.')}
        </p>
      </div>

      <div className='lg:col-span-2'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-2.5'>
            <Image
              src={frejaLogoPath}
              alt='Freja'
              width={300}
              height={72}
              style={{ width: 64, height: 'auto' }}
            />
            {accountVerified ? (
              <span className='inline-flex h-6 items-center gap-1.5 rounded-full bg-green-50 px-2 text-xs font-medium text-green-700'>
                <CheckCircle2Icon className='size-3.5 text-green-700' />
                {localizedText(locale, 'Verifierad', 'Verified')}
              </span>
            ) : (
              <span className='inline-flex h-6 items-center gap-1.5 rounded-full bg-gray-100 px-2 text-xs font-medium text-muted-foreground'>
                {localizedText(locale, 'Quick-register', 'Quick-register')}
              </span>
            )}
            {!accountVerified && statusCopy && statusStyles ? (
              <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-medium ${statusStyles.pill}`}>
                {statusCopy.label}
              </span>
            ) : null}
          </div>

          {!accountVerified ? (
            <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end'>
              {isStarting || isActiveVerification ? (
                <Button
                  type='button'
                  variant='ghost'
                  className='rounded-md text-red-700 hover:bg-red-50 sm:w-auto'
                  onClick={cancelAccountVerification}
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
                  onClick={startAccountVerification}
                >
                  {authLoading
                    ? localizedText(locale, 'Kontrollerar', 'Checking')
                    : hasTerminalStatus
                      ? localizedText(locale, 'Starta igen', 'Start again')
                      : localizedText(locale, 'Verifiera nu', 'Verify now')}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {!accountVerified && isActiveVerification && frejaAuthUrl ? (
          <div className='mt-4 flex items-center gap-4 border-t border-gray-100 pt-4'>
            <div className='rounded-[8px] bg-white p-2'>
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

        {!accountVerified && statusCopy && statusStyles && StatusIcon ? (
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
  )
}
