import { api } from '@/lib/api'
import type { BackendOrganization } from '@/models/entities'

import { mapOrganization } from './map-organization'

export async function deleteOrganization(id: string) {
  const response = await api.delete<BackendOrganization>(`/organizations/${id}`)

  return {
    ...response,
    data: mapOrganization(response.data),
  }
}
