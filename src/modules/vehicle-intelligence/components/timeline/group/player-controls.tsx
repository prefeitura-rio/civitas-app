import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

import type { GroupEvent } from '@/modules/vehicle-intelligence/components/timeline/group/events'
import {
  hourMinute,
  type TimeRangeMode,
} from '@/modules/vehicle-intelligence/components/timeline/group/time'

/** Os controles do player do grupo: anterior, reproduzir e próximo, o relógio, a faixa de tempo e a velocidade. */
export function PlayerControls({
  events,
  activeIndex,
  playing,
  togglePlay,
  step,
  moment,
  rangeStart,
  range,
  setRange,
  speed,
  setSpeed,
}: {
  events: GroupEvent[]
  activeIndex: number
  playing: boolean
  togglePlay: () => void
  step: (d: number) => void
  moment: number
  rangeStart: number
  range: TimeRangeMode
  setRange: Dispatch<SetStateAction<TimeRangeMode>>
  speed: number
  setSpeed: Dispatch<SetStateAction<number>>
}) {
  return (
    <div className="gt-controls">
      <div className="gt-transporte">
        <button
          type="button"
          className="gt-step"
          aria-label="Evento anterior"
          title="Evento anterior (←)"
          disabled={activeIndex <= 0}
          onClick={() => step(-1)}
        >
          <SkipBack size={15} fill="currentColor" />
        </button>
        <button
          type="button"
          className="gt-play"
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
          title="Reproduzir / pausar (espaço)"
          disabled={!events.length}
          onClick={togglePlay}
        >
          {playing ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>
        <button
          type="button"
          className="gt-step"
          aria-label="Próximo evento"
          title="Próximo evento (→)"
          disabled={activeIndex >= events.length - 1}
          onClick={() => step(1)}
        >
          <SkipForward size={15} fill="currentColor" />
        </button>
      </div>
      <div className="gt-clock">
        <strong>{hourMinute(Math.max(moment, rangeStart))}</strong>
        <span>
          Evento {Math.max(0, activeIndex + 1)} de {events.length}
        </span>
      </div>
      <span className="gt-space" />
      <div className="gt-segments" role="group" aria-label="Faixa de tempo">
        {(
          [
            ['period', 'Período com leituras'],
            ['day', 'Dia inteiro'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={range === value}
            className={range === value ? 'active' : ''}
            onClick={() => setRange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="gt-segments"
        role="group"
        aria-label="Velocidade de reprodução"
      >
        {(
          [
            [1100, '1×'],
            [850, '1,5×'],
            [480, '2×'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={speed === value}
            className={`gt-vel${speed === value ? ' active' : ''}`}
            onClick={() => setSpeed(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
