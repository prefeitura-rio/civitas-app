import { api } from '@/lib/api'

interface SignInRequest {
  username: string
  password: string
}

export interface SignInResponse {
  access_token: string
  token_type: string
  expires_in: number
  session_id: string
}

export async function signIn({ username, password }: SignInRequest) {
  const response = await api.post<SignInResponse>(
    '/auth/token',
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

  return response
}
