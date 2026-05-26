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
        <h3 className='font-semibold'>Danger Zone</h3>
        <p className='text-muted-foreground text-sm'>
          Delete your account permanently. This action will remove all your data
          and cannot be undone.{' '}
          <a href='#' className='text-card-foreground font-medium hover:underline'>
            Learn more
          </a>
        </p>
      </div>

      <div className='space-y-6 lg:col-span-2'>
        <Card>
          <CardContent>
            <div className='flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-start'>
              <div className='space-y-1'>
                <h3 className='text-sm font-medium'>Delete account</h3>
                <p className='text-muted-foreground text-sm'>
                  Delete your account permanently. This action will remove all
                  your data and cannot be undone.
                </p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    className='text-destructive border-destructive hover:bg-destructive/10 max-lg:w-full'
                  >
                    <Trash2Icon className='size-4' />
                    Delete
                  </Button>
                </DialogTrigger>

                <DialogContent className='sm:max-w-md'>
                  <DialogHeader className='space-y-2'>
                    <DialogTitle>Delete account</DialogTitle>
                    <div className='text-muted-foreground text-sm'>
                      Delete your account permanently. This action will remove
                      all your data and cannot be undone.
                    </div>
                  </DialogHeader>

                  <DialogFooter className='mt-4 gap-4 sm:justify-end'>
                    <DialogClose asChild>
                      <Button type='button' variant='outline' className='rounded-md'>
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        type='button'
                        variant='destructive'
                        className='rounded-md'
                      >
                        Delete
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
