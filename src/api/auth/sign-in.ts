import qs from 'qs'

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
  const response = await api.post<SignInResponse>(
    '/auth/token',
    qs.stringify({
      username,
      password,
    } as SignInRequest),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )

  const { access_token: accessToken } = response.data
  sessionStorage.setItem('token', accessToken)
  sessionStorage.setItem('profile', username)

  const user = {
    username,
  }
  return user
}
