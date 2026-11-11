import { DetailSection } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/detail-section'
import {
  formatEventTime,
  parseTime,
} from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/event-time'
import { PlateChips } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/plate-chips'
import type { OriginPoint } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

export function OriginPointPopup({
  point,
  modality,
  onOpenPlate,
}: {
  point: OriginPoint
  modality: string
  onOpenPlate: (plate: string) => void
}) {
  const recent = [...point.events]
    .sort(
      (left, right) =>
        (parseTime(right.event_time)?.getTime() ?? 0) -
        (parseTime(left.event_time)?.getTime() ?? 0),
    )
    .slice(0, 5)
  return (
    <div className="map-popup">
      <span className="eyebrow">PONTO DO POLO DE {modality}</span>
      <strong>{point.address}</strong>
      <div className="detail-metrics">
        <span>
          <b>{formatNumber(point.events.length)}</b> ocorrências
        </span>
        <span>
          <b>{formatNumber(point.plates.length)}</b> placas citadas
        </span>
      </div>
      {point.plates.length > 0 && (
        <DetailSection title="Placas citadas acompanhadas">
          <PlateChips plates={point.plates} onOpenPlate={onOpenPlate} />
        </DetailSection>
      )}
      <DetailSection title="Ocorrências recentes" hint="até 5">
        <div className="detail-times">
          {recent.map((event) => (
            <time key={event.event_id}>
              {event.event_id} · {formatEventTime(event.event_time)}
            </time>
          ))}
        </div>
      </DetailSection>
    </div>
  )
}
