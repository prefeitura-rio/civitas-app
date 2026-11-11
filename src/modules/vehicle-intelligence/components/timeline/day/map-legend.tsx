import type { CSSProperties } from 'react'

import { suspectDark } from '@/modules/vehicle-intelligence/components/timeline/palette'
import type { TimelineTrack } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'

/** A legenda do mapa do dia, sempre aberta logo abaixo dos cartões (como no Painel de Clonagem): as marcas e as
 * ligações, nas cores do mapa. */
export function MapLegend({
  tracks,
  windowMinutes,
  radiusMeters,
}: {
  tracks: TimelineTrack[]
  windowMinutes: number
  radiusMeters: number | null
}) {
  const anchor = tracks.find((track) => track.role !== 'candidate')
  return (
    <div className="analysis-map-legend" aria-label="Legenda do mapa">
      <span>
        <i className="legend-strong" />
        Leitura a ±{windowMinutes} min de um fato
      </span>
      <span>
        <i className="legend-soft" />
        Fora de ±{windowMinutes} min
      </span>
      {anchor && (
        <span>
          <i
            className="legend-correlated"
            style={
              {
                '--correlation-victim': anchor.color,
                '--correlation-candidate': suspectDark,
              } as CSSProperties
            }
          />
          {copassagem ? 'Passou junto da vítima' : 'No entorno do fato'}
        </span>
      )}
      <hr />
      <span>
        <i className="legend-crime" />
        Fato
        {radiusMeters != null &&
          ` e raio de ${radiusMeters.toLocaleString('pt-BR')} m`}
      </span>
      <span>
        <i className="legend-selected" />
        Posição atual
      </span>
    </div>
  )
}
