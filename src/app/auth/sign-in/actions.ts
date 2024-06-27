'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'

import { signIn } from '@/http/auth/sign-in'
import { genericErrorMessage, isValidationError } from '@/utils/error-handlers'

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
      data: { access_token: accessToken },
    } = await signIn({
      username,
      password,
    })

    cookies().set('token', accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  } catch (err) {
    console.error(err)
    // if (err instanceof HTTPError) {
    //   const { message } = await err.response.json()

    //   return { success: false, message, errors: null }
    // }

    const errorMessage = isValidationError(err)
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
