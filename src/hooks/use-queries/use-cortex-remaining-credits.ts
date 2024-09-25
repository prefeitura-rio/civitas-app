import { useQuery } from '@tanstack/react-query'

import { getCortexRemainingCredits } from '@/http/user/get-cortex-rmaining-credits'

import { useProfile } from './use-profile'

export function useCortexRemainingCredits() {
  const { data: profile } = useProfile()

  return useQuery({
    queryKey: ['users', 'cortex-remaining-credits'],
    queryFn: () => getCortexRemainingCredits(profile?.id || ''),
    enabled: !!profile,
  })
}
