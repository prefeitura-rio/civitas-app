import type { TicketDetailTabId } from '../ticket-detail.constants'

export type TicketDetailTabHandle = {
  isDirty: () => boolean
  save: () => Promise<boolean>
  discard: () => void
}

export type TicketDetailPendingNavigation =
  | { type: 'tab'; tabId: TicketDetailTabId }
  | { type: 'route'; href: string }
  | { type: 'back' }
