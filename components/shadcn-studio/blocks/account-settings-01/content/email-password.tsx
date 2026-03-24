'use client'

import { useState } from 'react'

import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  XIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const requirements = [
  { regex: /.{12,}/, text: 'At least 12 characters' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
  { regex: /[0-9]/, text: 'At least 1 number' },
  {
    regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    text: 'At least 1 special character',
  },
]

const EmailPass = () => {
  const { user } = useAuth()
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false)
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
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
    if (score === 0) return 'Enter a password'
    if (score <= 2) return 'Weak password'
    if (score <= 3) return 'Medium password'
    if (score === 4) return 'Strong password'

    return 'Very strong password'
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>E-post & Lösenord</h3>
        <p className='text-muted-foreground text-sm'>
          Hantera din e-post och ditt lösenord.
        </p>
      </div>

      <div className='lg:col-span-2'>
        <form className='mx-auto space-y-6'>
          <div className='w-full space-y-2'>
            <Label htmlFor='email' className='gap-1'>
              Email<span className='text-destructive'>*</span>
            </Label>
            <div className='relative'>
              <Input
                id='email'
                type='email'
                placeholder='E-postadress'
                defaultValue={user?.email ?? ''}
                className='peer pr-9'
                disabled
              />
              <div className='text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50'>
                <MailIcon className='size-4' />
                <span className='sr-only'>Email</span>
              </div>
            </div>
          </div>

          <div className='w-full space-y-2'>
            <Label htmlFor='current-password' className='gap-1'>
              Current Password<span className='text-destructive'>*</span>
            </Label>
            <div className='relative'>
              <Input
                id='current-password'
                type={isCurrentPasswordVisible ? 'text' : 'password'}
                placeholder='Password'
                className='pr-10'
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
                  {isCurrentPasswordVisible ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </div>

          <div className='w-full space-y-2'>
            <Label htmlFor='new-password' className='gap-1'>
              New Password<span className='text-destructive'>*</span>
            </Label>
            <div className='relative mb-3'>
              <Input
                id='new-password'
                type={isNewPasswordVisible ? 'text' : 'password'}
                placeholder='Password'
                value={password}
                onChange={event => setPassword(event.target.value)}
                className='pr-10'
                required
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setIsNewPasswordVisible(currentValue => !currentValue)}
                className='text-muted-foreground absolute inset-y-0 right-0 min-w-0 rounded-l-none rounded-r-md px-0 hover:bg-transparent'
              >
                {isNewPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>
                  {isNewPasswordVisible ? 'Hide password' : 'Show password'}
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
              {getText(strengthScore)}. Must contain:
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
                      {req.met
                        ? ' - Requirement met'
                        : ' - Requirement not met'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className='mt-6 flex justify-end'>
            <Button type='submit' className='max-sm:w-full rounded-md'>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmailPass
