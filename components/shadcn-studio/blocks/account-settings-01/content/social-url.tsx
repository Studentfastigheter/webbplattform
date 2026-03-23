'use client'

import { useState } from 'react'

import { PlusIcon, SaveIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SocialPlatform = 'instagram' | 'facebook' | 'linkedin'

interface SocialProfileRow {
  id: string
  platform: SocialPlatform
  url: string
}

const socialPlatforms: Array<{
  value: SocialPlatform
  label: string
}> = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
]

const initialRows: SocialProfileRow[] = [
  {
    id: 'instagram-row',
    platform: 'instagram',
    url: 'https://instagram.com/yourprofile',
  },
]

const SocialUrl = () => {
  const [rows, setRows] = useState<SocialProfileRow[]>(initialRows)

  const getAvailablePlatforms = (currentId: string) => {
    const selectedPlatforms = rows
      .filter(row => row.id !== currentId)
      .map(row => row.platform)

    return socialPlatforms.filter(
      platform => !selectedPlatforms.includes(platform.value)
    )
  }

  const addRow = () => {
    if (rows.length >= socialPlatforms.length) {
      return
    }

    const usedPlatforms = new Set(rows.map(row => row.platform))
    const nextPlatform = socialPlatforms.find(
      platform => !usedPlatforms.has(platform.value)
    )

    if (!nextPlatform) {
      return
    }

    setRows(prev => [
      ...prev,
      {
        id: `${nextPlatform.value}-${Date.now()}`,
        platform: nextPlatform.value,
        url: '',
      },
    ])
  }

  const updatePlatform = (rowId: string, platform: SocialPlatform) => {
    setRows(prev =>
      prev.map(row => (row.id === rowId ? { ...row, platform } : row))
    )
  }

  const updateUrl = (rowId: string, url: string) => {
    setRows(prev => prev.map(row => (row.id === rowId ? { ...row, url } : row)))
  }

  const removeRow = (rowId: string) => {
    setRows(prev => prev.filter(row => row.id !== rowId))
  }

  const saveChanges = () => {
    setRows(prev =>
      prev.map(row => ({
        ...row,
        url: row.url.trim(),
      }))
    )
  }

  const canAddMore = rows.length < socialPlatforms.length

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col'>
        <h3 className='text-foreground font-semibold'>Social URLs</h3>
        <p className='text-muted-foreground text-sm'>
          Add one profile per channel and manage them in a single list.
        </p>
      </div>

      <div className='space-y-6 lg:col-span-2'>
        <div className='space-y-4'>
          <div className='space-y-3'>
            {rows.map(row => {
              const availablePlatforms = getAvailablePlatforms(row.id)

              return (
                <div
                  key={row.id}
                  className='grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end'
                >
                  <Select
                    value={row.platform}
                    onValueChange={value =>
                      updatePlatform(row.id, value as SocialPlatform)
                    }
                  >
                    <SelectTrigger id={`platform-${row.id}`} className='w-full'>
                      <SelectValue placeholder='Select platform' />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlatforms.map(platform => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    id={`url-${row.id}`}
                    type='url'
                    placeholder='https://...'
                    value={row.url}
                    onChange={event => updateUrl(row.id, event.target.value)}
                  />

                  <Button
                    type='button'
                    variant='ghost'
                    className='text-muted-foreground min-w-0 px-3 sm:self-end'
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove ${row.platform} profile`}
                  >
                    <XIcon className='size-4' />
                  </Button>
                </div>
              )
            })}
          </div>

          <Button
            type='button'
            variant='outline'
            className='border-border'
            onClick={addRow}
            isDisabled={!canAddMore}
          >
            <PlusIcon className='size-4' />
            Add profile
          </Button>

          {!canAddMore ? (
            <p className='text-muted-foreground text-sm'>
              You can only add one profile per channel.
            </p>
          ) : null}
        </div>

        <div className='flex justify-end'>
          <Button type='button' onClick={saveChanges}>
            <SaveIcon className='size-4' />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SocialUrl
