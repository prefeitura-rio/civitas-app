import { DetailSection } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/detail-section'
import { PlateChips } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/plate-chips'
import { formatEventTime } from '@/modules/vehicle-intelligence/features/post-event/components/shared/event-time'
import type { DisconnectionRadar } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

export function RadarPopup({
  radar,
  onOpenPlate,
}: {
  radar: DisconnectionRadar
  onOpenPlate: (plate: string) => void
}) {
  return (
    <div className="map-popup">
      <span className="eyebrow">RADAR DO POLO DE DESCONEXÃO</span>
      <strong>{radar.location || 'Local não informado'}</strong>
      <small>
        {radar.neighborhood ? `${radar.neighborhood} · ` : ''}Ponto{' '}
        {radar.point_id}
        {radar.direction ? ` · sentido ${radar.direction}` : ''}
      </small>
      <div className="detail-metrics">
        <span>
          <b>{formatNumber(radar.occurrences)}</b> desconexões
        </span>
        <span>
          <b>{formatNumber(radar.vehicles)}</b> placas citadas
        </span>
      </div>
      <DetailSection title="Placas">
        <PlateChips plates={radar.plate_ids} onOpenPlate={onOpenPlate} />
      </DetailSection>
      <DetailSection title="Últimas leituras">
        <div className="detail-times">
          {radar.recent_detection_times.map((value) => (
            <time key={value}>{formatEventTime(value)}</time>
          ))}
        </div>
      </DetailSection>
    </div>
  )
}
