/** O que vai para os rótulos fixos do mapa: um rótulo por fato, junta, partida e desconexão revelados, e os obstáculos. */
import type { GroupEvent } from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { formatTime } from '@/modules/vehicle-intelligence/lib/dates'
import { escapeHtml } from '@/modules/vehicle-intelligence/lib/format'

export type MapLabel = {
  lat: number
  lng: number
  r: number
  dy?: number
  priority: number
  html: string
  text: string
  dark?: boolean
  color?: string
  colors?: string[]
}
export type Obstacle = {
  lat: number
  lng: number
  box: [number, number, number, number]
}

export function mapLabelItems(
  revealed: GroupEvent[],
  colors: Map<string, string>,
) {
  const labels: MapLabel[] = []
  const obstacles: Obstacle[] = []
  for (const e of revealed) {
    if (e.kind === 'fact' && e.fact?.event_latitude != null) {
      const f = e.fact
      obstacles.push({
        lat: f.event_latitude!,
        lng: f.event_longitude!,
        box: [-13, -33, 13, 0],
      })
      const text = `${e.label} · ${formatTime(e.at)}`
      labels.push({
        lat: f.event_latitude!,
        lng: f.event_longitude!,
        r: 13,
        dy: -16,
        priority: 0,
        text,
        html: escapeHtml(text),
        dark: true,
      })
    } else if (e.kind === 'together') {
      const detection = e.detections[0]
      obstacles.push({
        lat: detection.latitude,
        lng: detection.longitude,
        box: [-15, -15, 15, 15],
      })
      const text = `Juntas ${formatTime(e.at)}${e.inFact ? ` · no ${e.inFact}` : ''}`
      labels.push({
        lat: detection.latitude,
        lng: detection.longitude,
        r: 15,
        priority: e.inFact ? 1 : 1.5,
        text,
        colors: [...new Set(e.detections.map((x) => colors.get(x.plate)!))],
        html: `<b style="color:#0f7a6d">Juntas</b> ${formatTime(e.at)}${e.inFact ? ` · <b style="color:#0f7a6d">no ${escapeHtml(e.inFact)}</b>` : ''}`,
      })
    } else if (e.kind === 'departure' || e.kind === 'disconnection') {
      const detection = e.detections[0]
      const isDeparture = e.kind === 'departure'
      obstacles.push({
        lat: detection.latitude,
        lng: detection.longitude,
        box: [-10, -10, 10, 10],
      })
      const markName = isDeparture ? 'Partida' : 'Desconexão'
      labels.push({
        lat: detection.latitude,
        lng: detection.longitude,
        r: 10,
        priority: isDeparture ? 3 : 2,
        color: colors.get(detection.plate),
        text: `${markName} ${formatTime(e.at)}`,
        html: `<b style="color:${isDeparture ? '#1f63b5' : '#7d45a8'}">${markName}</b> ${formatTime(e.at)}`,
      })
    } else if (e.kind === 'reading') {
      const detection = e.detections[0]
      obstacles.push({
        lat: detection.latitude,
        lng: detection.longitude,
        box: [-6, -6, 6, 6],
      })
    }
  }
  return { labels, obstacles }
}
