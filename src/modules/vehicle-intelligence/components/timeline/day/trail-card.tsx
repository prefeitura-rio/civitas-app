import type { CSSProperties } from 'react'

import { anchorTrackKey } from '@/modules/vehicle-intelligence/components/timeline/correlation'
import type {
  TimelineCase,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import { formatTime } from '@/modules/vehicle-intelligence/lib/dates'

/**
 * Os cartões das trilhas, na coluna à esquerda do mapa (como os de Carro 1 e Carro 2 do Painel de Clonagem): o dos fatos
 * do dia, uma linha por fato, e um por placa (a correlata e, na copassagem, a vítima). O clique liga e desliga a trilha.
 */
export function TrailCards({
  tracks,
  facts,
  selectedTracks,
  onToggleTracks,
  windowMinutes,
  radiusMeters,
}: {
  tracks: TimelineTrack[]
  facts: TimelineCase[]
  selectedTracks: Set<string>
  onToggleTracks: (trackKeys: string[]) => void
  windowMinutes: number
  radiusMeters: number | null
}) {
  const factTracks = tracks.filter((track) => track.role === 'fact')
  const factByTrack = new Map(facts.map((item) => [anchorTrackKey(item), item]))
  return (
    <div className="timeline-trail-cards" aria-label="Trilhas em foco">
      {factTracks.length > 0 && (
        <section className="analysis-trail-card facts-card active">
          <header>
            <strong>
              {factTracks.length === 1
                ? '1 fato'
                : `${factTracks.length} fatos`}
            </strong>
            <small>
              {radiusMeters != null
                ? `${radiusMeters.toLocaleString('pt-BR')} m · `
                : ''}
              ±{windowMinutes} min
            </small>
          </header>
          <div className="facts-card-rows">
            {factTracks.map((track) => {
              const item = factByTrack.get(track.key)
              const active = selectedTracks.has(track.key)
              return (
                <button
                  key={track.key}
                  type="button"
                  className={active ? 'active' : ''}
                  style={
                    {
                      '--trail-color': track.color,
                      '--trail-light': track.softColor,
                    } as CSSProperties
                  }
                  aria-pressed={active}
                  title={`${active ? 'Ocultar' : 'Mostrar'} ${track.label} no mapa`}
                  onClick={() => onToggleTracks([track.key])}
                >
                  <i aria-hidden="true" />
                  <b>{track.label}</b>
                  <span>{item ? formatTime(item.event_time) : ''}</span>
                  <small>
                    {copassagem ? track.plate : `RO ${item?.ro ?? track.plate}`}
                  </small>
                </button>
              )
            })}
          </div>
        </section>
      )}
      {tracks
        .filter((track) => track.role !== 'fact')
        .map((track) => {
          const active = selectedTracks.has(track.key)
          const items = track.detections
          return (
            <button
              key={track.key}
              type="button"
              className={`analysis-trail-card ${track.role}${active ? ' active' : ''}`}
              style={
                {
                  '--trail-color': track.color,
                  '--trail-light': track.softColor,
                } as CSSProperties
              }
              aria-pressed={active}
              aria-label={`${active ? 'Ocultar' : 'Mostrar'} ${track.label} no mapa`}
              onClick={() => onToggleTracks([track.key])}
            >
              <header>
                <span className="trail-card-dot" />
                <strong>{track.label}</strong>
              </header>
              <b className="trail-card-plate">{track.plate}</b>
              <div className="trail-card-kpis">
                <span>
                  <b>{items.length}</b>
                  <small>no dia</small>
                </span>
                <span>
                  <b>
                    {items.filter((item) => item.within_fact_window).length}
                  </b>
                  <small>±{windowMinutes} min</small>
                </span>
                <span>
                  <b>{items.filter((item) => item.correlated).length}</b>
                  <small>{copassagem ? 'pareadas' : 'no entorno'}</small>
                </span>
              </div>
            </button>
          )
        })}
    </div>
  )
}
