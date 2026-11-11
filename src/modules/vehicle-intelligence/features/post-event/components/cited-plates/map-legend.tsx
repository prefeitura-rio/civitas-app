import { TerritoriesLegend } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { LegendKeys } from '@/modules/vehicle-intelligence/features/post-event/components/shared/legend-keys'
import type { PostEventData } from '@/modules/vehicle-intelligence/features/post-event/types'

export function MapLegend({
  data,
  open,
  setOpen,
  territories,
}: {
  data: PostEventData
  open: boolean
  setOpen: (update: (value: boolean) => boolean) => void
  territories: boolean
}) {
  const robbery = data.methodology.origin_cluster_parameters.ROUBO
  const theft = data.methodology.origin_cluster_parameters.FURTO
  const concentration = data.methodology.origin_concentration_parameters
  return (
    <div
      className={`map-legend-card map-legend-pill ${open ? 'expanded' : 'collapsed'}`}
    >
      <LegendKeys
        primaryLabel="Roubo"
        secondaryLabel="Furto"
        open={open}
        onToggle={() => setOpen((value) => !value)}
      />
      {open && (
        <div className="map-legend-content">
          <div>
            <i className="origin robbery" />
            <span>
              <b>Polo de roubo</b>
              <small>
                {robbery
                  ? `${robbery.minimum_events} fatos em ${robbery.radius_meters} m.`
                  : ''}{' '}
                Tracejado: concentração de {concentration.minimum_events} fatos
                em {concentration.minimum_days} dias dentro de{' '}
                {concentration.radius_meters} m.
              </small>
            </span>
          </div>
          <div>
            <i className="origin theft" />
            <span>
              <b>Polo de furto</b>
              <small>
                {theft
                  ? `${theft.minimum_events} fatos em ${theft.radius_meters} m.`
                  : ''}{' '}
                Esmaecido: sem placa citada acompanhada.
              </small>
            </span>
          </div>
          <div>
            <i className="destination" />
            <span>
              <b>Polo de desconexão</b>
              <small>
                Ao menos {data.methodology.destination_minimum_points} radares
                em {data.methodology.destination_radius_meters} m. Tracejado: um
                radar com {data.methodology.terminal_minimum_events} desconexões
                em {data.methodology.terminal_minimum_days} dias.
              </small>
            </span>
          </div>
          <div>
            <i className="flow-line" />
            <span>
              <b>Conexão</b>
              <small>
                Ocorrência no polo → última leitura antes do hiato. Aparece ao
                abrir um polo; não é rota viária.
              </small>
            </span>
          </div>
          {territories && <TerritoriesLegend />}
        </div>
      )}
    </div>
  )
}
