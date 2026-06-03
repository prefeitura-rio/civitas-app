'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { TICKET_MODULE_PERMISSIONS_COOKIE } from '@/http/tickets/ticket-module-permissions-me'

export async function logout() {
  cookies().delete('token')
  cookies().delete(TICKET_MODULE_PERMISSIONS_COOKIE)
  redirect('/auth/sign-in')
}
