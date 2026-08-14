export type MonitoredPlateDraftAuthorityLink = {
  clientId: string
  institutionAuthorityId: string
  institutionAuthorityName?: string
  requestingInstitutionName?: string
  referenceNumber: string
  requestedAt: string
  validUntil?: string
  active: boolean
  monitorAllCollectionPoints: boolean
  notificationChannelIds?: string[]
  collectionPointIds?: string[]
}
