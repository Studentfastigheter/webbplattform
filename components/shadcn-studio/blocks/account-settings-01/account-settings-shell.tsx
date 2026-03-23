'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import UserGeneral from '@/components/shadcn-studio/blocks/account-settings-01/account-settings-01'

const tabs = [
  { name: 'General', value: 'general' },
  { name: 'Preferences', value: 'preferences' },
]

function PlaceholderPanel({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card className='gap-0'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-sm'>
          This tab is ready for additional account settings content.
        </p>
      </CardContent>
    </Card>
  )
}

const AccountSettingsShell = () => {
  return (
    <div className='w-full py-8'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <Tabs defaultValue='general' className='gap-4'>
          <TabsList className='h-auto w-full justify-start rounded-none border-b bg-transparent p-0'>
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='data-[state=active]:border-primary data-[state=active]:text-foreground flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='general' className='mt-4'>
            <UserGeneral />
          </TabsContent>

          <TabsContent value='preferences' className='mt-4'>
            <PlaceholderPanel
              title='Preferences'
              description='Manage language, notifications, and personal defaults.'
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AccountSettingsShell
