import { plateTrackColor } from '@/modules/vehicle-intelligence/components/timeline/correlation'
import { territoryLabel } from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type {
  TimelineCase,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import {
  civilDay,
  formatDayMonthTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatHours } from '@/modules/vehicle-intelligence/lib/format'

/** Grupo: as placas do grupo no RO, os pares com evidência e as desconexões que caem fora do dia. */
export function GroupFactDetails({
  group,
  tracks,
  day,
}: {
  group: NonNullable<TimelineCase['group']>
  tracks: TimelineTrack[]
  day: string
}) {
  const together = group.pairs.filter((pair) => pair.together)
  const disconnected = group.pairs.filter((pair) => pair.disconnected)
  const dot = (plate: string) => (
    <i
      style={{ background: plateTrackColor(tracks, plate) }}
      aria-hidden="true"
    />
  )
  const outside = group.disconnections.filter(
    (mark) => civilDay(mark.at) !== day,
  )
  return (
    <div className="timeline-group-fact">
      <div>
        <span>Placas do grupo no RO</span>
        <p>
          {group.plates.map((plate) => (
            <b key={plate} className="timeline-group-plate">
              {dot(plate)}
              {plate}
            </b>
          ))}
        </p>
      </div>
      {together.length > 0 && (
        <div>
          <span>Passaram juntas perto do fato</span>
          <p>
            {together.map((pair) => (
              <b key={`${pair.a}${pair.b}`} className="timeline-group-plate">
                {dot(pair.a)}
                {dot(pair.b)}
                {pair.a} + {pair.b}
              </b>
            ))}
          </p>
        </div>
      )}
      {disconnected.length > 0 && (
        <div>
          <span>Desconectaram juntas depois</span>
          <p>
            {disconnected.map((pair) => (
              <b key={`${pair.a}${pair.b}`} className="timeline-group-plate">
                {dot(pair.a)}
                {dot(pair.b)}
                {pair.a} + {pair.b}
              </b>
            ))}
          </p>
        </div>
      )}
      {outside.length > 0 && (
        <div>
          <span>Desconexões em outro dia</span>
          {outside.map((mark) => (
            <small key={mark.plate}>
              {dot(mark.plate)}
              {mark.plate} · {formatDayMonthTime(mark.at)}
              {mark.elapsed_hours != null
                ? ` · ${formatHours(mark.elapsed_hours)} depois do fato`
                : ''}
              {mark.gap_hours != null
                ? `, depois ${formatHours(mark.gap_hours)} sem leitura`
                : ', sem leitura até o fim dos dados'}{' '}
              · {mark.location || 'local não informado'}
              {territoryLabel(mark) ? ` · ${territoryLabel(mark)}` : ''}
            </small>
          ))}
        </div>
      )}
    </div>
  )
}
