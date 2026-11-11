import type { LucideIcon } from 'lucide-react'
import { MapPin, Network } from 'lucide-react'

import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileAnalysis } from '@/modules/vehicle-intelligence/types/domain'

const CORRELATION_SUBJECT = copassagem
  ? 'junto à vítima'
  : 'com leitura no entorno'

/** Alternador das duas análises: título e descrição; a contagem de fatos fica na descrição das correlações. */
export function ProfileAnalysisTabs({
  analysis,
  onChange,
  correlationCount,
}: {
  analysis: PlateProfileAnalysis
  onChange: (analysis: PlateProfileAnalysis) => void
  correlationCount: number | null
}) {
  const options: Array<{
    id: PlateProfileAnalysis
    icon: LucideIcon
    label: string
    description: string
  }> = [
    {
      id: 'correlations',
      icon: Network,
      label: 'Análise das correlações',
      description:
        correlationCount === null
          ? `Fatos ${CORRELATION_SUBJECT}`
          : `${pluralize(correlationCount, 'fato', 'fatos')} ${CORRELATION_SUBJECT}`,
    },
    {
      id: 'trends',
      icon: MapPin,
      label: 'Tendências de circulação',
      description: 'Locais, horários e viagens',
    },
  ]
  return (
    <div
      className="profile-analysis-tabs"
      role="tablist"
      aria-label="Análises da placa"
    >
      {options.map(({ id, icon: Icon, label, description }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={analysis === id}
          className={analysis === id ? 'active' : ''}
          onClick={() => onChange(id)}
        >
          <i>
            <Icon size={16} />
          </i>
          <span>
            <strong>{label}</strong>
            <small>{description}</small>
          </span>
        </button>
      ))}
    </div>
  )
}
