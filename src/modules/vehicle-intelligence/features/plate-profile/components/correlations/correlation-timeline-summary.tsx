import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

export function ProfileCorrelationTimelineSummary({
  count,
  days,
  medianInterval,
}: {
  count: number
  days: number
  medianInterval: string
}) {
  return (
    <div
      className="profile-corr-timeline-summary"
      aria-label="Resumo da linha do tempo"
    >
      <span>
        <strong>{formatNumber(count)}</strong> correlações
      </span>
      <span>
        <strong>{formatNumber(days)} dias</strong> entre a primeira e a última
      </span>
      <span>
        Intervalo mediano de <strong>{medianInterval}</strong>
      </span>
    </div>
  )
}
