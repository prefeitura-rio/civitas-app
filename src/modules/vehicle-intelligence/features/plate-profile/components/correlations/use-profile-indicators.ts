import { useCercoEntry } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import { citationStatusShort } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/citations'
import {
  cloneTemperatureLabel,
  correlationEventAnchor,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-format'
import { PROFILE } from '@/modules/vehicle-intelligence/features/plate-profile/profile-variants'
import { formatDate } from '@/modules/vehicle-intelligence/lib/dates'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'
import type {
  PlateCitationsData,
  PlateCorrelationsData,
} from '@/modules/vehicle-intelligence/types/domain'

/** Um indicador do resumo: a etiqueta (`kind` dá as cores), o título e as linhas de detalhe, com link opcional. */
export interface ProfileIndicator {
  kind: 'cerco' | 'clone-confirmed' | 'clone-suspect' | 'cited' | 'taxi'
  chip: string
  title: string
  lines: Array<{ text: string; link?: { label: string; onClick: () => void } }>
}

/** Só os sinais que a placa tem, na ordem Cerco → clone → citada no relato → táxi ou também vítima. */
export function useProfileIndicators(
  plate: string,
  data: PlateCorrelationsData | null,
  citations: PlateCitationsData | null,
): ProfileIndicator[] {
  const cerco = useCercoEntry(plate)
  if (!data?.ready) return []
  const indicators: ProfileIndicator[] = []
  if (cerco) {
    indicators.push({
      kind: 'cerco',
      chip: 'CERCO',
      title: 'Monitorada no Cerco Digital',
      lines: [
        {
          text: `${
            cerco.operations
              .map((item) => item.operacao)
              .filter(Boolean)
              .join(' · ') || 'operação sem nome'
          }${cerco.checkedAt ? ` · lista consultada em ${formatDate(cerco.checkedAt)}` : ''}`,
        },
      ],
    })
  }
  const cloneDays = data.clone.clone_days ?? 0
  const incompatible = {
    text: `${pluralize(cloneDays, 'dia', 'dias')} com passagens incompatíveis`,
  }
  if (data.clone.is_clone_confirmed) {
    indicators.push({
      kind: 'clone-confirmed',
      chip: 'CLONE CONFIRMADO',
      title: 'Confirmado no Painel de Clonagem',
      lines: [incompatible],
    })
  } else if (data.is_clone_suspect) {
    indicators.push({
      kind: 'clone-suspect',
      chip: 'SUSPEITA DE CLONE',
      lines: [incompatible],
      title: `Temperatura ${cloneTemperatureLabel(data.clone.clone_temperature, data.clone.clone_temperature_score)}`,
    })
  }
  const cited = citations?.ready ? citations.citations : []
  if (cited.length > 0) {
    const linkedIds = new Set(data.occurrences.map((item) => item.event_id))
    const scrollTo = (eventId: string) =>
      document
        .getElementById(correlationEventAnchor(eventId))
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const rest = cited.length - 2
    indicators.push({
      kind: 'cited',
      chip: 'CITADA NO RELATO',
      title: `Citada na dinâmica de ${pluralize(cited.length, 'RO', 'ROs')}`,
      lines: [
        ...cited.slice(0, 2).map((item) => ({
          text: `${item.event_id} · ${citationStatusShort[item.status]}`,
          link: {
            label: linkedIds.has(item.event_id) ? 'ver relato' : 'ver o RO',
            onClick: () => scrollTo(item.event_id),
          },
        })),
        ...(rest > 0 ? [{ text: `+ ${pluralize(rest, 'RO', 'ROs')}` }] : []),
      ],
    })
  }
  const classification = PROFILE.classification(data)
  if (classification)
    indicators.push({
      kind: 'taxi',
      chip: classification.chip,
      title: classification.title,
      lines: [{ text: classification.text }],
    })
  return indicators
}
