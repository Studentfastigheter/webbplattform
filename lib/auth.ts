import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { FormState } from 'react-hook-form'

import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
 
export async function signup(state: FormState<boolean[]>, formData: FormData) {
  // Previous steps:
  // 1. Validate form fields
  // 2. Prepare data for insertion into database
  // 3. Insert the user into the database or call an Library API
 
  // Current steps:
  // 4. Create user session

  const user = { id: 'user-id-from-db' }
  await createSession(user.id)
  // 5. Redirect user
  redirect('/profile')
}


export async function updateSession() {
  const session = (await cookies()).get('session')?.value
  const payload = await decrypt(session)
 
  if (!session || !payload) {
    return null
  }
 
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
 
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}