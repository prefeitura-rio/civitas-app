import type { CSSProperties } from 'react'

import { straightDistanceKm } from '@/modules/vehicle-intelligence/components/timeline/geo'
import type {
  Detection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import {
  formatTimeSeconds,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatDistance,
  formatDuration,
} from '@/modules/vehicle-intelligence/lib/format'

/** O trecho entre duas leituras seguidas: origem, destino, intervalo, distância e velocidade implícita. */
export function TransitionPopup({
  from,
  to,
  order,
  track,
}: {
  from: Detection
  to: Detection
  order: number
  track: TimelineTrack
}) {
  const seconds = Math.max(
    0,
    (parseInstant(to.detected_at).getTime() -
      parseInstant(from.detected_at).getTime()) /
      1000,
  )
  const distance = straightDistanceKm(from, to)
  const speed = seconds > 0 ? distance / (seconds / 3600) : null
  return (
    <div
      className="analysis-map-popup analysis-transition-popup"
      style={{ '--popup-accent': track.color } as CSSProperties}
    >
      <div className="analysis-popup-top">
        <span className="analysis-popup-track">
          <i />
          {track.label} · trecho #{order}–#{order + 1}
        </span>
        <span className="analysis-popup-status">Linha reta</span>
      </div>
      <strong className="analysis-popup-plate">{track.plate}</strong>
      <b className="analysis-popup-time">
        {formatTimeSeconds(from.detected_at)} →{' '}
        {formatTimeSeconds(to.detected_at)}
      </b>
      <div className="analysis-transition-locations">
        <span>
          <small>Origem</small>
          <strong>{from.location || 'Local não informado'}</strong>
        </span>
        <span>
          <small>Destino</small>
          <strong>{to.location || 'Local não informado'}</strong>
        </span>
      </div>
      <dl className="analysis-popup-grid">
        <dt>Intervalo</dt>
        <dd>{formatDuration(seconds)}</dd>
        <dt>Distância reta</dt>
        <dd>{formatDistance(distance * 1000, { fixedKm: true })}</dd>
        <dt>Velocidade implícita</dt>
        <dd>{speed === null ? '—' : `${Math.round(speed)} km/h`}</dd>
      </dl>
    </div>
  )
}
