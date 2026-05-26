'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { authService, isAuthResponse } from '@/features/auth/services/auth-service'
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

const statusMessages: Record<FrejaAuthStatus, string> = {
  PENDING: 'Väntar på Freja.',
  MATCHES: 'Identiteten är verifierad.',
  CLASHING: 'Freja-identiteten matchade inte kontot.',
  DISAPPROVED: 'Verifieringen nekades.',
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

export default function IdentityVerification({
  enabled,
}: {
  enabled: boolean
}) {
  const { user, completeAuth, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [authRef, setAuthRef] = useState('')
  const [status, setStatus] = useState<FrejaAuthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const identityVerified =
    isVerified(user?.verifiedIdentity) || isVerified(user?.verifiedStudent)
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

  if (!enabled) return null

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>Konto</h3>
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
                  Verifierad
                </span>
              ) : (
                <span className='inline-flex h-6 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 text-xs font-medium text-muted-foreground'>
                  Ej verifierad
                </span>
              )}
              {!identityVerified && status ? (
                <span className='text-xs text-muted-foreground'>
                  {statusMessages[status]}
                </span>
              ) : null}
            </div>

            {!identityVerified ? (
              <Button
                type='button'
                variant='outline'
                className='rounded-md border-gray-200 text-gray-900 sm:w-auto'
                isLoading={loading}
                isDisabled={loading}
                onClick={startIdentityVerification}
              >
                Verifiera
              </Button>
            ) : null}
          </div>

          {frejaAuthUrl ? (
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
