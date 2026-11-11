import { BreakdownSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/breakdown-section'
import { ClusterConnections } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/cluster-connections'
import { DisconnectionCategoryBreakdown } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/disconnection-category-breakdown'
import { PopupSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/popup-section'
import type {
  ClusterConnection,
  LocationHotspot,
} from '@/modules/vehicle-intelligence/features/post-event/types'

export function RadarPopup({
  radar,
  cispLimit,
  connections = [],
}: {
  radar: LocationHotspot
  cispLimit: number
  connections?: ClusterConnection[]
}) {
  return (
    <div className="radar-popup">
      <span className="eyebrow">RADAR DO POLO DE DESCONEXÃO</span>
      <strong>{radar.location || 'Local não informado'}</strong>
      <small>
        {radar.neighborhood ? `${radar.neighborhood} · ` : ''}
        {radar.point_ids?.length > 1
          ? `Pontos de coleta ${radar.point_ids.join(', ')}`
          : `Ponto de coleta ${radar.point_id}`}
        {radar.cameras ? ` · câmeras ${radar.cameras}` : ''}
      </small>
      <div className="radar-popup-metrics">
        <span>
          <b>{radar.vehicles}</b>{' '}
          {radar.vehicles === 1
            ? 'veículo cuja trilha termina'
            : 'veículos cujas trilhas terminam'}{' '}
          aqui
        </span>
        <span>
          <b>{radar.cisp_count}</b>{' '}
          {radar.cisp_count === 1
            ? 'CISP de origem distinta'
            : 'CISPs de origem distintas'}
        </span>
      </div>
      <DisconnectionCategoryBreakdown counts={radar.category_counts} />
      <BreakdownSection
        title="CISPs de origem"
        hint={`top ${Math.min(cispLimit, radar.cisp_count)} de ${radar.cisp_count}`}
        items={(radar.cisp_breakdown || []).map((item) => ({
          key: item.cisp,
          label: `CISP ${item.cisp}`,
          percentage: item.percentage,
        }))}
      />
      <BreakdownSection
        title="Tipos de veículo"
        hint="% dos finais neste ponto"
        items={(radar.vehicle_breakdown || []).map((item) => ({
          key: item.category,
          label: item.category,
          percentage: item.percentage,
        }))}
      />
      <PopupSection
        title="Últimas detecções neste ponto"
        hint="mais recentes"
        className="radar-popup-recent"
      >
        <div>
          {radar.recent_detection_times?.map((detectedAt, index) => (
            <time key={`${detectedAt}-${index}`}>{detectedAt}</time>
          ))}
        </div>
      </PopupSection>
      {connections.length > 0 && (
        <PopupSection
          title="Origens conectadas"
          hint={`${connections.length} ${connections.length === 1 ? 'ligação' : 'ligações'}`}
        >
          <ClusterConnections
            connections={connections}
            direction="destination"
          />
        </PopupSection>
      )}
    </div>
  )
}
