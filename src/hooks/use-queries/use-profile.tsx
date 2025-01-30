import { useQuery } from '@tanstack/react-query'

import { getProfile } from '@/http/user/get-profile'

export function useProfile() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const profile = await getProfile()
      return {
        ...profile,
        is_admin: true,
      }
    },
  })
}
