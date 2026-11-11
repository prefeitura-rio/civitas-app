/** Os eventos da sequência do grupo: fatos, passagens juntas, partidas, desconexões e as demais leituras. */
import type {
  TimelineCase,
  TimelineDay,
  TimelineDetection,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { instantMs } from '@/modules/vehicle-intelligence/lib/dates'

export type EventKind =
  | 'fact'
  | 'together'
  | 'departure'
  | 'disconnection'
  | 'reading'
export type GroupEvent = {
  kind: EventKind
  key: string
  at: number
  fact?: TimelineCase
  label?: string
  /** Junta: as leituras das placas ligadas; demais: a leitura. */
  detections: TimelineDetection[]
  /** Junta: o fato em que ela conta como "juntas no fato" (rótulo "Fato 1"). */
  inFact?: string | null
}

export const detectionKind = (detection: TimelineDetection): EventKind => {
  const kinds = new Set((detection.marks ?? []).map((mark) => mark.kind))
  return kinds.has('disconnection')
    ? 'disconnection'
    : kinds.has('departure')
      ? 'departure'
      : 'reading'
}

/** Eventos do dia: fatos, passagens juntas (uma por grupo de leituras com 2+ placas ligadas) e as demais leituras. */
export function buildEvents(
  day: TimelineDay,
  enabledPlates: Set<string>,
  factLabels: Map<string, string>,
): GroupEvent[] {
  const events: GroupEvent[] = day.facts.map((fact) => ({
    kind: 'fact',
    key: `fato:${fact.event_id}`,
    at: instantMs(fact.event_time),
    fact,
    label: factLabels.get(fact.event_id),
    detections: [],
  }))
  const singleEvent = (detection: TimelineDetection): GroupEvent => ({
    kind: detectionKind(detection),
    key: detection.key,
    at: instantMs(detection.detected_at),
    detections: [detection],
  })
  const byTogetherId = new Map<string, TimelineDetection[]>()
  for (const detection of day.detections) {
    if (!enabledPlates.has(detection.plate)) continue
    if (detection.together_id)
      byTogetherId.set(detection.together_id, [
        ...(byTogetherId.get(detection.together_id) ?? []),
        detection,
      ])
    else events.push(singleEvent(detection))
  }
  const factOrder = day.facts.map((fact) => fact.event_id)
  for (const [id, detections] of byTogetherId) {
    const plates = new Set(detections.map((detection) => detection.plate))
    // Com uma placa só ligada, a leitura volta a ser comum.
    if (plates.size < 2) {
      detections.forEach((detection) => events.push(singleEvent(detection)))
      continue
    }
    const evidence = new Set(
      detections.flatMap((detection) =>
        (detection.together ?? [])
          .filter((j) => plates.has(j.plate))
          .flatMap((j) => j.evidence_events),
      ),
    )
    const firstFact =
      factOrder.find((eventId) => evidence.has(eventId)) ?? [...evidence][0]
    events.push({
      kind: 'together',
      key: `junta:${id}`,
      at: Math.min(
        ...detections.map((detection) => instantMs(detection.detected_at)),
      ),
      detections: detections.sort(
        (a, b) => instantMs(a.detected_at) - instantMs(b.detected_at),
      ),
      inFact: firstFact
        ? (factLabels.get(firstFact) ?? `RO ${firstFact}`)
        : null,
    })
  }
  const order: Partial<Record<EventKind, number>> = { fact: 0, together: 1 }
  return events.sort(
    (a, b) =>
      a.at - b.at ||
      (order[a.kind] ?? 2) - (order[b.kind] ?? 2) ||
      a.key.localeCompare(b.key),
  )
}
