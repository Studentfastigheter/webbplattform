'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { authService } from '@/features/auth/services/auth-service'

const DangerZone = () => {
  const router = useRouter()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    if (deleting) return

    setDeleting(true)
    setError(null)

    try {
      const result = await authService.deleteMe()

      if (
        result &&
        typeof result === 'object' &&
        'error' in result &&
        typeof result.error === 'string'
      ) {
        throw new Error(
          typeof result.message === 'string'
            ? result.message
            : 'Kontot kunde inte raderas.'
        )
      }

      logout()
      setOpen(false)
      router.replace('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kontot kunde inte raderas.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>Radera konto</h3>
      </div>

      <div className='space-y-6 lg:col-span-2'>
        <Card className='rounded-[8px] border-gray-200 shadow-none'>
          <CardContent className='px-4 py-3'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span className='text-sm font-semibold text-gray-950'>
                Radera konto
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
                    Radera konto
                  </Button>
                </DialogTrigger>

                <DialogContent className='sm:max-w-md'>
                  <DialogHeader className='space-y-2'>
                    <DialogTitle>Radera konto</DialogTitle>
                    <div className='text-muted-foreground text-sm'>
                      Detta tar bort kontot permanent och går inte att ångra.
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
                        Avbryt
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
                          Raderar...
                        </>
                      ) : (
                        'Radera konto'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DangerZone
