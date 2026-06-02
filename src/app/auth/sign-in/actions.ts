'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'

import {
  buildSessionFromTokenResponse,
  serializeAccessToken,
  serializeSession,
} from '@/auth/session'
import { config, getServerConfig } from '@/config'
import {
  TICKET_MODULE_PERMISSIONS_COOKIE,
  TICKET_MODULE_PERMISSIONS_PATH,
} from '@/http/tickets/ticket-module-permissions-me'
import { genericErrorMessage } from '@/utils/error-handlers'

const signInSchema = z.object({
  username: z.string().min(1, { message: 'Campo obrigatório.' }),
  password: z.string().min(1, { message: 'Campo obrigatório.' }),
  rememberMe: z
    .union([z.literal('on'), z.literal('true'), z.undefined()])
    .transform((value) => value === 'on' || value === 'true'),
})

export async function signInAction(data: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors

    return { success: false, message: null, errors }
  }

  const { username, password, rememberMe } = result.data

  try {
    const serverConfig = getServerConfig()
    const response = await fetch(
      `${config.apiUrl}${serverConfig.authTokenPath}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      return {
        success: false,
        message: 'Credenciais inválidas',
        errors: null,
      }
    }

    const tokens = (await response.json()) as {
      access_token: string
      expires_in: number
    }

    const session = buildSessionFromTokenResponse(
      tokens,
      { username, password },
      rememberMe,
    )
    const sessionCookie = serializeSession(session)
    const accessTokenCookie = serializeAccessToken(session)

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.options,
    )
    cookies().set(
      accessTokenCookie.name,
      accessTokenCookie.value,
      accessTokenCookie.options,
    )

    try {
      const permRes = await fetch(
        `${config.apiUrl}${TICKET_MODULE_PERMISSIONS_PATH}`,
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        },
      )
      if (permRes.ok) {
        const body = await permRes.text()
        cookies().set(TICKET_MODULE_PERMISSIONS_COOKIE, body, {
          path: '/',
          maxAge: tokens.expires_in,
        })
      }
    } catch {
      // Keep login successful even if permissions endpoint fails.
    }
  } catch (err) {
    console.error(err)

    return {
      success: false,
      message: genericErrorMessage,
      errors: null,
    }
  }

  return { success: true, message: null, errors: null }
}
