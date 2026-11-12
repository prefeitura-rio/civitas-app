import type {
  EventKind,
  GroupEvent,
} from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { conic } from '@/modules/vehicle-intelligence/components/timeline/group/style'
import {
  hourMinute,
  toMs,
} from '@/modules/vehicle-intelligence/components/timeline/group/time'
import { PIN_PATH } from '@/modules/vehicle-intelligence/components/timeline/palette'
import type { TimelineDetection } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { formatHours } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type { GroupDetectionMark } from '@/modules/vehicle-intelligence/types/domain'

const TERRITORY_NEAR_METERS = 500
/** A classe CSS de cada tipo na sequência (as mesmas de antes). */
const ROW_CLASS: Record<EventKind, string> = {
  fact: 'fact',
  together: 'joint',
  departure: 'departure',
  disconnection: 'disconnection',
  reading: 'reading',
}
const findMark = (
  detection: TimelineDetection,
  kind: GroupDetectionMark['kind'],
) => (detection.marks ?? []).find((mark) => mark.kind === kind)
const territoryNote = (mark: GroupDetectionMark | undefined) =>
  mark?.complex &&
  mark.distance_meters != null &&
  mark.distance_meters <= TERRITORY_NEAR_METERS
    ? ` · ${Math.round(mark.distance_meters)} m do ${mark.complex}`
    : ''

/** Uma linha da sequência do grupo: fato, passagem junta, partida ou desconexão, ou leitura. */
export function SequenceRow({
  item,
  active,
  future,
  colors,
  factLabels,
  onClick,
}: {
  item: GroupEvent
  active: boolean
  future: boolean
  colors: Map<string, string>
  factLabels: Map<string, string>
  onClick: () => void
}) {
  const rowClass = `gt-row ${ROW_CLASS[item.kind]}${active ? ' active' : ''}${future ? ' future' : ''}`
  const clock = <span className="gt-row-hour">{hourMinute(item.at)}</span>
  if (item.kind === 'fact') {
    const f = item.fact!
    return (
      <button
        type="button"
        className={rowClass}
        data-ativo={active ? '1' : '0'}
        onClick={onClick}
      >
        {clock}
        <span className="gt-row-icon">
          <svg width="11" height="14" viewBox="0 0 32 40" aria-hidden="true">
            <path d={PIN_PATH} fill="#c9d6d9" />
            <circle cx="16" cy="14" r="5.5" fill="#111616" />
          </svg>
        </span>
        <span className="gt-row-body">
          <span className="gt-row-title">
            <b>
              {item.label} · {f.crime_type || categoryLabel(f.modality)}
            </b>
          </span>
          <span className="gt-row-sub">
            {f.event_address || 'Endereço não informado'} · RO{' '}
            {f.ro ?? f.event_id}
          </span>
          {f.group && (
            <span className="gt-row-plates">
              {f.group.plates.map((p) => (
                <span key={p}>
                  <i style={{ background: colors.get(p) ?? '#82979d' }} />
                  {p}
                </span>
              ))}
            </span>
          )}
        </span>
      </button>
    )
  }
  if (item.kind === 'together') {
    const detections = item.detections
    const plates = [...new Set(detections.map((detection) => detection.plate))]
    const seconds = Math.round(
      (toMs(detections[detections.length - 1].detected_at) -
        toMs(detections[0].detected_at)) /
        1000,
    )
    const spread =
      seconds < 60
        ? seconds
          ? `${seconds} s entre a 1ª e a última`
          : 'mesmo instante'
        : `${Math.round(seconds / 60)} min entre a 1ª e a última`
    const markNotes = detections
      .flatMap((detection) =>
        (detection.marks ?? []).map(
          (m) =>
            `${m.kind === 'departure' ? 'partida' : 'desconexão'} de ${detection.plate}`,
        ),
      )
      .filter((v, i, vs) => vs.indexOf(v) === i)
    return (
      <button
        type="button"
        className={rowClass}
        data-ativo={active ? '1' : '0'}
        onClick={onClick}
      >
        {clock}
        <span className="gt-row-icon">
          <i
            className={`gt-symbol-joint${item.inFact ? ' at-fact' : ''}`}
            style={{ background: conic(plates.map((p) => colors.get(p)!)) }}
          />
        </span>
        <span className="gt-row-body">
          <span className="gt-row-title">
            <b>Juntas · {plates.join(' + ')}</b>
            {item.inFact && (
              <small className="gt-badge joint">no {item.inFact}</small>
            )}
          </span>
          <span className="gt-row-sub">
            {detections[0].location || detections[0].point_id} ·{' '}
            {detections[0].camera || detections[0].point_id} · {spread}
            {markNotes.length ? ` · ${markNotes.join(', ')}` : ''}
          </span>
        </span>
      </button>
    )
  }
  const detection = item.detections[0]
  const color = colors.get(detection.plate) ?? '#82979d'
  if (item.kind === 'departure' || item.kind === 'disconnection') {
    const isDeparture = item.kind === 'departure'
    const both = Boolean(
      findMark(detection, 'departure') && findMark(detection, 'disconnection'),
    )
    const mark = findMark(
      detection,
      isDeparture ? 'departure' : 'disconnection',
    )
    return (
      <button
        type="button"
        className={rowClass}
        data-ativo={active ? '1' : '0'}
        onClick={onClick}
      >
        {clock}
        <span className="gt-row-icon">
          <i
            className={
              isDeparture ? 'gt-symbol-departure' : 'gt-symbol-disconnection'
            }
          />
        </span>
        <span className="gt-row-body">
          <span className="gt-row-title">
            <i className="gt-point" style={{ background: color }} />
            <b>
              {both
                ? 'Partida e desconexão'
                : isDeparture
                  ? 'Partida'
                  : 'Desconexão'}{' '}
              · {detection.plate}
            </b>
            {!isDeparture && (
              <small className="gt-badge disconnection">
                {mark?.gap_hours != null
                  ? `${formatHours(mark.gap_hours)} sem leitura`
                  : 'sem leitura até o fim dos dados'}
              </small>
            )}
          </span>
          <span className="gt-row-sub">
            {detection.location || detection.point_id}
            {territoryNote(mark)}
          </span>
        </span>
      </button>
    )
  }
  const entornoFact = detection.correlationMatches
    .map((m) => factLabels.get(m.eventId))
    .find(Boolean)
  return (
    <button
      type="button"
      className={rowClass}
      data-ativo={active ? '1' : '0'}
      onClick={onClick}
    >
      {clock}
      <span className="gt-row-icon">
        <i className="gt-point" style={{ background: color }} />
      </span>
      <span className="gt-row-body">
        <span className="gt-row-title">
          <b>{detection.plate}</b>
          {entornoFact && (
            <small className="gt-badge entorno">entorno do {entornoFact}</small>
          )}
        </span>
        <span className="gt-row-sub">
          {detection.location || detection.point_id}
        </span>
      </span>
    </button>
  )
}
