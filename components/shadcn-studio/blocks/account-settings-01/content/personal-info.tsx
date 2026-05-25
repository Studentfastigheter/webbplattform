'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/auth-service'
import type { UpdateUserRequest } from '@/types'

export type PersonalInfoOptions = {
  showAvatar?: boolean
  showCity?: boolean
  showAbout?: boolean
  showEmailVerification?: boolean
}

export type PersonalInfoHandle = {
  save: () => Promise<void>
}

function isEmailLike(value: string) {
  const normalized = value.trim().toLowerCase()

  return normalized.startsWith('mailto:') || normalized.includes('@')
}

function normalizePhone(
  value: string | null | undefined,
  blockedValues: Array<string | null | undefined> = []
) {
  const phone = value?.trim() ?? ''
  if (!phone || isEmailLike(phone)) return ''

  const normalizedPhone = phone.toLowerCase()
  const isBlockedValue = blockedValues.some(
    blockedValue => blockedValue?.trim().toLowerCase() === normalizedPhone
  )

  if (isBlockedValue || !/\d/.test(phone)) return ''

  return phone
}

function sanitizePhoneInput(value: string) {
  return isEmailLike(value) ? '' : value
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isVerified(value: unknown) {
  return value === true || value === 'true'
}

const inputClassName =
  'h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20'
const fieldClassName = 'flex flex-col items-start gap-2'

const PersonalInfo = forwardRef<
  PersonalInfoHandle,
  { options?: PersonalInfoOptions }
>(({ options = {} }, ref) => {
  const { user, isLoading: authLoading, updateUser } = useAuth()
  const showEmailVerification = options.showEmailVerification ?? false

  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false)
  const [emailVerificationMessage, setEmailVerificationMessage] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setSurname(user.surname ?? '')
    setPhone(user.phone ?? '')
    setEmail(user.email ?? '')
  }, [user])

  const save = async () => {
    setError(null)

    try {
      const trimmedEmail = email.trim()
      if (trimmedEmail && !isValidEmail(trimmedEmail)) {
        throw new Error('Ange en giltig e-postadress.')
      }

      const payload: UpdateUserRequest = {
        email: trimmedEmail || undefined,
        firstName: firstName.trim() || undefined,
        surname: surname.trim() || undefined,
        phone: normalizePhone(phone, [user?.email]),
      }

      await updateUser(payload)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kunde inte spara ändringar.'
      )
      throw err
    }
  }

  const startEmailVerification = async () => {
    if (emailVerificationLoading) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Ange en e-postadress först.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Ange en giltig e-postadress.')
      return
    }

    setEmailVerificationLoading(true)
    setEmailVerificationMessage(null)
    setError(null)

    try {
      await authService.verifyEmail({ email: trimmedEmail })
      setEmailVerificationMessage('Verifieringsmail är skickat.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kunde inte skicka verifieringsmail.'
      )
    } finally {
      setEmailVerificationLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({ save }), [
    firstName,
    surname,
    phone,
    email,
  ])

  const emailVerified = isVerified(user?.verifiedEmail)

  if (authLoading) {
    return (
      <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
        <div className='flex flex-col space-y-1'>
          <h3 className='font-semibold'>Allmänt</h3>
        </div>
        <div className='flex items-center gap-2 text-muted-foreground lg:col-span-2'>
          <Loader2Icon className='size-4 animate-spin' />
          Laddar...
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>Allmänt</h3>
        <p className='text-sm text-muted-foreground'>
          Namn och kontaktuppgifter.
        </p>
      </div>

      <div className='lg:col-span-2'>
        <div className='space-y-5'>
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
            <div className={fieldClassName}>
              <Label htmlFor='personal-info-first-name'>Förnamn</Label>
              <Input
                id='personal-info-first-name'
                placeholder='Förnamn'
                value={firstName}
                onChange={event => setFirstName(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div className={fieldClassName}>
              <Label htmlFor='personal-info-last-name'>Efternamn</Label>
              <Input
                id='personal-info-last-name'
                placeholder='Efternamn'
                value={surname}
                onChange={event => setSurname(event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div className={fieldClassName}>
            <Label htmlFor='personal-info-email'>E-post</Label>
            <div className='relative w-full'>
              <Input
                id='personal-info-email'
                name='email'
                type='email'
                placeholder='namn@exempel.se'
                autoComplete='email'
                inputMode='email'
                value={email}
                onChange={event => setEmail(event.target.value)}
                className={`${inputClassName} pr-36`}
              />
              {showEmailVerification ? (
                emailVerified ? (
                  <div className='pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1.5 text-sm font-medium text-green-700'>
                    <CheckCircle2Icon className='size-4' />
                    Verifierad
                  </div>
                ) : (
                  <button
                    type='button'
                    className='absolute inset-y-0 right-3 text-sm font-medium text-[#004225] hover:underline disabled:text-muted-foreground disabled:no-underline'
                    disabled={emailVerificationLoading}
                    onClick={startEmailVerification}
                  >
                    {emailVerificationLoading ? 'Skickar...' : 'Verifiera nu'}
                  </button>
                )
              ) : null}
            </div>
            {showEmailVerification && emailVerificationMessage ? (
              <p className='text-sm text-green-700'>{emailVerificationMessage}</p>
            ) : null}
          </div>

          <div className={fieldClassName}>
            <Label htmlFor='personal-info-mobile'>Telefonnummer</Label>
            <Input
              id='personal-info-mobile'
              name='phone'
              type='tel'
              placeholder='070-123 45 67'
              autoComplete='tel'
              inputMode='tel'
              value={phone}
              onChange={event =>
                setPhone(sanitizePhoneInput(event.target.value))
              }
              className={inputClassName}
            />
          </div>

          {error ? <p className='text-destructive text-sm'>{error}</p> : null}
        </div>
      </div>
    </div>
  )
})

PersonalInfo.displayName = 'PersonalInfo'

export default PersonalInfo
