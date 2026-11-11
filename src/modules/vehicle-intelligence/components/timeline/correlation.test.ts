import {
  anchorTrackKey,
  correlationGradient,
  correlationTrackLabel,
  detectionKey,
  factKey,
  matchKey,
  pairColor,
  plateTrackColor,
  revealedCorrelationMatches,
  trackKey,
} from '@/modules/vehicle-intelligence/components/timeline/correlation'
import {
  suspectDark,
  unassignedSuspectPalette,
} from '@/modules/vehicle-intelligence/components/timeline/palette'
import type {
  CorrelationMatch,
  Detection,
  TimelineCase,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'

const track = (
  key: string,
  role: TimelineTrack['role'],
  color: string,
  label = key,
): TimelineTrack => ({
  key,
  role,
  plate: key.split(':')[1] ?? key,
  label,
  color,
  softColor: color,
  detections: [],
})
const match = (fields: Partial<CorrelationMatch>): CorrelationMatch => ({
  eventId: 'E1',
  anchorKey: 'fact:E1',
  candidateDetectedAt: '2026-03-02T10:00:00-03:00',
  eventTime: '2026-03-02T10:05:00-03:00',
  distanceMeters: null,
  ...fields,
})
const at = (value: string) => new Date(value).getTime()

describe('chaves', () => {
  it('identificam a ligação, a leitura, a trilha e o fato', () => {
    expect(matchKey(match({ victimDetectedAt: 'v' }))).toBe(
      'E1|v|2026-03-02T10:00:00-03:00',
    )
    const detection = {
      detected_at: 't',
      point_id: 'P',
      camera: 'C',
      direction: 'N',
    } as Detection
    expect(detectionKey('candidate', 'ABC1D23', detection)).toBe(
      'candidate|ABC1D23|t|P|C|N',
    )
    expect(
      trackKey({ role: 'victim', plate: 'V', candidate_trail: null }),
    ).toBe('victim:V')
    expect(
      trackKey({ role: 'candidate', plate: 'C', candidate_trail: 'suspect_2' }),
    ).toBe('candidate:C:suspect_2')
    expect(
      trackKey({ role: 'candidate', plate: 'C', candidate_trail: null }),
    ).toBe('candidate:C')
    expect(factKey({ event_id: 'E1' } as TimelineCase)).toBe('fact-moment:E1')
  })

  it('no entorno (transeuntes), a âncora do dia é o fato', () => {
    expect(
      anchorTrackKey({ event_id: 'E1', victim_plate: 'V' } as TimelineCase),
    ).toBe('fact:E1')
  })
})

describe('ligações reveladas', () => {
  it('a ligação aparece quando a reprodução passou pelos dois lados', () => {
    const detection = {
      correlationMatches: [
        match({}),
        match({ eventId: 'E2', victimDetectedAt: '2026-03-02T10:20:00-03:00' }),
      ],
    } as TimelineDetection
    expect(
      revealedCorrelationMatches(detection, at('2026-03-02T10:04:00-03:00')),
    ).toEqual([])
    expect(
      revealedCorrelationMatches(
        detection,
        at('2026-03-02T10:05:00-03:00'),
      ).map((m) => m.eventId),
    ).toEqual(['E1'])
    expect(
      revealedCorrelationMatches(detection, at('2026-03-02T10:20:00-03:00')),
    ).toHaveLength(2)
  })

  it('o gradiente pinta a metade do fato com a cor de cada âncora', () => {
    const tracks = [
      track('fact:E1', 'fact', '#111111', 'Fato 1'),
      track('fact:E2', 'fact', '#222222', 'Fato 2'),
    ]
    expect(correlationGradient([], tracks, '#999999')).toBe(
      `linear-gradient(90deg,#999999 0%,#999999 50%,${suspectDark} 50%,${suspectDark} 100%)`,
    )
    expect(
      correlationGradient(
        [match({}), match({ eventId: 'E2', anchorKey: 'fact:E2' })],
        tracks,
        '#999999',
        '#abcdef',
      ),
    ).toBe(
      'linear-gradient(90deg,#111111 0%,#111111 25%,#222222 25%,#222222 50%,#abcdef 50%,#abcdef 100%)',
    )
  })

  it('rótulo da leitura ligada: nenhuma, uma ou várias âncoras', () => {
    const tracks = [
      track('fact:E1', 'fact', '#111111', 'Fato 1'),
      track('fact:E2', 'fact', '#222222', 'Fato 2'),
    ]
    expect(
      correlationTrackLabel([match({ anchorKey: 'fact:X' })], tracks),
    ).toBe('Leitura no entorno')
    expect(correlationTrackLabel([match({})], tracks)).toBe('↔ Fato 1')
    expect(
      correlationTrackLabel(
        [match({}), match({ eventId: 'E2', anchorKey: 'fact:E2' })],
        tracks,
      ),
    ).toBe('↔ 2 fatos')
  })
})

describe('cores das trilhas', () => {
  it('a correlata pinta o par com a própria cor; a vítima, com o vermelho das correlatas', () => {
    expect(pairColor(track('candidate:C', 'candidate', '#a83b58'))).toBe(
      '#a83b58',
    )
    expect(pairColor(track('victim:V', 'victim', '#075ea8'))).toBe(suspectDark)
    expect(pairColor(undefined)).toBe(suspectDark)
  })

  it('plateTrackColor acha a trilha da placa ou usa a cor sem atribuição', () => {
    const tracks = [track('candidate:ABC1D23', 'candidate', '#123456')]
    expect(plateTrackColor(tracks, 'ABC1D23')).toBe('#123456')
    expect(plateTrackColor(tracks, 'XYZ9W87')).toBe(
      unassignedSuspectPalette.color,
    )
  })
})
