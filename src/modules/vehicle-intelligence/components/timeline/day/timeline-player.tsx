import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { CSSProperties, Dispatch, SetStateAction } from 'react'

import {
  correlationAnchorTracks,
  revealedCorrelationMatches,
  trackKey,
} from '@/modules/vehicle-intelligence/components/timeline/correlation'
import type { TimelineEvent } from '@/modules/vehicle-intelligence/components/timeline/day/events'
import type { TimelineTrack } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import {
  formatTime,
  formatTimeSeconds,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'

/** As velocidades do player (intervalo entre passos), as do Painel de Clonagem. */
export const SPEEDS = [
  { label: '0,5×', delay: 1400 },
  { label: '1×', delay: 750 },
  { label: '2×', delay: 380 },
]

/**
 * O player, no padrão do Painel de Clonagem: transporte e velocidade em grupos segmentados, o relógio e o trilho do
 * primeiro ao último evento do dia, com um traço por evento (os fatos e as leituras ligadas a um fato mais altos). Na
 * reprodução, o cursor desliza no ritmo da velocidade escolhida.
 */
export function TimelinePlayer({
  orderedEvents,
  tracks,
  trackByKey,
  activeFactKey,
  revealedEventIndex,
  currentMoment,
  playing,
  scrubbing,
  speed,
  setSpeed,
  setPlaying,
  setScrubbing,
  setCursorMoment,
  setCursorEventKey,
  move,
}: {
  orderedEvents: TimelineEvent[]
  tracks: TimelineTrack[]
  trackByKey: Map<string, TimelineTrack>
  activeFactKey: string | null
  revealedEventIndex: number
  currentMoment: number
  playing: boolean
  scrubbing: boolean
  speed: number
  setSpeed: Dispatch<SetStateAction<number>>
  setPlaying: Dispatch<SetStateAction<boolean>>
  setScrubbing: Dispatch<SetStateAction<boolean>>
  setCursorMoment: Dispatch<SetStateAction<number>>
  setCursorEventKey: Dispatch<SetStateAction<string | null>>
  move: (next: number) => void
}) {
  const first = orderedEvents.length
    ? parseInstant(orderedEvents[0].occurredAt).getTime()
    : 0
  const last = orderedEvents.length
    ? parseInstant(orderedEvents[orderedEvents.length - 1].occurredAt).getTime()
    : 0
  // Um evento só (ou todos no mesmo instante): meia hora de cada lado, para o trilho não ter largura zero.
  const [railStart, railEnd] =
    last > first ? [first, last] : [first - 30 * 60_000, first + 30 * 60_000]
  const positionAt = (moment: number) =>
    Math.max(
      0,
      Math.min(100, ((moment - railStart) / (railEnd - railStart)) * 100),
    )
  const progress = positionAt(currentMoment)
  const seekFromRail = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = Math.max(
      0,
      Math.min(1, (event.clientX - bounds.left) / bounds.width),
    )
    setCursorMoment(railStart + ratio * (railEnd - railStart))
    setCursorEventKey(null)
  }
  const togglePlayback = () => {
    if (!orderedEvents.length) return
    if (!playing && revealedEventIndex >= orderedEvents.length - 1) {
      setCursorMoment(first)
      setCursorEventKey(orderedEvents[0].key)
    }
    setScrubbing(false)
    setPlaying((value) => !value)
  }
  const clock = formatTimeSeconds(Math.max(currentMoment, first))
  return (
    <div
      className={`analysis-player${playing ? ' is-playing' : ''}${scrubbing ? ' is-scrubbing' : ''}`}
      style={{ '--player-step': `${speed}ms` } as CSSProperties}
    >
      <div
        className="player-transport"
        role="group"
        aria-label="Controles da reprodução"
      >
        <button
          type="button"
          aria-label="Evento anterior"
          title="Evento anterior (←)"
          disabled={revealedEventIndex <= 0}
          onClick={() => move(revealedEventIndex - 1)}
        >
          <SkipBack size={15} fill="currentColor" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="play-button"
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
          title={playing ? 'Pausar (espaço)' : 'Reproduzir (espaço)'}
          disabled={!orderedEvents.length}
          onClick={togglePlayback}
        >
          {playing ? (
            <Pause size={15} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={15} fill="currentColor" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          aria-label="Próximo evento"
          title="Próximo evento (→)"
          disabled={
            !orderedEvents.length ||
            revealedEventIndex >= orderedEvents.length - 1
          }
          onClick={() => move(revealedEventIndex + 1)}
        >
          <SkipForward size={15} fill="currentColor" aria-hidden="true" />
        </button>
      </div>
      <div className="player-clock" aria-live="off">
        <strong>{orderedEvents.length ? clock : '--:--:--'}</strong>
        <span>
          {orderedEvents.length
            ? `${Math.max(1, revealedEventIndex + 1)} de ${orderedEvents.length}`
            : 'sem eventos'}
        </span>
      </div>
      <div className="player-rail-wrap">
        <div
          className="player-rail"
          role="slider"
          tabIndex={0}
          aria-label="Posição na timeline do dia"
          aria-valuemin={0}
          aria-valuemax={Math.round((railEnd - railStart) / 1000)}
          aria-valuenow={Math.round(
            (Math.max(currentMoment, railStart) - railStart) / 1000,
          )}
          aria-valuetext={`${clock}, evento ${Math.max(1, revealedEventIndex + 1)} de ${orderedEvents.length}`}
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
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
            event.preventDefault()
            move(revealedEventIndex + (event.key === 'ArrowLeft' ? -1 : 1))
          }}
        >
          <span
            className="player-rail-fill"
            style={{ width: `${progress}%` }}
          />
          <span className="player-ticks">
            {orderedEvents.map((event, index) => {
              const left = `${positionAt(parseInstant(event.occurredAt).getTime())}%`
              if (event.kind === 'fact')
                return (
                  <i
                    key={event.key}
                    className={`fact anchor${activeFactKey === event.key ? ' active' : ''}`}
                    style={
                      { left, '--tick': event.track.softColor } as CSSProperties
                    }
                  />
                )
              const detection = event.detection
              const track = trackByKey.get(trackKey(detection))
              const matches =
                index <= revealedEventIndex
                  ? revealedCorrelationMatches(detection, currentMoment)
                  : []
              const anchor = correlationAnchorTracks(matches, tracks)[0]
              return (
                <i
                  key={event.key}
                  className={`${detection.role}${anchor ? ' anchor correlated' : detection.within_fact_window ? ' strong' : ''}`}
                  style={
                    {
                      left,
                      '--tick': anchor?.softColor ?? track?.softColor,
                    } as CSSProperties
                  }
                />
              )
            })}
          </span>
          <span className="player-thumb" style={{ left: `${progress}%` }} />
        </div>
        <div className="player-rail-labels" aria-hidden="true">
          <span>{orderedEvents.length ? formatTime(railStart) : ''}</span>
          <span>{orderedEvents.length ? formatTime(railEnd) : ''}</span>
        </div>
      </div>
      <div
        className="player-speed"
        role="group"
        aria-label="Velocidade da reprodução"
      >
        {SPEEDS.map((item) => (
          <button
            key={item.delay}
            type="button"
            className={speed === item.delay ? 'active' : ''}
            aria-pressed={speed === item.delay}
            onClick={() => setSpeed(item.delay)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
