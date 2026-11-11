/** Os marcadores do mapa do dia: o pino do fato, a leitura numerada e o balão da leitura ativa (HTML do Leaflet). */
import { type DivIcon, divIcon, type DivIconOptions } from 'leaflet'

import {
  lighten,
  PIN_PATH,
  suspectDark,
} from '@/modules/vehicle-intelligence/components/timeline/palette'
import { placeName } from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type {
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import {
  formatTime,
  formatTimeSeconds,
} from '@/modules/vehicle-intelligence/lib/dates'
import { escapeHtml } from '@/modules/vehicle-intelligence/lib/format'

const ICONS = new Map<string, DivIcon>()
/** O mesmo ícone para o mesmo HTML: o react-leaflet só troca o elemento do marcador quando o ícone muda (o pouso do
 * marcador e o pulso do fato não se repetem a cada renderização, e o DOM não é refeito à toa). */
function cachedIcon(options: DivIconOptions & { html: string }): DivIcon {
  const key = `${options.className}|${String(options.iconSize)}|${String(options.iconAnchor)}|${options.html}`
  let icon = ICONS.get(key)
  if (!icon) {
    if (ICONS.size > 4000) ICONS.clear()
    icon = divIcon(options)
    ICONS.set(key, icon)
  }
  return icon
}

export function crimeMarker(
  track: TimelineTrack,
  active: boolean,
  occurredAt: string,
) {
  const width = active ? 34 : 32
  const height = active ? 42 : 40
  return cachedIcon({
    className: 'analysis-crime-marker-icon',
    iconSize: [width, height],
    iconAnchor: [width / 2, height - 2],
    html: `<div class="analysis-crime-marker${active ? ' active' : ''}" style="--crime-color:${track.color};--crime-width:${width}px;--crime-height:${height}px">
      <svg class="analysis-crime-marker-pin" viewBox="0 0 32 40" role="img" aria-label="Local do fato" xmlns="http://www.w3.org/2000/svg">
        <path d="${PIN_PATH}" fill="var(--crime-color)" stroke="var(--panel)" stroke-width="2.5"/>
        <circle cx="16" cy="14" r="6.5" fill="var(--panel)" stroke="var(--text)" stroke-width="1.7"/>
        <circle cx="16" cy="14" r="2.5" fill="var(--crime-color)"/>
      </svg>${active ? `<em>FATO · ${escapeHtml(formatTime(occurredAt))}</em>` : ''}</div>`,
  })
}

/** A leitura numerada, sólida e com borda branca (destaca no mapa claro): na cor da trilha quando está na janela de um
 * fato, num tom mais claro quando não; a correlacionada, metade na cor do fato; a da vez, com o anel ciano. */
export function mapMarker(
  track: TimelineTrack,
  order: number,
  active: boolean,
  withinFactWindow: boolean,
  correlated: boolean,
  correlationFill?: string,
) {
  const color =
    withinFactWindow || correlated ? track.color : lighten(track.color, 0.3)
  const size = active ? 36 : 28
  return cachedIcon({
    className: 'analysis-map-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="analysis-map-marker ${track.role}${withinFactWindow ? ' strong' : ' soft'}${correlated ? ' correlated' : ''}${active ? ' selected' : ''}" style="--fill:${color};--correlation-fill:${correlationFill || `linear-gradient(90deg,${color} 0 50%,${suspectDark} 50% 100%)`}"><span>${order}</span></div>`,
  })
}

/** O balão de posição da leitura da vez (como no Painel de Clonagem): a hora, a trilha ou o fato a que a leitura se liga,
 * o local e o equipamento com o bairro. */
export function mapCallout(
  detection: TimelineDetection,
  chip: { label: string; color: string },
) {
  const neighborhood = placeName(detection.neighborhood)
  return cachedIcon({
    className: 'analysis-map-callout-icon',
    iconSize: [0, 0],
    html: `<div class="analysis-map-callout">
      <div class="callout-head"><strong>${escapeHtml(formatTimeSeconds(detection.detected_at))}</strong><span><i style="background:${chip.color}"></i>${escapeHtml(chip.label)}</span></div>
      <span class="callout-place">${escapeHtml(placeName(detection.location) || 'Local não informado')}</span>
      <small><b>${escapeHtml(detection.camera || detection.point_id || '-')}</b>${neighborhood ? ` · ${escapeHtml(neighborhood)}` : ''}</small>
    </div>`,
  })
}
