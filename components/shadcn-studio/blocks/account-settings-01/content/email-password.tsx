'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'

import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { authService } from '@/services/auth-service'

export type PasswordSectionHandle = {
  save: () => Promise<void>
}

const requirements = [
  { regex: /.{12,}/, text: 'Minst 12 tecken' },
  { regex: /[a-z]/, text: 'Minst 1 liten bokstav' },
  { regex: /[A-Z]/, text: 'Minst 1 stor bokstav' },
  { regex: /[0-9]/, text: 'Minst 1 siffra' },
  {
    regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    text: 'Minst 1 specialtecken',
  },
]

const EmailPass = forwardRef<PasswordSectionHandle>((_, ref) => {
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false)
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')

  const strength = requirements.map(req => ({
    met: req.regex.test(password),
    text: req.text,
  }))

  const strengthScore = strength.filter(req => req.met).length

  const getColor = (score: number) => {
    if (score === 0) return 'bg-border'
    if (score <= 1) return 'bg-destructive'
    if (score <= 2) return 'bg-orange-500'
    if (score <= 3) return 'bg-amber-500'
    if (score === 4) return 'bg-yellow-400'

    return 'bg-green-500'
  }

  const getText = (score: number) => {
    if (score === 0) return 'Ange ett lösenord'
    if (score <= 2) return 'Svagt lösenord'
    if (score <= 3) return 'Medelstarkt lösenord'
    if (score === 4) return 'Starkt lösenord'

    return 'Mycket starkt lösenord'
  }

  const save = async () => {
    const trimmedCurrentPassword = currentPassword.trim()
    const trimmedNewPassword = password.trim()

    if (!trimmedCurrentPassword && !trimmedNewPassword) {
      return
    }

    if (!trimmedCurrentPassword || !trimmedNewPassword) {
      throw new Error('Fyll i både nuvarande och nytt lösenord.')
    }

    if (strengthScore < requirements.length) {
      throw new Error('Det nya lösenordet uppfyller inte alla krav.')
    }

    await authService.changePassword({
      currentPassword: trimmedCurrentPassword,
      newPassword: trimmedNewPassword,
    })

    setCurrentPassword('')
    setPassword('')
  }

  useImperativeHandle(ref, () => ({ save }), [
    currentPassword,
    password,
    strengthScore,
  ])

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>Lösenord och säkerhet</h3>
      </div>

      <div className='lg:col-span-2'>
        <div className='mx-auto space-y-6'>
          <div className='w-full space-y-2'>
            <Label htmlFor='current-password' className='gap-1'>
              Nuvarande lösenord<span className='text-destructive'>*</span>
            </Label>
            <div className='relative'>
              <Input
                id='current-password'
                type={isCurrentPasswordVisible ? 'text' : 'password'}
                placeholder='Nuvarande lösenord'
                value={currentPassword}
                onChange={event => setCurrentPassword(event.target.value)}
                className='pr-10'
                autoComplete='current-password'
                required
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() =>
                  setIsCurrentPasswordVisible(currentValue => !currentValue)
                }
                className='text-muted-foreground absolute inset-y-0 right-0 min-w-0 rounded-l-none rounded-r-md px-0 hover:bg-transparent'
              >
                {isCurrentPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>
                  {isCurrentPasswordVisible ? 'Dölj lösenord' : 'Visa lösenord'}
                </span>
              </Button>
            </div>
          </div>

          <div className='w-full space-y-2'>
            <Label htmlFor='new-password' className='gap-1'>
              Nytt lösenord<span className='text-destructive'>*</span>
            </Label>
            <div className='relative mb-3'>
              <Input
                id='new-password'
                type={isNewPasswordVisible ? 'text' : 'password'}
                placeholder='Nytt lösenord'
                value={password}
                onChange={event => setPassword(event.target.value)}
                className='pr-10'
                autoComplete='new-password'
                required
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() =>
                  setIsNewPasswordVisible(currentValue => !currentValue)
                }
                className='text-muted-foreground absolute inset-y-0 right-0 min-w-0 rounded-l-none rounded-r-md px-0 hover:bg-transparent'
              >
                {isNewPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>
                  {isNewPasswordVisible ? 'Dölj lösenord' : 'Visa lösenord'}
                </span>
              </Button>
            </div>

            <div className='mb-4 flex h-1 w-full gap-1'>
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-full flex-1 rounded-full transition-all duration-500 ease-out',
                    index < strengthScore ? getColor(strengthScore) : 'bg-border'
                  )}
                />
              ))}
            </div>

            <p className='text-foreground text-sm font-medium'>
              {getText(strengthScore)}. Måste innehålla:
            </p>

            <ul className='mb-4 space-y-1.5'>
              {strength.map((req, index) => (
                <li key={index} className='flex items-center gap-2'>
                  {req.met ? (
                    <CheckIcon className='size-4 text-green-600 dark:text-green-400' />
                  ) : (
                    <XIcon className='text-muted-foreground size-4' />
                  )}
                  <span
                    className={cn(
                      'text-xs',
                      req.met
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-muted-foreground'
                    )}
                  >
                    {req.text}
                    <span className='sr-only'>
                      {req.met ? ' - Krav uppfyllt' : ' - Krav inte uppfyllt'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
})

EmailPass.displayName = 'EmailPass'

export default EmailPass
