'use client'

import { useRef, useState } from 'react'
import { CheckIcon, Loader2Icon, SaveIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import DangerZone from '@/components/shadcn-studio/blocks/account-settings-01/content/danger-zone'
import EmailPass from '@/components/shadcn-studio/blocks/account-settings-01/content/email-password'
import PersonalInfo, {
  type PersonalInfoHandle,
  type PersonalInfoOptions,
} from '@/components/shadcn-studio/blocks/account-settings-01/content/personal-info'
import SocialUrl, {
  type SocialUrlHandle,
} from '@/components/shadcn-studio/blocks/account-settings-01/content/social-url'

export type UserGeneralOptions = {
  personalInfo?: PersonalInfoOptions
  showSocialUrls?: boolean
  showDangerZone?: boolean
}

const UserGeneral = ({ options = {} }: { options?: UserGeneralOptions }) => {
  const showSocialUrls = options.showSocialUrls ?? true
  const showDangerZone = options.showDangerZone ?? true
  const personalInfoRef = useRef<PersonalInfoHandle>(null)
  const socialUrlRef = useRef<SocialUrlHandle>(null)
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

      if (showSocialUrls) {
        await socialUrlRef.current?.save()
      }

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
      <div className='mx-auto max-w-7xl'>
        <PersonalInfo ref={personalInfoRef} options={options.personalInfo} />
        <Separator className='my-10' />
        <EmailPass />
        {showSocialUrls ? (
          <>
            <Separator className='my-10' />
            <SocialUrl ref={socialUrlRef} />
          </>
        ) : null}
        <Separator className='my-10' />
        {error ? <p className='mb-3 text-sm text-destructive'>{error}</p> : null}
        {success ? (
          <p className='mb-3 flex items-center gap-1 text-sm text-green-600'>
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
        {showDangerZone ? (
          <>
            <Separator className='my-10' />
            <DangerZone />
          </>
        ) : null}
      </div>
    </section>
  )
}

export default UserGeneral
