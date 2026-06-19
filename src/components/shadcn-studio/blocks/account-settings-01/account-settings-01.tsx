'use client'

import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { CheckIcon, Loader2Icon, SaveIcon } from "@/components/icons"

import { Button } from '@/components/ui/button'

import AccountPermission from '@/components/shadcn-studio/blocks/account-settings-01/content/account-permission'
import DangerZone from '@/components/shadcn-studio/blocks/account-settings-01/content/danger-zone'
import PasswordSection from '@/components/shadcn-studio/blocks/account-settings-01/content/email-password'
import IdentityVerification from '@/components/shadcn-studio/blocks/account-settings-01/content/identity-verification'
import PersonalInfo, {
  type PersonalInfoHandle,
  type PersonalInfoOptions,
} from '@/components/shadcn-studio/blocks/account-settings-01/content/personal-info'
import { useI18n } from '@/i18n/I18nProvider'
import { localizedText } from '@/i18n/text'

export type UserGeneralOptions = {
  personalInfo?: PersonalInfoOptions
  showDangerZone?: boolean
  showVerification?: boolean
  showAccountPermission?: boolean
}

const UserGeneral = ({
  options = {},
  children,
}: {
  options?: UserGeneralOptions
  children?: ReactNode
}) => {
  const { locale } = useI18n()
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
        err instanceof Error ? err.message : localizedText(locale, 'Kunde inte spara ändringar.', 'Could not save changes.')
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className='divide-y divide-gray-100'>
      <div className='pb-6'>
        <PersonalInfo
          ref={personalInfoRef}
          options={{
            ...options.personalInfo,
            showEmailVerification: showVerification,
          }}
        />

        <div className='mt-6 grid grid-cols-1 gap-10 lg:grid-cols-3'>
          <div className='hidden lg:block' />
          <div className='flex flex-col gap-3 lg:col-span-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0 flex-1'>
              {error ? <p className='text-sm text-destructive'>{error}</p> : null}
              {success ? (
                <p className='flex items-center gap-1 text-sm text-green-600'>
                  <CheckIcon className='size-4' />
                  {localizedText(locale, 'Ändringar sparade!', 'Changes saved!')}
                </p>
              ) : null}
            </div>

            <Button
              type='button'
              className='max-sm:w-full rounded-md'
              isDisabled={saving}
              onClick={handleSaveAll}
            >
              {saving ? (
                <>
                  <Loader2Icon className='size-4 animate-spin' />
                  {localizedText(locale, 'Sparar...', 'Saving...')}
                </>
              ) : (
                <>
                  <SaveIcon className='size-4' />
                  {localizedText(locale, 'Spara ändringar', 'Save changes')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {options.showAccountPermission ? (
        <div className='py-6'>
          <AccountPermission />
        </div>
      ) : null}

      {showVerification ? (
        <div className='py-6'>
          <IdentityVerification enabled={showVerification} />
        </div>
      ) : null}

      {children ? <div className='py-6'>{children}</div> : null}

      <div className='py-6'>
        <PasswordSection />
      </div>

      {showDangerZone ? (
        <div className='pt-6'>
          <DangerZone />
        </div>
      ) : null}
    </section>
  )
}

export default UserGeneral
