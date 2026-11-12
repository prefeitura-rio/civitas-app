import { COLORS } from '@/modules/vehicle-intelligence/components/timeline/group/style'
import { PIN_PATH } from '@/modules/vehicle-intelligence/components/timeline/palette'

/** A legenda do mapa do grupo: leitura, junta, junta no fato, partida, desconexão e o fato (com o raio, se houver). */
export function GroupMapLegend({
  windowMinutes,
  radiusMeters,
}: {
  windowMinutes: number
  radiusMeters: number | null
}) {
  return (
    <div className="gt-legend" aria-label="Legenda do mapa">
      <span>
        <i className="gt-leg-reading" />
        Leitura (clara: fora de ±{windowMinutes} min)
      </span>
      <span>
        <i className="gt-leg-joint" />
        Passagem junta
      </span>
      <span>
        <i className="gt-leg-joint at-fact" />
        Junta no fato
      </span>
      <span>
        <i className="gt-leg-departure" />
        Partida
      </span>
      <span>
        <i className="gt-leg-disconnection" />
        Desconexão
      </span>
      <span>
        <svg width="10" height="13" viewBox="0 0 32 40" aria-hidden="true">
          <path d={PIN_PATH} fill={COLORS.fact} />
          <circle cx="16" cy="14" r="5.5" fill="#fff" />
        </svg>
        {radiusMeters == null
          ? 'Fato'
          : `Fato e raio de ${radiusMeters >= 1000 ? `${radiusMeters / 1000} km` : `${radiusMeters} m`}`}
      </span>
    </div>
  )
}
