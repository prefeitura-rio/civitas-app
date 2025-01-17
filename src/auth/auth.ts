import { cookies } from 'next/headers'

import { ACCESS_TOKEN_COOKIE } from '@/lib/api'

export async function hasAccessToken() {
  const cookieStore = await cookies()
  return !!cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
}
