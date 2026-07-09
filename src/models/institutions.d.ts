export type InstitutionJurisdictionLevel =
  | 'municipal'
  | 'estadual'
  | 'distrital'
  | 'federal'
  | 'outros'

export type RequestingInstitution = {
  id: string
  name: string
  type: string
  agency: string
  jurisdictionLevel: InstitutionJurisdictionLevel
  createdAt?: string
  updatedAt?: string
}

export type BackendRequestingInstitution = {
  id: string
  name: string
  type: string
  agency: string
  jurisdiction_level: InstitutionJurisdictionLevel
  created_at?: string
  updated_at?: string
}

export type InstitutionAuthorityPhone = {
  id?: string
  phone: string
  isPrimary: boolean
}

export type BackendInstitutionAuthorityPhone = {
  id?: string
  phone: string
  is_primary: boolean
}

export type InstitutionAuthorityEmail = {
  id?: string
  email: string
  isPrimary: boolean
}

export type BackendInstitutionAuthorityEmail = {
  id?: string
  email: string
  is_primary: boolean
}

export type InstitutionAuthorityContacts = {
  phones: InstitutionAuthorityPhone[]
  emails: InstitutionAuthorityEmail[]
}

export type BackendInstitutionAuthorityContacts = {
  phones?: BackendInstitutionAuthorityPhone[]
  emails?: BackendInstitutionAuthorityEmail[]
}

export type InstitutionAuthorityPrimaryContact = {
  phone?: InstitutionAuthorityPhone
  email?: InstitutionAuthorityEmail
} | null

export type BackendInstitutionAuthorityPrimaryContact = {
  phone?: BackendInstitutionAuthorityPhone
  email?: BackendInstitutionAuthorityEmail
} | null

export type InstitutionAuthority = {
  id: string
  name: string
  requestingInstitutionId: string
  requestingInstitution?: RequestingInstitution
  primaryContact?: InstitutionAuthorityPrimaryContact
  isFocalPoint: boolean
  contacts?: InstitutionAuthorityContacts | null
  createdAt?: string
  updatedAt?: string
}

export type BackendInstitutionAuthority = {
  id: string
  name: string
  requesting_institution_id?: string
  requesting_institution?: BackendRequestingInstitution
  contact?: BackendInstitutionAuthorityContacts | null
  primary_contact?: BackendInstitutionAuthorityPrimaryContact
  is_focal_point: boolean
  created_at?: string
  updated_at?: string
}
