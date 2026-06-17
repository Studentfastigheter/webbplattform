'use client'

import UserGeneral, {
  type UserGeneralOptions,
} from '@/components/shadcn-studio/blocks/account-settings-01/account-settings-01'
import { useI18n } from '@/i18n/I18nProvider'
import { localizedText } from '@/i18n/text'

const AccountSettingsShell = ({
  generalOptions,
  showVerification = false,
}: {
  generalOptions?: UserGeneralOptions
  showVerification?: boolean
}) => {
  const { locale } = useI18n()

  return (
    <div className='w-full py-8'>
      <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold tracking-normal text-gray-950'>
            {localizedText(locale, 'Inställningar', 'Settings')}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            {localizedText(locale, 'Uppdatera profil, verifiering och kontosäkerhet.', 'Update profile, verification and account security.')}
          </p>
        </div>

        <div className='rounded-[8px] border border-gray-200 bg-white p-4 shadow-theme-xs sm:p-6'>
          <UserGeneral
            options={{
              ...generalOptions,
              showVerification,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default AccountSettingsShell
