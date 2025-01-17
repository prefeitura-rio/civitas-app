'use server'

import { api } from '@/lib/api'
import type { BackendWazeAlert, WazeAlert } from '@/models/entities'

export async function getWazePoliceAlerts() {
  const response = await api.get<BackendWazeAlert[]>('/waze/police')
  const data = response.data.map((item) => {
    return {
      timestamp: item.timestamp,
      street: item.street,
      type: item.type,
      subtype: item.subtype,
      reliability: item.reliability,
      confidence: item.confidence,
      numberThumbsUp: item.number_thumbs_up,
      latitude: item.latitude,
      longitude: item.longitude,
    } as WazeAlert
  })

  return data
}
