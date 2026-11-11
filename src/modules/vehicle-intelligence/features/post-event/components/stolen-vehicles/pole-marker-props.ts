import type { ClusterConnection } from '@/modules/vehicle-intelligence/features/post-event/types'

/** O que os marcadores de polo recebem: o polo aberto, os ligados a ele e a escala. */
export type PoleMarkerProps<Id> = {
  connections: ClusterConnection[]
  selectedId: Id | null
  hasSelection: boolean
  relatedIds: Set<Id | null>
  poleMaximum: number
  onOpen: (id: Id) => void
}
