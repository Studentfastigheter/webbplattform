'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon, Trash2Icon } from "@/components/icons"

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { useDeleteMe } from '@/features/auth/hooks/useAuthMutations'
import { useI18n } from '@/i18n/I18nProvider'
import { localizedText } from '@/i18n/text'

const DangerZone = () => {
  const router = useRouter()
  const { locale, localizedHref } = useI18n()
  const { logout } = useAuth()
  const deleteMe = useDeleteMe()
  const deleting = deleteMe.isPending
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    if (deleting) return

    setError(null)

    try {
      const result = await deleteMe.mutateAsync()

      if (
        result &&
        typeof result === 'object' &&
        'error' in result &&
        typeof result.error === 'string'
      ) {
        throw new Error(
          typeof result.message === 'string'
            ? result.message
            : localizedText(locale, 'Kontot kunde inte raderas.', 'The account could not be deleted.')
        )
      }

      logout()
      setOpen(false)
      router.replace(localizedHref('/'))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : localizedText(locale, 'Kontot kunde inte raderas.', 'The account could not be deleted.'))
    }
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>{localizedText(locale, 'Radera konto', 'Delete account')}</h3>
      </div>

      <div className='space-y-6 lg:col-span-2'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <span className='text-sm font-semibold text-gray-950'>
            {localizedText(locale, 'Radera konto', 'Delete account')}
          </span>

          <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
              if (deleting) return
              setOpen(nextOpen)
              if (!nextOpen) setError(null)
            }}
          >
            <DialogTrigger asChild>
              <Button
                type='button'
                variant='outline'
                className='rounded-md border-red-200 text-red-700 hover:bg-red-50 sm:w-auto'
              >
                <Trash2Icon className='size-4' />
                {localizedText(locale, 'Radera konto', 'Delete account')}
              </Button>
            </DialogTrigger>

            <DialogContent className='sm:max-w-md'>
              <DialogHeader className='space-y-2'>
                <DialogTitle>{localizedText(locale, 'Radera konto', 'Delete account')}</DialogTitle>
                <div className='text-muted-foreground text-sm'>
                  {localizedText(locale, 'Detta tar bort kontot permanent och går inte att ångra.', 'This permanently deletes the account and cannot be undone.')}
                </div>
              </DialogHeader>

              {error ? (
                <p className='text-sm text-destructive'>{error}</p>
              ) : null}

              <DialogFooter className='mt-4 gap-4 sm:justify-end'>
                <DialogClose asChild>
                  <Button
                    type='button'
                    variant='outline'
                    className='rounded-md'
                    isDisabled={deleting}
                  >
                    {localizedText(locale, 'Avbryt', 'Cancel')}
                  </Button>
                </DialogClose>
                <Button
                  type='button'
                  variant='destructive'
                  className='rounded-md'
                  isLoading={deleting}
                  isDisabled={deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? (
                    <>
                      <Loader2Icon className='size-4 animate-spin' />
                      {localizedText(locale, 'Raderar...', 'Deleting...')}
                    </>
                  ) : (
                    localizedText(locale, 'Radera konto', 'Delete account')
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export default DangerZone
