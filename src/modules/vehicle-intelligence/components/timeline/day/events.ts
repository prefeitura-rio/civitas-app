/** Os eventos da sequência do dia: as leituras das trilhas ligadas e os fatos. */
import type {
  TimelineCase,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { parseInstant } from '@/modules/vehicle-intelligence/lib/dates'

export type TimelineEvent =
  | {
      kind: 'detection'
      key: string
      occurredAt: string
      detection: TimelineDetection
    }
  | {
      kind: 'fact'
      key: string
      occurredAt: string
      case: TimelineCase
      track: TimelineTrack
    }
export type FactEvent = Extract<TimelineEvent, { kind: 'fact' }>

/** Pela hora; no mesmo instante, o fato antes da leitura e a vítima antes da correlata. */
export function compareEvents(a: TimelineEvent, b: TimelineEvent) {
  const timeDifference =
    parseInstant(a.occurredAt).getTime() - parseInstant(b.occurredAt).getTime()
  if (timeDifference) return timeDifference
  if (a.kind !== b.kind) return a.kind === 'fact' ? -1 : 1
  if (
    a.kind === 'detection' &&
    b.kind === 'detection' &&
    a.detection.role !== b.detection.role
  )
    return a.detection.role === 'victim' ? -1 : 1
  return a.key.localeCompare(b.key)
}
