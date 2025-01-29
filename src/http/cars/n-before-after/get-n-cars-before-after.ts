'use server'

import { api } from '@/lib/api'
import type { DetectionGroup } from '@/models/entities'

interface GetNCarsBeforeAfterRequest {
  plate: string
  startTime: string
  endTime: string
  nMinutes: number
  nPlates: number
}

export async function getNCarsBeforeAfter({
  plate,
  startTime,
  endTime,
  nMinutes,
  nPlates,
}: GetNCarsBeforeAfterRequest) {
  const response = await api.get<DetectionGroup[]>('/cars/n_before_after', {
    params: {
      placa: plate,
      start_time: startTime,
      end_time: endTime,
      n_minutes: nMinutes,
      n_plates: nPlates,
    },
  })

  return response.data
}
