'use client'

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'

import { CheckIcon, ImageIcon, Loader2Icon, TrashIcon, UploadCloudIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'

const PersonalInfo = () => {
  const { user, isLoading: authLoading, updateUser } = useAuth()

  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [aboutText, setAboutText] = useState('')

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate fields when user data loads
  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setSurname(user.surname ?? '')
    setPhone(user.phone ?? '')
    setCity(user.city ?? '')
    setAboutText(user.description ?? '')
  }, [user])

  // Avatar preview
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
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      window.alert('Välj en bildfil')
      event.currentTarget.value = ''
      return
    }

    if (selectedFile.size > 1024 * 1024) {
      window.alert('Filen måste vara mindre än 1 MB')
      event.currentTarget.value = ''
      return
    }

    setFile(selectedFile)
  }

  const openPicker = () => inputRef.current?.click()

  const removeAvatar = () => {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateUser({
        firstName: firstName.trim() || undefined,
        surname: surname.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        aboutText: aboutText.trim() || undefined,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kunde inte spara ändringar.'
      )
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = preview ?? user?.logoUrl ?? null

  if (authLoading) {
    return (
      <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
        <div className='flex flex-col space-y-1'>
          <h3 className='font-semibold'>Personlig information</h3>
        </div>
        <div className='flex items-center gap-2 text-muted-foreground lg:col-span-2'>
          <Loader2Icon className='size-4 animate-spin' />
          Laddar...
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='font-semibold'>Personlig information</h3>
        <p className='text-muted-foreground text-sm'>
          Hantera din personliga information.
        </p>
      </div>

      <div className='space-y-6 lg:col-span-2'>
        <form onSubmit={handleSubmit} className='mx-auto space-y-6'>
          {/* Avatar */}
          <div className='w-full space-y-2'>
            <Label>Profilbild</Label>
            <div className='flex flex-wrap items-center gap-4'>
              <div
                role='button'
                tabIndex={0}
                aria-label='Ladda upp profilbild'
                onClick={openPicker}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openPicker()
                  }
                }}
                className='flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed hover:opacity-95'
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt='Profilbild'
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
                  Ladda upp
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  className='text-destructive min-w-0 rounded-md px-3'
                  onClick={removeAvatar}
                  isDisabled={!file && !avatarSrc}
                >
                  <TrashIcon className='size-4' />
                </Button>
              </div>
            </div>
            <p className='text-muted-foreground text-sm'>Max 1 MB.</p>
          </div>

          {/* Fields */}
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='personal-info-first-name'>Förnamn</Label>
              <Input
                id='personal-info-first-name'
                placeholder='Förnamn'
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>

            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='personal-info-last-name'>Efternamn</Label>
              <Input
                id='personal-info-last-name'
                placeholder='Efternamn'
                value={surname}
                onChange={e => setSurname(e.target.value)}
              />
            </div>

            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='personal-info-mobile'>Telefon</Label>
              <Input
                id='personal-info-mobile'
                type='tel'
                placeholder='070-123 45 67'
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='personal-info-city'>Stad</Label>
              <Input
                id='personal-info-city'
                placeholder='Stockholm'
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className='flex flex-col items-start gap-2'>
            <Label htmlFor='personal-info-about'>Om mig</Label>
            <Textarea
              id='personal-info-about'
              placeholder='Berätta lite om dig själv...'
              rows={4}
              value={aboutText}
              onChange={e => setAboutText(e.target.value)}
            />
          </div>

          {/* Feedback */}
          {error && (
            <p className='text-destructive text-sm'>{error}</p>
          )}
          {success && (
            <p className='flex items-center gap-1 text-sm text-green-600'>
              <CheckIcon className='size-4' />
              Ändringar sparade!
            </p>
          )}

          <div className='flex justify-end'>
            <Button
              type='submit'
              className='max-sm:w-full rounded-md'
              isDisabled={saving}
            >
              {saving ? (
                <>
                  <Loader2Icon className='size-4 animate-spin' />
                  Sparar...
                </>
              ) : (
                'Spara ändringar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PersonalInfo
