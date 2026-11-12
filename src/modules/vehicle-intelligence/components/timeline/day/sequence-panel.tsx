import { MapPin } from 'lucide-react'
import type { CSSProperties, RefObject } from 'react'

import {
  correlationGradient,
  correlationTrackLabel,
  pairColor,
  revealedCorrelationMatches,
  trackKey,
} from '@/modules/vehicle-intelligence/components/timeline/correlation'
import type { TimelineEvent } from '@/modules/vehicle-intelligence/components/timeline/day/events'
import { suspectDark } from '@/modules/vehicle-intelligence/components/timeline/palette'
import {
  dayLabel,
  formatTime,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type { TimelineTrack } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { Badge } from '@/modules/vehicle-intelligence/components/ui/badge'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

/** A sequência do dia, à direita: uma linha por fato ou leitura; a ativa fica em destaque e o clique leva o player até ela. */
export function SequencePanel({
  selectedDay,
  orderedEvents,
  revealedEventIndex,
  tracks,
  trackByKey,
  currentMoment,
  windowMinutes,
  dayMarginMinutes,
  move,
  activeRowRef,
  sequenceListRef,
}: {
  selectedDay: string
  orderedEvents: TimelineEvent[]
  revealedEventIndex: number
  tracks: TimelineTrack[]
  trackByKey: Map<string, TimelineTrack>
  currentMoment: number
  windowMinutes: number
  dayMarginMinutes: number
  move: (next: number) => void
  activeRowRef: RefObject<HTMLButtonElement>
  sequenceListRef: RefObject<HTMLDivElement>
}) {
  return (
    <aside className="timeline-sequence-panel">
      <header>
        <div>
          <strong>Sequência do dia</strong>
          <span>
            {dayLabel(selectedDay)} · {orderedEvents.length} eventos
          </span>
        </div>
        <Badge variant="outline">
          {Math.max(0, revealedEventIndex + 1)} / {orderedEvents.length}
        </Badge>
      </header>
      <div className="sequence-column-label">
        Linha do tempo · 00:00–24:00 ±{dayMarginMinutes} min
      </div>
      <div className="timeline-sequence-list" ref={sequenceListRef}>
        <div className="timeline-sequence-track">
          {orderedEvents.map((event, index) => {
            if (event.kind === 'fact') {
              const active = index === revealedEventIndex
              return (
                <Button
                  variant="ghost"
                  ref={active ? activeRowRef : null}
                  className={`fact${active ? ' active' : ''}${index > revealedEventIndex ? ' future' : ''}`}
                  style={
                    {
                      '--sequence-color': event.track.color,
                      '--sequence-soft': event.track.softColor,
                    } as CSSProperties
                  }
                  key={event.key}
                  type="button"
                  aria-current={active ? 'step' : undefined}
                  onClick={() => move(index)}
                >
                  <span className="sequence-index">FATO</span>
                  <span className="sequence-node fact-node">
                    <MapPin size={11} />
                  </span>
                  <span className="sequence-time">
                    {formatTime(event.occurredAt).slice(0, 5)}
                  </span>
                  <span className="sequence-detail">
                    <span>
                      <strong>
                        {categoryLabel(event.case.modality)} ·{' '}
                        {event.track.label}
                        {copassagem
                          ? event.case.ro
                            ? ` · RO ${event.case.ro}`
                            : ''
                          : ` · RO ${event.case.ro ?? event.case.event_id}`}
                      </strong>
                      <small className="fact-tag">
                        {event.case.crime_type || 'Ocorrência'}
                      </small>
                    </span>
                    <em>
                      {event.case.event_address || 'Endereço não informado'}
                    </em>
                  </span>
                </Button>
              )
            }
            const detection = event.detection
            const track = trackByKey.get(trackKey(detection))
            const correlationMatches =
              index <= revealedEventIndex
                ? revealedCorrelationMatches(detection, currentMoment)
                : []
            const correlationRevealed = correlationMatches.length > 0
            return (
              <Button
                variant="ghost"
                ref={index === revealedEventIndex ? activeRowRef : null}
                className={`${detection.role}${index === revealedEventIndex ? ' active' : ''}${detection.within_fact_window ? ' strong' : ' soft'}${correlationRevealed ? ' correlated' : ''}${index > revealedEventIndex ? ' future' : ''}`}
                style={
                  {
                    '--sequence-color': track?.color,
                    '--sequence-soft': track?.softColor,
                    '--correlation-fill': correlationGradient(
                      correlationMatches,
                      tracks,
                      track?.color || suspectDark,
                      pairColor(track),
                    ),
                  } as CSSProperties
                }
                key={event.key}
                type="button"
                aria-current={index === revealedEventIndex ? 'step' : undefined}
                onClick={() => move(index)}
              >
                <span className="sequence-index">#{index + 1}</span>
                <span className="sequence-node" />
                <span className="sequence-time">
                  {formatTime(detection.detected_at).slice(0, 5)}
                </span>
                <span className="sequence-detail">
                  <span>
                    <strong>
                      {track
                        ? `${track.label} · ${track.plate}`
                        : detection.plate}
                    </strong>
                    <small
                      className={correlationRevealed ? 'correlated-tag' : ''}
                    >
                      {correlationRevealed
                        ? correlationTrackLabel(correlationMatches, tracks)
                        : detection.within_fact_window
                          ? `±${windowMinutes} min`
                          : `Fora de ±${windowMinutes} min`}
                    </small>
                  </span>
                  <em>{detection.location || detection.point_id}</em>
                </span>
              </Button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
