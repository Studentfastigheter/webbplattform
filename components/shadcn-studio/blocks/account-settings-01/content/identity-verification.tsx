'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2Icon, Loader2Icon, ShieldCheckIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { authService, isAuthResponse } from '@/services/auth-service'
import type { FrejaAuthStatus } from '@/types'

const pollIntervalMs = 2000

const frejaAuthStatuses = [
  'PENDING',
  'MATCHES',
  'CLASHING',
  'DISAPPROVED',
  'EXPIRED',
  'CANCELED',
] as const satisfies readonly FrejaAuthStatus[]

const statusMessages: Record<FrejaAuthStatus, string> = {
  PENDING: 'Väntar på godkännande i Freja.',
  MATCHES: 'Identiteten är verifierad.',
  CLASHING: 'Freja-identiteten matchade inte kontot, eller så används identiteten redan.',
  DISAPPROVED: 'Verifieringen nekades i Freja-appen.',
  EXPIRED: 'Verifieringen hann löpa ut.',
  CANCELED: 'Verifieringen avbröts.',
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

export default function IdentityVerification() {
  const { user, completeAuth, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [authRef, setAuthRef] = useState('')
  const [status, setStatus] = useState<FrejaAuthStatus | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const identityVerified =
    isVerified(user?.verifiedIdentity) || isVerified(user?.verifiedStudent)
  const ssn = user?.ssn?.trim() ?? ''
  const frejaAuthUrl = useMemo(
    () => (authRef ? buildFrejaAuthUrl(authRef) : ''),
    [authRef]
  )

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
          setMessage(statusMessages.MATCHES)
          setLoading(false)
          return
        }

        if (!isFrejaAuthStatus(result)) {
          setError('Backend skickade en okänd Freja-status.')
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
        setMessage(statusMessages[result])

        if (result === 'MATCHES') {
          await refreshUser()
        }
      } catch {
        if (!active) return
        setError('Kunde inte kontrollera Freja-status. Försöker igen.')
        timeout = setTimeout(poll, pollIntervalMs)
      }
    }

    poll()

    return () => {
      active = false
      if (timeout) clearTimeout(timeout)
    }
  }, [authRef, completeAuth, refreshUser])

  const startIdentityVerification = async () => {
    if (loading) return

    setLoading(true)
    setAuthRef('')
    setStatus(null)
    setMessage(null)
    setError(null)

    try {
      const response = await authService.verifyIdentity()
      setAuthRef(response.authRef)
      setStatus('PENDING')
    } catch (err) {
      setLoading(false)
      setError(
        err instanceof Error ? err.message : 'Kunde inte starta Freja-verifieringen.'
      )
    }
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>Identitet</h3>
        <p className='text-sm text-muted-foreground'>
          Personnummer och ID-verifiering.
        </p>
      </div>

      <div className='grid gap-5 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]'>
        <div className='flex flex-col items-start gap-2'>
          <Label htmlFor='personal-info-ssn'>Personnummer</Label>
          <Input
            id='personal-info-ssn'
            value={ssn}
            placeholder='Ej angivet'
            readOnly
            className='h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 text-base shadow-none placeholder:text-[#7a7a7a]'
          />
        </div>

        {identityVerified ? (
          <div className='mt-7 flex min-h-14 items-center justify-center gap-2 rounded-[8px] border border-green-200 bg-green-50 px-4 text-sm font-medium text-green-800 lg:mt-[30px]'>
            <CheckCircle2Icon className='size-4' />
            Identiteten är verifierad
          </div>
        ) : (
          <div className='rounded-[8px] border border-gray-200 bg-white p-4 shadow-sm'>
            <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-gray-950'>
              <ShieldCheckIcon className='size-4 text-[#004225]' />
              Verifiera med Freja ID
            </div>

            <p className='mb-4 text-sm text-muted-foreground'>
              Starta Freja och godkänn verifieringen i appen.
            </p>

            {frejaAuthUrl ? (
              <div className='mb-4 flex items-center gap-3'>
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
                <div className='space-y-1 text-sm'>
                  <p className='text-muted-foreground'>
                    {loading ? 'Polling är aktiv.' : 'Freja-flödet är avslutat.'}
                  </p>
                  <a
                    href={frejaAuthUrl}
                    className='font-medium text-[#004225] underline-offset-4 hover:underline'
                  >
                    Öppna Freja
                  </a>
                </div>
              </div>
            ) : null}

            {status ? (
              <p className='mb-3 flex items-center gap-2 text-sm text-muted-foreground'>
                {loading ? (
                  <Loader2Icon className='size-4 animate-spin' />
                ) : (
                  <CheckCircle2Icon className='size-4 text-green-700' />
                )}
                {statusMessages[status]}
              </p>
            ) : null}

            {message && status !== 'PENDING' ? (
              <p className='mb-3 text-sm text-muted-foreground'>{message}</p>
            ) : null}

            {error ? <p className='mb-3 text-sm text-destructive'>{error}</p> : null}

            <Button
              type='button'
              variant='outline'
              fullWidth
              isLoading={loading}
              isDisabled={loading}
              onClick={startIdentityVerification}
            >
              Verifiera med Freja
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
