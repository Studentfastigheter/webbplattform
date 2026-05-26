import { Trash2Icon } from 'lucide-react'

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

const DangerZone = () => {
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
                Delete account
              </span>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    className='rounded-md border-red-200 text-red-700 hover:bg-red-50 sm:w-auto'
                  >
                    <Trash2Icon className='size-4' />
                    Delete account
                  </Button>
                </DialogTrigger>

                <DialogContent className='sm:max-w-md'>
                  <DialogHeader className='space-y-2'>
                    <DialogTitle>Delete account</DialogTitle>
                    <div className='text-muted-foreground text-sm'>
                      Detta tar bort kontot permanent och går inte att ångra.
                    </div>
                  </DialogHeader>

                  <DialogFooter className='mt-4 gap-4 sm:justify-end'>
                    <DialogClose asChild>
                      <Button type='button' variant='outline' className='rounded-md'>
                        Avbryt
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        type='button'
                        variant='destructive'
                        className='rounded-md'
                      >
                        Delete account
                      </Button>
                    </DialogClose>
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
