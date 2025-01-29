'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_EXPIRATION_DATE_COOKIE,
} from '@/lib/api'

export async function logout() {
  const cookieStore = await cookies()

  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(ACCESS_TOKEN_EXPIRATION_DATE_COOKIE)

  redirect('/auth/sign-in')
}
