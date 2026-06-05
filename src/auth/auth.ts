import { cookies } from 'next/headers'

import { getSessionCookieName, isValidSession } from './session'

export function isAuthenticated() {
  const sessionValue = cookies().get(getSessionCookieName())?.value
  return isValidSession(sessionValue)
}
