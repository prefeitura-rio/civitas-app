import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { getProfile } from '@/http/user/get-profile'
import type { Profile } from '@/models/entities'

interface useProfileResponse {
  isAdmin: boolean
  isLoading: boolean
  profile: Profile
}

export function useProfile() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState<Profile>()

  const { data: response, isLoading } = useQuery({
    queryKey: ['users/me'],
    queryFn: getProfile,
  })

  useEffect(() => {
    if (response) {
      setProfile({
        ...response.data,
        fullName: response.data.full_name,
        isAdmin: response.data.is_admin,
      })
    }
    if (response && response.data.is_admin) {
      setIsAdmin(response.data.is_admin)
    }
  }, [response])

  return {
    isAdmin,
    isLoading,
    profile,
  } as useProfileResponse
}
