import {
  temporalProfile,
  typicalHourLabel,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/event-time'
import { PopupBreakdown } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/popup-breakdown'
import { PopupSection } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/popup-section'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

export function TemporalProfileSection({
  values,
}: {
  values: Array<string | null>
}) {
  const profile = temporalProfile(values)
  const typicalShare = profile.total
    ? Math.round((profile.typicalHourCount / profile.total) * 1000) / 10
    : 0
  return (
    <PopupSection
      title="Distribuição dos horários"
      hint="horário do fato"
      className="cluster-time-profile"
    >
      <div className="cluster-typical-time">
        <span>Horário típico</span>
        <strong>{typicalHourLabel(profile)}</strong>
        <small>
          {pluralize(profile.typicalHourCount, 'ocorrência', 'ocorrências')} ·{' '}
          {typicalShare}% dos horários válidos
        </small>
      </div>
      <div className="radar-popup-breakdown">
        <PopupBreakdown items={profile.shifts} />
      </div>
    </PopupSection>
  )
}
