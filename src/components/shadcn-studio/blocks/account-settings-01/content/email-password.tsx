'use client'

import { useState } from 'react'
import { CheckCircle2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { useStartPasswordReset } from '@/features/auth/hooks/useAuthMutations'
import { getAuthErrorMessage } from '@/lib/auth-error-messages'
import { useI18n } from '@/i18n/I18nProvider'
import { localizedText } from '@/i18n/text'

export default function PasswordSection() {
  const { locale } = useI18n()
  const { user } = useAuth()
  const startReset = useStartPasswordReset()
  const loading = startReset.isPending
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const email = user?.email?.trim() ?? ''

  const startPasswordReset = async () => {
    if (loading) return

    setMessage(null)
    setError(null)

    try {
      if (!email) {
        throw new Error(localizedText(locale, 'Kontot saknar e-postadress.', 'The account is missing an email address.'))
      }

      await startReset.mutateAsync({ userEmail: email })
      setMessage(localizedText(locale, 'Vi har skickat en länk för lösenordsbyte till din e-post.', 'We have sent a password reset link to your email.'))
    } catch (err) {
      setError(getAuthErrorMessage(err, 'forgot-password', locale))
    }
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='hidden lg:block' />

      <div className='lg:col-span-2'>
        <div className='rounded-[8px] border border-gray-200 bg-white px-4 py-3'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-wrap items-center gap-2.5'>
              <span className='text-sm font-semibold text-gray-950'>
                {localizedText(locale, 'Återställ lösenord', 'Reset password')}
              </span>
              {message ? (
                <span className='inline-flex h-6 items-center gap-1.5 rounded-full border border-green-200 bg-white px-2 text-xs font-medium text-green-700'>
                  <CheckCircle2Icon className='size-3.5 text-green-700' />
                  {localizedText(locale, 'Skickat', 'Sent')}
                </span>
              ) : null}
            </div>

            <Button
              type='button'
              variant='outline'
              className='rounded-md border-gray-200 text-gray-900 sm:w-auto'
              isLoading={loading}
              isDisabled={loading}
              onClick={startPasswordReset}
            >
              {localizedText(locale, 'Byt lösenord', 'Change password')}
            </Button>
          </div>

          {message ? (
            <p className='mt-3 text-sm text-muted-foreground'>
              {message}
            </p>
          ) : null}

          {error ? (
            <p className='mt-4 text-sm text-destructive'>{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
