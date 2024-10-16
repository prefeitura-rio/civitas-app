'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'

import { signIn } from '@/http/auth/sign-in'
import { isApiError } from '@/lib/api'
import { genericErrorMessage, isGrantError } from '@/utils/error-handlers'

const signInSchema = z.object({
  username: z.string().min(1, { message: 'Campo obrigatório.' }),
  password: z.string().min(1, { message: 'Campo obrigatório.' }),
})

export async function signInAction(data: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors

    return { success: false, message: null, errors }
  }

  const { username, password } = result.data

  try {
    const {
      data: { access_token: accessToken, expires_in: expiresIn },
    } = await signIn({
      username,
      password,
    })

    cookies().set('token', accessToken, {
      path: '/',
      maxAge: expiresIn,
    })
  } catch (err) {
    // Log error
    if (isApiError(err)) {
      const data = err.response?.config.data
        .replace(/(?<=username=).*?(?=&)/, '[REDACTED]')
        .replace(/(?<=password=).*/, '[REDACTED]')

      const copy = {
        ...err,
        response: {
          ...err.response,
          config: {
            ...err.response?.config,
            data,
          },
        },
      }

      console.error(copy)
    } else {
      console.error(err)
    }

    const errorMessage = isGrantError(err)
      ? 'Credenciais inválidas'
      : genericErrorMessage

    return {
      success: false,
      message: errorMessage,
      errors: null,
    }
  }

  return { success: true, message: null, errors: null }
}
