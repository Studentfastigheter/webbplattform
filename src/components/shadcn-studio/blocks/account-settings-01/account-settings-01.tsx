'use client'

import { useRef, useState } from 'react'
import { CheckIcon, Loader2Icon, SaveIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import DangerZone from '@/components/shadcn-studio/blocks/account-settings-01/content/danger-zone'
import PasswordSection from '@/components/shadcn-studio/blocks/account-settings-01/content/email-password'
import IdentityVerification from '@/components/shadcn-studio/blocks/account-settings-01/content/identity-verification'
import PersonalInfo, {
  type PersonalInfoHandle,
  type PersonalInfoOptions,
} from '@/components/shadcn-studio/blocks/account-settings-01/content/personal-info'

export type UserGeneralOptions = {
  personalInfo?: PersonalInfoOptions
  showDangerZone?: boolean
  showVerification?: boolean
}

const UserGeneral = ({ options = {} }: { options?: UserGeneralOptions }) => {
  const showDangerZone = options.showDangerZone ?? true
  const showVerification = options.showVerification ?? false
  const personalInfoRef = useRef<PersonalInfoHandle>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSaveAll = async () => {
    if (saving) return

    setSaving(true)
    setSuccess(false)
    setError(null)

    try {
      await personalInfoRef.current?.save()

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kunde inte spara ändringar.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className='py-3'>
      <div className='mx-auto max-w-5xl space-y-8'>
        <PersonalInfo
          ref={personalInfoRef}
          options={{
            ...options.personalInfo,
            showEmailVerification: showVerification,
          }}
        />

        {error ? <p className='text-sm text-destructive'>{error}</p> : null}
        {success ? (
          <p className='flex items-center gap-1 text-sm text-green-600'>
            <CheckIcon className='size-4' />
            Ändringar sparade!
          </p>
        ) : null}

        <div className='flex justify-end'>
          <Button
            type='button'
            className='max-sm:w-full rounded-md'
            isDisabled={saving}
            onClick={handleSaveAll}
          >
            {saving ? (
              <>
                <Loader2Icon className='size-4 animate-spin' />
                Sparar...
              </>
            ) : (
              <>
                <SaveIcon className='size-4' />
                Spara ändringar
              </>
            )}
          </Button>
        </div>

        <Separator />
        <IdentityVerification enabled={showVerification} />
        <PasswordSection />

        {showDangerZone ? (
          <>
            <Separator />
            <DangerZone />
          </>
        ) : null}
      </div>
    </section>
  )
}

export default UserGeneral
