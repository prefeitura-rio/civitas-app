import { ArrowLeft } from 'lucide-react'

import type { OccurrenceProfileData } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { formatDateTime } from '@/modules/vehicle-intelligence/lib/dates'
import {
  categoryLabel,
  cispLabel,
} from '@/modules/vehicle-intelligence/lib/labels'

type Found = Extract<OccurrenceProfileData, { found: true }>

/** Voltar, o título (o RO ou a placa vítima) e, com o perfil carregado, quando, onde e a delegacia. */
export function OccurrenceHeader({
  title,
  data,
  backLabel,
  onBack,
}: {
  title: string
  data: Found | null
  backLabel: string
  onBack: () => void
}) {
  const occurrence = data?.occurrence
  const kind =
    occurrence?.crime_type ||
    (occurrence?.modality ? categoryLabel(occurrence.modality) : null)
  return (
    <section className="group-profile-head occurrence-head">
      <button type="button" className="group-back" onClick={onBack}>
        <ArrowLeft size={15} />
        {backLabel}
      </button>
      <div className="occurrence-title">
        <h2>{title}</h2>
        {occurrence && (
          <div className="occurrence-subtitle">
            {kind && <span>{kind}</span>}
            <span>
              {formatDateTime(occurrence.event_time, 'horário não informado')}
            </span>
            <span>{occurrence.address ?? 'local não informado'}</span>
            {occurrence.cisp && (
              <span>{cispLabel(occurrence.cisp, occurrence.cisp_name)}</span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
