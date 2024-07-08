import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { getProfile } from '@/http/user/get-profile'

interface useRoleResponse {
  isAdmin: boolean
  isLoading: boolean
}

export function useRole() {
  const [isAdmin, setIsAdmin] = useState(false)

  const { data: response, isLoading } = useQuery({
    queryKey: ['users/me'],
    queryFn: getProfile,
  })

  useEffect(() => {
    if (response && response.data.is_admin) {
      setIsAdmin(response.data.is_admin)
    }
  }, [response])

  return {
    isAdmin,
    isLoading,
  } as useRoleResponse
}
