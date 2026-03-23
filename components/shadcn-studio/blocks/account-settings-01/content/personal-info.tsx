'use client'

import { type ChangeEvent, useEffect, useRef, useState } from 'react'

import { ImageIcon, TrashIcon, UploadCloudIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const countries = [
  {
    value: 'india',
    label: 'India',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/india.png',
  },
  {
    value: 'china',
    label: 'China',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/china.png',
  },
  {
    value: 'monaco',
    label: 'Monaco',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/monaco.png',
  },
  {
    value: 'serbia',
    label: 'Serbia',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/serbia.png',
  },
  {
    value: 'romania',
    label: 'Romania',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/romania.png',
  },
  {
    value: 'mayotte',
    label: 'Mayotte',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/mayotte.png',
  },
  {
    value: 'iraq',
    label: 'Iraq',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/iraq.png',
  },
  {
    value: 'syria',
    label: 'Syria',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/syria.png',
  },
  {
    value: 'korea',
    label: 'Korea',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/korea.png',
  },
  {
    value: 'zimbabwe',
    label: 'Zimbabwe',
    flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/zimbabwe.png',
  },
]

const PersonalInfo = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      const timeoutId = window.setTimeout(() => setPreview(null), 0)

      return () => clearTimeout(timeoutId)
    }

    const url = URL.createObjectURL(file)
    const timeoutId = window.setTimeout(() => setPreview(url), 0)

    return () => {
      clearTimeout(timeoutId)
      URL.revokeObjectURL(url)
    }
  }, [file])

  const onSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    if (!selectedFile.type.startsWith('image/')) {
      window.alert('Please select an image file')
      event.currentTarget.value = ''
      return
    }

    if (selectedFile.size > 1024 * 1024) {
      window.alert('File must be smaller than 1MB')
      event.currentTarget.value = ''
      return
    }

    setFile(selectedFile)
  }

  const openPicker = () => inputRef.current?.click()

  const remove = () => {
    setFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>Personal Information</h3>
        <p className='text-muted-foreground text-sm'>
          Manage your personal information and role.
        </p>
      </div>

      <div className='space-y-6 lg:col-span-2'>
        <form className='mx-auto space-y-6'>
          <div className='w-full space-y-2'>
            <Label>Your Avatar</Label>
            <div className='flex flex-wrap items-center gap-4'>
              <div
                role='button'
                tabIndex={0}
                aria-label='Upload your avatar'
                onClick={openPicker}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openPicker()
                  }
                }}
                className='flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed hover:opacity-95'
              >
                {preview ? (
                  <img
                    src={preview}
                    alt='Avatar preview'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <ImageIcon className='text-muted-foreground size-5' />
                )}
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                <input
                  ref={inputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={onSelect}
                />
                <Button
                  type='button'
                  variant='outline'
                  className='rounded-md'
                  onClick={openPicker}
                >
                  <UploadCloudIcon className='size-4' />
                  Upload avatar
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  className='text-destructive min-w-0 rounded-md px-3'
                  onClick={remove}
                  isDisabled={!file}
                >
                  <TrashIcon className='size-4' />
                </Button>
              </div>
            </div>
            <p className='text-muted-foreground text-sm'>Pick a photo up to 1MB.</p>
          </div>

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='personal-info-first-name'>First Name</Label>
              <Input id='personal-info-first-name' placeholder='John' />
            </div>

            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='personal-info-last-name'>Last Name</Label>
              <Input id='personal-info-last-name' placeholder='Doe' />
            </div>

            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='personal-info-mobile'>Mobile</Label>
              <Input
                id='personal-info-mobile'
                type='tel'
                placeholder='+1 (555) 123-4567'
              />
            </div>

            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='country'>Country</Label>
              <Select>
                <SelectTrigger id='country' className='w-full'>
                  <SelectValue placeholder='Select country' />
                </SelectTrigger>
                <SelectContent className='max-h-96'>
                  {countries.map(country => (
                    <SelectItem key={country.value} value={country.value}>
                      <img
                        src={country.flag}
                        alt={`${country.label} flag`}
                        className='h-4 w-5 rounded-[2px] object-cover'
                      />
                      <span className='truncate'>{country.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='gender'>Gender</Label>
              <Select>
                <SelectTrigger id='gender' className='w-full'>
                  <SelectValue placeholder='Select a gender' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Select>
                <SelectTrigger id='role' className='w-full'>
                  <SelectValue placeholder='Select a role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='user'>User</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex justify-end'>
            <Button type='submit' className='max-sm:w-full rounded-md'>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PersonalInfo
