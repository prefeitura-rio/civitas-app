import type { CSSProperties } from 'react'

import type { TimelineTrack } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'

/** O cartão da trilha sobre o mapa: liga e desliga a trilha; o do fato mostra o raio e a janela. */
export function TrailCard({
  track,
  selectedTracks,
  onToggleTracks,
  windowMinutes,
  radiusMeters,
}: {
  track: TimelineTrack
  selectedTracks: Set<string>
  onToggleTracks: (trackKeys: string[]) => void
  windowMinutes: number
  radiusMeters: number | null
}) {
  const active = selectedTracks.has(track.key)
  const items = track.detections
  if (track.role === 'fact')
    return (
      <Button
        variant="ghost"
        type="button"
        className={`analysis-trail-card victim${active ? ' active' : ''}`}
        style={{ '--trail-color': track.color } as CSSProperties}
        aria-pressed={active}
        onClick={() => onToggleTracks([track.key])}
      >
        <header>
          <span className="trail-card-dot" />
          <strong>{track.label}</strong>
          <em>{active ? 'Ativo' : 'Oculto'}</em>
        </header>
        <b className="trail-card-plate">RO {track.plate}</b>
        <div className="trail-card-kpis">
          <span>
            <b>{radiusMeters}</b>
            <small>m de raio</small>
          </span>
          <span>
            <b>±{windowMinutes}</b>
            <small>min</small>
          </span>
        </div>
      </Button>
    )
  return (
    <Button
      variant="ghost"
      type="button"
      className={`analysis-trail-card ${track.role}${active ? ' active' : ''}`}
      style={{ '--trail-color': track.color } as CSSProperties}
      aria-pressed={active}
      onClick={() => onToggleTracks([track.key])}
    >
      <header>
        <span className="trail-card-dot" />
        <strong>{track.label}</strong>
        <em>{active ? 'Ativa' : 'Oculta'}</em>
      </header>
      <b className="trail-card-plate">{track.plate}</b>
      <div className="trail-card-kpis">
        <span>
          <b>{items.length}</b>
          <small>no dia</small>
        </span>
        <span>
          <b>{items.filter((item) => item.within_fact_window).length}</b>
          <small>±{windowMinutes} min</small>
        </span>
        <span>
          <b>{items.filter((item) => item.correlated).length}</b>
          <small>{copassagem ? 'pareadas' : 'no entorno'}</small>
        </span>
      </div>
    </Button>
  )
}
