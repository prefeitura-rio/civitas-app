import { ChevronDown, Info } from 'lucide-react'
import { type CSSProperties, useState } from 'react'

import { suspectDark } from '@/modules/vehicle-intelligence/components/timeline/palette'
import type { TimelineTrack } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'

/** A legenda do mapa do dia, fechada até o clique: trilhas, cor forte e clara, o pino do fato e as ligações. */
export function MapLegend({
  tracks,
  windowMinutes,
  radiusMeters,
}: {
  tracks: TimelineTrack[]
  windowMinutes: number
  radiusMeters: number | null
}) {
  const [legendOpen, setLegendOpen] = useState(false)
  return (
    <div
      className={`analysis-map-legend${legendOpen ? ' open' : ''}`}
      aria-label="Legenda do mapa"
    >
      <Button
        type="button"
        variant="ghost"
        className="map-legend-toggle"
        aria-expanded={legendOpen}
        aria-controls="timeline-map-legend-content"
        onClick={() => setLegendOpen((current) => !current)}
      >
        <Info size={15} />
        <span>Legenda</span>
        <ChevronDown className="legend-toggle-chevron" size={15} />
      </Button>
      <div
        id="timeline-map-legend-content"
        className="analysis-map-legend-content"
        hidden={!legendOpen}
      >
        <div className="legend-tracks">
          {tracks.map((track) => (
            <span key={track.key}>
              <i
                style={{ background: track.color, borderColor: track.color }}
              />
              {track.label}
            </span>
          ))}
        </div>
        <hr />
        <span className="legend-context">
          <i className="legend-strong" />
          Cor forte · dentro de ±{windowMinutes} min do fato
        </span>
        <span className="legend-context">
          <i className="legend-soft" />
          Cor clara · fora de ±{windowMinutes} min
        </span>
        <span className="legend-crime-row">
          <i className="legend-crime" />
          Pin do fato · revelado no horário
          {radiusMeters != null &&
            `; o círculo tracejado é o raio de ${radiusMeters} m`}
        </span>
        <div className="legend-correlations">
          {tracks
            .filter((track) => track.role !== 'candidate')
            .map((track) => (
              <span key={`correlation-${track.key}`}>
                <i
                  style={
                    {
                      '--correlation-victim': track.color,
                      '--correlation-candidate': suspectDark,
                    } as CSSProperties
                  }
                />
                {copassagem
                  ? `Correlata com ${track.label}`
                  : `Leitura no entorno do ${track.label.toLowerCase()}`}
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}
