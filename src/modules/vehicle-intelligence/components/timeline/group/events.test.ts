import {
  buildEvents,
  detectionKind,
} from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { mapLabelItems } from '@/modules/vehicle-intelligence/components/timeline/group/map-label-items'
import type {
  TimelineCase,
  TimelineDay,
  TimelineDetection,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import type {
  GroupDetectionMark,
  GroupTogetherPassage,
} from '@/modules/vehicle-intelligence/types/domain'

const reading = (
  plate: string,
  time: string,
  fields: Partial<Omit<TimelineDetection, 'together'>> & {
    together?: Partial<GroupTogetherPassage>[]
  } = {},
): TimelineDetection =>
  ({
    key: `${plate}|${time}`,
    plate,
    detected_at: `2026-03-02T${time}:00-03:00`,
    latitude: -22.9,
    longitude: -43.2,
    correlationMatches: [],
    ...fields,
  }) as TimelineDetection
const fact = (eventId: string, time: string): TimelineCase =>
  ({
    event_id: eventId,
    event_time: `2026-03-02T${time}:00-03:00`,
    event_latitude: -22.91,
    event_longitude: -43.21,
  }) as TimelineCase
const mark = (kind: GroupDetectionMark['kind']) =>
  ({ kind }) as GroupDetectionMark

describe('detectionKind', () => {
  it('desconexão vence partida, que vence a leitura comum', () => {
    expect(detectionKind(reading('A', '10:00'))).toBe('reading')
    expect(
      detectionKind(reading('A', '10:00', { marks: [mark('departure')] })),
    ).toBe('departure')
    expect(
      detectionKind(
        reading('A', '10:00', {
          marks: [mark('departure'), mark('disconnection')],
        }),
      ),
    ).toBe('disconnection')
  })
})

describe('buildEvents', () => {
  const day: TimelineDay = {
    facts: [fact('E1', '10:00')],
    tracks: [],
    detections: [
      reading('A', '09:00', { marks: [mark('departure')] }),
      reading('A', '10:00', {
        together_id: 'J1',
        together: [{ plate: 'B', evidence_events: ['E1'] }],
      }),
      reading('B', '10:01', {
        together_id: 'J1',
        together: [{ plate: 'A', evidence_events: ['E1'] }],
      }),
      reading('C', '10:00', { together_id: 'J2' }),
    ],
  }
  const labels = new Map([['E1', 'Fato 1']])

  it('monta fatos, partidas, juntas e leituras, na ordem do horário (fato antes da junta no mesmo instante)', () => {
    const events = buildEvents(day, new Set(['A', 'B', 'C']), labels)
    expect(events.map((e) => [e.kind, e.key])).toEqual([
      ['departure', 'A|09:00'],
      ['fact', 'fato:E1'],
      ['together', 'junta:J1'],
      ['reading', 'C|10:00'],
    ])
    const together = events[2]
    expect(together.detections.map((d) => d.plate)).toEqual(['A', 'B'])
    expect(together.inFact).toBe('Fato 1')
    expect(events[1].label).toBe('Fato 1')
  })

  it('com uma placa desligada, a junta volta a ser leitura comum', () => {
    const events = buildEvents(day, new Set(['A', 'C']), labels)
    expect(events.map((e) => [e.kind, e.key])).toEqual([
      ['departure', 'A|09:00'],
      ['fact', 'fato:E1'],
      ['reading', 'A|10:00'],
      ['reading', 'C|10:00'],
    ])
  })

  it('os rótulos fixos do mapa: fato escuro, junta no fato com as cores das placas, partida com a cor da placa', () => {
    const events = buildEvents(day, new Set(['A', 'B', 'C']), labels)
    const colors = new Map([
      ['A', '#111111'],
      ['B', '#222222'],
      ['C', '#333333'],
    ])
    const { labels: items, obstacles } = mapLabelItems(events, colors)
    expect(items.map((item) => [item.text, item.priority])).toEqual([
      ['Partida 09:00', 3],
      ['Fato 1 · 10:00', 0],
      ['Juntas 10:00 · no Fato 1', 1],
    ])
    expect(items[0].color).toBe('#111111')
    expect(items[1].dark).toBe(true)
    expect(items[2].colors).toEqual(['#111111', '#222222'])
    expect(obstacles).toHaveLength(4)
  })
})
