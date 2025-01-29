'use server'

import { getEnv } from '@/env/server'
import { api } from '@/lib/api'

interface SignInRequest {
  username: string
  password: string
}

export interface SignInResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export async function signIn({ username, password }: SignInRequest) {
  const env = await getEnv()

  const response = await api.post<SignInResponse>(
    `${env.NEXT_PUBLIC_GW_API_URL}/auth/token`,
    {
      username,
      password,
    } as SignInRequest,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )

  return response.data
}
