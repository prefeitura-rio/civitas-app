export type MonitoredPlateDraftAuthorityLink = {
  clientId: string
  institutionAuthorityId: string
  referenceNumber: string
  requestedAt: string
  validUntil?: string
  active: boolean
  monitorAllCollectionPoints: boolean
  notificationChannelIds?: string[]
  collectionPointCodes?: string[]
}
