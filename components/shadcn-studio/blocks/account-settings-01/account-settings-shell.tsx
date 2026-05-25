'use client'

import UserGeneral, {
  type UserGeneralOptions,
} from '@/components/shadcn-studio/blocks/account-settings-01/account-settings-01'

const AccountSettingsShell = ({
  generalOptions,
  showVerification = false,
}: {
  generalOptions?: UserGeneralOptions
  showVerification?: boolean
}) => {
  return (
    <div className='w-full py-8'>
      <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold tracking-normal text-gray-950'>
            Inställningar
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Uppdatera profil, verifiering och kontosäkerhet.
          </p>
        </div>

        <UserGeneral
          options={{
            ...generalOptions,
            showVerification,
          }}
        />
      </div>
    </div>
  )
}

export default AccountSettingsShell
