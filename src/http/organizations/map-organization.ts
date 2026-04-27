import type { BackendOrganization, Organization } from '@/models/entities'

export function mapOrganization(backend: BackendOrganization): Organization {
  return {
    id: backend.id,
    name: backend.name,
    organizationType: backend.organization_type,
    acronym: backend.acronym,
    jurisdictionLevel: backend.jurisdiction_level,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}
