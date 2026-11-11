import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { CSSProperties, Dispatch, SetStateAction } from 'react'

import {
  correlationGradient,
  pairColor,
  revealedCorrelationMatches,
  trackKey,
} from '@/modules/vehicle-intelligence/components/timeline/correlation'
import type {
  FactEvent,
  TimelineEvent,
} from '@/modules/vehicle-intelligence/components/timeline/day/events'
import { suspectDark } from '@/modules/vehicle-intelligence/components/timeline/palette'
import { formatTime } from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type {
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { parseInstant } from '@/modules/vehicle-intelligence/lib/dates'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

/** O player: anterior, reproduzir e próximo, o relógio, a velocidade e o trilho do dia com os fatos e as leituras. */
export function TimelinePlayer({
  orderedEvents,
  orderedDetections,
  factEvents,
  tracks,
  trackByKey,
  visibleKeys,
  visibleFactKeys,
  activeFactKey,
  revealedEventIndex,
  currentMoment,
  dayStart,
  dayEnd,
  dayMarginMinutes,
  playing,
  speed,
  setSpeed,
  setPlaying,
  setScrubbing,
  setCursorMoment,
  setCursorEventKey,
  move,
}: {
  orderedEvents: TimelineEvent[]
  orderedDetections: TimelineDetection[]
  factEvents: FactEvent[]
  tracks: TimelineTrack[]
  trackByKey: Map<string, TimelineTrack>
  visibleKeys: Set<string>
  visibleFactKeys: Set<string>
  activeFactKey: string | null
  revealedEventIndex: number
  currentMoment: number
  dayStart: number
  dayEnd: number
  dayMarginMinutes: number
  playing: boolean
  speed: number
  setSpeed: Dispatch<SetStateAction<number>>
  setPlaying: Dispatch<SetStateAction<boolean>>
  setScrubbing: Dispatch<SetStateAction<boolean>>
  setCursorMoment: Dispatch<SetStateAction<number>>
  setCursorEventKey: Dispatch<SetStateAction<string | null>>
  move: (next: number) => void
}) {
  const progress =
    dayEnd > dayStart
      ? ((currentMoment - dayStart) / (dayEnd - dayStart)) * 100
      : 0
  const seekFromRail = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = Math.max(
      0,
      Math.min(1, (event.clientX - bounds.left) / bounds.width),
    )
    setCursorMoment(dayStart + ratio * (dayEnd - dayStart))
    setCursorEventKey(null)
  }
  const positionAt = (value: string) =>
    dayEnd > dayStart
      ? Math.max(
          0,
          Math.min(
            100,
            ((parseInstant(value).getTime() - dayStart) / (dayEnd - dayStart)) *
              100,
          ),
        )
      : 0
  return (
    <div className="analysis-player">
      <div className="player-top">
        <div className="player-transport">
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Evento anterior"
            title="Evento anterior (←)"
            disabled={revealedEventIndex <= 0}
            onClick={() => move(revealedEventIndex - 1)}
          >
            <SkipBack size={16} fill="currentColor" />
          </Button>
          <Button
            size="icon"
            className="play-button"
            type="button"
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
            title={playing ? 'Pausar (espaço)' : 'Reproduzir (espaço)'}
            disabled={!orderedEvents.length}
            onClick={() => {
              if (
                currentMoment >=
                parseInstant(orderedEvents.at(-1)?.occurredAt || '').getTime()
              ) {
                setCursorMoment(
                  parseInstant(orderedEvents[0].occurredAt).getTime(),
                )
                setCursorEventKey(orderedEvents[0].key)
              }
              setPlaying((value) => !value)
            }}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Próximo evento"
            title="Próximo evento (→)"
            disabled={
              !orderedEvents.length ||
              revealedEventIndex >= orderedEvents.length - 1
            }
            onClick={() => move(revealedEventIndex + 1)}
          >
            <SkipForward size={16} fill="currentColor" />
          </Button>
        </div>
        <div className="player-clock">
          <strong>{formatTime(new Date(currentMoment).toISOString())}</strong>
          <span>
            Evento {Math.max(0, revealedEventIndex + 1)} de{' '}
            {orderedEvents.length}
          </span>
        </div>
        <div className="player-speed" aria-label="Velocidade de reprodução">
          {[1100, 850, 480].map((item, index) => (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              key={item}
              className={speed === item ? 'active' : ''}
              aria-pressed={speed === item}
              onClick={() => setSpeed(item)}
            >
              {['1×', '1,5×', '2×'][index]}
            </Button>
          ))}
          <em>{Math.round(progress)}%</em>
        </div>
      </div>
      <div className="player-rail-wrap">
        <div
          className="player-rail"
          role="slider"
          tabIndex={0}
          aria-label={`Horário na timeline do dia, com margem de ${dayMarginMinutes} minutos nas duas pontas`}
          aria-valuemin={0}
          aria-valuemax={Math.round((dayEnd - dayStart) / 1000)}
          aria-valuenow={Math.round((currentMoment - dayStart) / 1000)}
          aria-valuetext={`${formatTime(new Date(currentMoment).toISOString())}, evento ${Math.max(0, revealedEventIndex + 1)} de ${orderedEvents.length}`}
          onPointerDown={(event) => {
            setPlaying(false)
            setScrubbing(true)
            event.currentTarget.setPointerCapture(event.pointerId)
            seekFromRail(event)
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              seekFromRail(event)
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId)
            setScrubbing(false)
          }}
          onPointerCancel={() => setScrubbing(false)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              move(revealedEventIndex - 1)
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              move(revealedEventIndex + 1)
            }
          }}
        >
          <span className="player-hour-scale">
            {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((hour) => (
              <i
                key={hour}
                style={{
                  left: `${((hour * 60 + dayMarginMinutes) / (24 * 60 + 2 * dayMarginMinutes)) * 100}%`,
                }}
              >
                <span>{String(hour).padStart(2, '0')}h</span>
              </i>
            ))}
          </span>
          <span className="player-fact-moments">
            {factEvents.map((event) => {
              const item = event.case
              const factPosition = positionAt(event.occurredAt)
              const edgeClass =
                factPosition >= 85
                  ? 'at-end'
                  : factPosition <= 15
                    ? 'at-start'
                    : ''
              const reached = visibleFactKeys.has(event.key)
              const active = activeFactKey === event.key
              return (
                <i
                  key={event.key}
                  className={`${edgeClass}${reached ? ' reached' : ' future'}${active ? ' active' : ''}`}
                  title={`${categoryLabel(item.modality)} · ${formatTime(event.occurredAt)} · ${event.track.label}`}
                  style={
                    {
                      left: `${factPosition}%`,
                      '--fact-color': event.track.color,
                    } as CSSProperties
                  }
                >
                  <span>
                    {categoryLabel(item.modality)} ·{' '}
                    {formatTime(event.occurredAt).slice(0, 5)}
                  </span>
                </i>
              )
            })}
          </span>
          <span
            className="player-rail-fill"
            style={{ width: `${progress}%` }}
          />
          <span className="player-rail-ticks">
            {orderedDetections.map((item) => {
              const track = trackByKey.get(trackKey(item))
              const correlationMatches = visibleKeys.has(item.key)
                ? revealedCorrelationMatches(item, currentMoment)
                : []
              const correlationRevealed = correlationMatches.length > 0
              return (
                <i
                  key={item.key}
                  className={`${item.role}${item.within_fact_window ? ' strong' : ' soft'}${correlationRevealed ? ' correlated' : ''}`}
                  style={
                    {
                      left: `${positionAt(item.detected_at)}%`,
                      '--tick-color': item.within_fact_window
                        ? track?.color
                        : track?.softColor,
                      '--correlation-fill': correlationGradient(
                        correlationMatches,
                        tracks,
                        track?.color || suspectDark,
                        pairColor(track),
                      ),
                    } as CSSProperties
                  }
                />
              )
            })}
          </span>
          <span
            className="player-rail-thumb"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>
      <div className="player-shortcuts" aria-hidden="true">
        <span>
          <kbd>←</kbd>
          <kbd>→</kbd> navegar
        </span>
        <span>
          <kbd>Espaço</kbd> reproduzir / pausar
        </span>
      </div>
    </div>
  )
}
