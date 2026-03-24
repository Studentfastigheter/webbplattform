import { Separator } from '@/components/ui/separator'

import DangerZone from '@/components/shadcn-studio/blocks/account-settings-01/content/danger-zone'
import EmailPass from '@/components/shadcn-studio/blocks/account-settings-01/content/email-password'
import PersonalInfo from '@/components/shadcn-studio/blocks/account-settings-01/content/personal-info'
import SocialUrl from '@/components/shadcn-studio/blocks/account-settings-01/content/social-url'

const UserGeneral = () => {
  return (
    <section className='py-3'>
      <div className='mx-auto max-w-7xl'>
        <PersonalInfo />
        <Separator className='my-10' />
        <EmailPass />
        <Separator className='my-10' />
        <SocialUrl />
        <Separator className='my-10' />
        <DangerZone />
      </div>
    </section>
  )
}

export default UserGeneral
