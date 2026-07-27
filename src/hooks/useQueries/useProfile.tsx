import { useQuery } from '@tanstack/react-query'

import { getProfile, type GetProfileResponse } from '@/http/user/get-profile'

function isProfile(value: unknown): value is GetProfileResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as GetProfileResponse).username === 'string' &&
    (value as GetProfileResponse).username.length > 0
  )
}

export function useProfile() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const profile = await getProfile()
      if (!isProfile(profile)) {
        throw new Error('Invalid /users/me response: missing username')
      }

      return {
        ...profile,
        is_admin: true,
      }
    },
  })
}
