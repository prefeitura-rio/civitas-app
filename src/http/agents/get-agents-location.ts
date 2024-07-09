import { api } from '@/lib/api'
import type { AgentLocation, BackendAgentLocation } from '@/models/entities'

export async function getAgentsLocation() {
  const response = await api.get<BackendAgentLocation[]>('agents/location')

  const data: AgentLocation[] = response.data.map((item) => {
    return {
      latitude: item.latitude,
      longitude: item.longitude,
      name: item.name,
      operation: item.operation,
      lastUpdate: item.last_update,
      contactInfo: item.contact_info,
    }
  })

  return {
    ...response,
    data,
  }
}
