import { Bike, Car } from 'lucide-react'

import { PlateOriginBadge } from '@/modules/vehicle-intelligence/components/plate/plate-origin-badge'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import {
  temperatureLabel,
  temperatureTone,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-format'
import type { ProfileIndicator } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/use-profile-indicators'
import {
  PRF_COLORS,
  vehicleTypeLabel,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/vehicle'
import { distanceLabel } from '@/modules/vehicle-intelligence/features/plate-profile/profile-variants'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { titleCase } from '@/modules/vehicle-intelligence/lib/labels'
import {
  plateOrigin,
  UF_NAMES,
} from '@/modules/vehicle-intelligence/lib/plate-origin'
import type { VehicleFields } from '@/modules/vehicle-intelligence/lib/prf'
import { isMotorcycleType } from '@/modules/vehicle-intelligence/lib/vehicles'
import type { PlateCorrelationsData } from '@/modules/vehicle-intelligence/types/domain'

/** Resumo do perfil (âncora `corr-resumo`): força da correlação e veículo; embaixo, os indicadores, se houver algum. */
export function CorrelationOverview({
  plate,
  data,
  indicators,
}: {
  plate: string
  data: PlateCorrelationsData
  indicators: ProfileIndicator[]
}) {
  const summary = data.summary
  const vehicle: VehicleFields = summary
  const strength = summary.correlation_strength ?? 0
  const tone = temperatureTone(strength)
  const prf = vehicle.vehicle_type_source === 'PRF'
  const motorcycle = isMotorcycleType(vehicle.vehicle_type)
  const typeLabel = vehicleTypeLabel(vehicle.vehicle_type)
  const delta = copassagem
    ? {
        value: summary.median_passage_delta_minutes,
        label: 'intervalo vítima↔correlata',
      }
    : { value: summary.median_fact_delta_minutes, label: 'Δt mediano' }
  const colorKey = (vehicle.vehicle_color || '').toUpperCase()
  const origin = plateOrigin(plate)
  return (
    <section
      className="profile-overview"
      id="corr-resumo"
      aria-label="Resumo da placa"
    >
      <div className="profile-overview-top">
        <div className="profile-overview-col profile-overview-force">
          <span className="profile-overview-label">Força da correlação</span>
          <div className={`profile-force-value ${tone}`}>
            <strong>{formatNumber(Math.round(strength))}</strong>
            <b>{temperatureLabel(strength)}</b>
            <small>de 0 a 100</small>
          </div>
          <div className="profile-force-ruler">
            <div className="profile-force-track">
              <i />
              <i />
              <i />
            </div>
            <em style={{ left: `${Math.min(100, Math.max(0, strength))}%` }} />
            <div className="profile-force-legend">
              <span>Baixa</span>
              <span>Média · 40</span>
              <span>Alta · 70</span>
            </div>
          </div>
          <div className="profile-force-stats">
            <span>
              <strong>{formatNumber(summary.linked_events)}</strong>
              <small>
                {summary.linked_events === 1 ? 'ocorrência' : 'ocorrências'}
              </small>
            </span>
            <span>
              <strong>
                {delta.value == null
                  ? '—'
                  : `${formatNumber(Math.round(delta.value))} min`}
              </strong>
              <small>{delta.label}</small>
            </span>
            <span>
              <strong>
                {distanceLabel(summary.median_fact_distance_meters)}
              </strong>
              <small>dist. mediana</small>
            </span>
          </div>
        </div>

        <div className="profile-overview-col profile-overview-vehicle">
          <span className="profile-overview-label">
            Veículo
            <em className={prf ? 'prf' : undefined}>
              {prf
                ? 'Cadastro PRF'
                : vehicle.vehicle_type
                  ? 'não PRF'
                  : 'sem cadastro'}
            </em>
          </span>
          <div className="profile-vehicle-identity">
            <i>{motorcycle ? <Bike size={24} /> : <Car size={24} />}</i>
            <div>
              <strong>
                {prf
                  ? vehicle.vehicle_model || typeLabel || 'Modelo não informado'
                  : vehicle.vehicle_type
                    ? typeLabel
                    : 'Veículo sem cadastro PRF'}
              </strong>
              <small>
                {prf
                  ? typeLabel
                  : vehicle.vehicle_type
                    ? 'tipo mais lido pelos equipamentos'
                    : 'a placa não tem cadastro PRF'}
              </small>
            </div>
          </div>
          <div className="profile-vehicle-grid">
            {prf && (
              <>
                <span>
                  <small>Cor</small>
                  <strong>
                    {vehicle.vehicle_color && (
                      <i
                        style={{
                          background: PRF_COLORS[colorKey] ?? 'var(--text-3)',
                        }}
                      />
                    )}
                    {vehicle.vehicle_color
                      ? titleCase(vehicle.vehicle_color.toLowerCase())
                      : '—'}
                  </strong>
                </span>
                <span>
                  <small>Ano fabricação / modelo</small>
                  <strong>
                    {vehicle.manufacture_year ?? '—'} /{' '}
                    {vehicle.model_year ?? '—'}
                  </strong>
                </span>
              </>
            )}
            <span className="profile-vehicle-origin">
              <small>Origem da placa</small>
              <strong>
                <PlateOriginBadge plate={plate} />
                {origin.uf
                  ? UF_NAMES[origin.uf]
                  : origin.kind === 'sem-uf'
                    ? 'Série sem estado'
                    : 'Fora do padrão brasileiro'}
              </strong>
              <em>{origin.description.replace(/^[^·]*· /, '')}</em>
            </span>
          </div>
        </div>
      </div>

      {indicators.length > 0 && (
        <div className="profile-overview-signals">
          <span className="profile-overview-label">Indicadores</span>
          <div className="profile-overview-signal-grid">
            {indicators.map((item) => (
              <div key={item.kind} className="profile-overview-signal">
                <span className={`profile-signal ${item.kind}`}>
                  <i />
                  {item.chip}
                </span>
                <strong>{item.title}</strong>
                {item.lines.map((line) => (
                  <small key={line.text}>
                    {line.text}
                    {line.link && (
                      <>
                        {' '}
                        ·{' '}
                        <button type="button" onClick={line.link.onClick}>
                          {line.link.label}
                        </button>
                      </>
                    )}
                  </small>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
