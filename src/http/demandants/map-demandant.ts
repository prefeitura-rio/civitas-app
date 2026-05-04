import { mapOrganization } from '@/http/organizations/map-organization'
import type { BackendDemandant, Demandant } from '@/models/entities'

export function mapDemandant(backend: BackendDemandant): Demandant {
  return {
    id: backend.id,
    organizationId: backend.organization_id,
    name: backend.name,
    email: backend.email,
    phone1: backend.phone_1,
    phone2: backend.phone_2,
    phone3: backend.phone_3,
    organization: mapOrganization(backend.organization),
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}
