'use server'

import { api } from '@/lib/api'

interface getCortexRemainingCreditsResponse {
  remaining_credit: number
  time_until_reset: number
}
export async function getCortexRemainingCredits(userId: string) {
  const response = await api.get<getCortexRemainingCreditsResponse>(
    `/users/${userId}/cortex-remaining-credits`,
  )
  return response.data
}
