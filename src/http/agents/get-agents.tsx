'use server'

import { api } from '@/lib/api'
import type { Agent, BackendAgent } from '@/models/entities'

export async function getAgents() {
  const response = await api.get<BackendAgent[]>('agents/location')

  const data: Agent[] = response.data.map((item) => {
    return {
      latitude: item.latitude,
      longitude: item.longitude,
      name: item.name,
      operation: item.operation,
      lastUpdate: item.last_update,
      contactInfo: item.contact_info,
    }
  })

  return data
}
