'use server'

import { isAxiosError } from 'axios'
import { cookies } from 'next/headers'
import { z } from 'zod'

import type { FormState } from '@/hooks/use-form-state'
import { signIn } from '@/http/auth/sign-in'
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_EXPIRATION_DATE_COOKIE,
} from '@/lib/api'
import { GENERIC_ERROR_MESSAGE, isGrantError } from '@/utils/error-handlers'

const signInFormSchema = z.object({
  username: z.string().min(1, { message: 'Campo obrigatório.' }),
  password: z.string().min(1, { message: 'Campo obrigatório.' }),
})

export type SignInForm = z.infer<typeof signInFormSchema>

function treatError(err: unknown) {
  // Log error
  if (isAxiosError(err)) {
    const data = '[REDACTED]'

    const copy = {
      ...err,
      config: {
        ...err.config,
        data,
      },
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

  let message = {
    title: GENERIC_ERROR_MESSAGE,
    description: null as string | null,
  }

  if (isGrantError(err)) {
    message = {
      title: 'Credenciais inválidas',
      description: null,
    }
  }

  return {
    success: false,
    message,
  }
}

export async function signInAction(data: FormData) {
  const result = signInFormSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors

    return {
      success: false,
      errors,
      message: {
        title: 'Erro ao preencher formulário!',
        description: 'Verifique os campos destacados.',
      },
    } as FormState
  }

  const { username, password } = result.data

  try {
    const { access_token: accessToken, expires_in: tokenExpireMinutes } =
      await signIn({
        username,
        password,
      })

    const expirationTime = Date.now() + 1000 * 60 * tokenExpireMinutes // In miliseconds

    const cookieStore = await cookies()
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      path: '/',
      expires: new Date(expirationTime),
    })

    cookieStore.set(
      ACCESS_TOKEN_EXPIRATION_DATE_COOKIE,
      new Date(expirationTime).toISOString(),
      {
        path: '/',
        expires: new Date(expirationTime),
      },
    )

    return {
      success: true,
      data: null,
    } as FormState
  } catch (err) {
    const response = treatError(err)

    return {
      success: response.success,
      message: {
        title: response.message.description
          ? `${response.message.title} ${response.message.description}`
          : response.message.title,
      },
    } as FormState
  }
}
