import {
  compareEvents,
  type TimelineEvent,
} from '@/modules/vehicle-intelligence/components/timeline/day/events'
import type {
  TimelineCase,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'

const detection = (
  key: string,
  occurredAt: string,
  role: 'victim' | 'candidate',
): TimelineEvent => ({
  kind: 'detection',
  key,
  occurredAt,
  detection: { key, role } as TimelineDetection,
})
const fact = (key: string, occurredAt: string): TimelineEvent => ({
  kind: 'fact',
  key,
  occurredAt,
  case: {} as TimelineCase,
  track: {} as TimelineTrack,
})

describe('compareEvents', () => {
  it('ordena pela hora; no mesmo instante, fato, vítima, correlata e depois a chave', () => {
    const events = [
      detection('c2', '2026-03-02T10:00:00-03:00', 'candidate'),
      detection('c1', '2026-03-02T10:00:00-03:00', 'candidate'),
      detection('v1', '2026-03-02T10:00:00-03:00', 'victim'),
      fact('f1', '2026-03-02T10:00:00-03:00'),
      detection('early', '2026-03-02T12:59:00Z', 'candidate'),
    ]
    expect([...events].sort(compareEvents).map((event) => event.key)).toEqual([
      'early',
      'f1',
      'v1',
      'c1',
      'c2',
    ])
  })
})
