import type { ReactNode } from 'react'

import { originTone } from '@/modules/vehicle-intelligence/components/plate/plate-origin-badge'
import type { SignalFields } from '@/modules/vehicle-intelligence/components/plate/plate-signals'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/vehicle-intelligence/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/modules/vehicle-intelligence/components/ui/tooltip'
import { formatDayMonthTime } from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatNumber,
  formatPercent,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import { cispParts } from '@/modules/vehicle-intelligence/lib/labels'
import {
  plateOrigin,
  UF_NAMES,
} from '@/modules/vehicle-intelligence/lib/plate-origin'
import type { VehicleFields } from '@/modules/vehicle-intelligence/lib/prf'
import {
  recentActivityCount,
  recentActivityTone,
  recentActivityWindow,
} from '@/modules/vehicle-intelligence/lib/recent-activity'
import {
  vehicleDetailsLabel,
  vehicleTypeLabel,
} from '@/modules/vehicle-intelligence/lib/vehicles'
import type {
  CorrelationRankingRow,
  CorrelationRankingSort,
} from '@/modules/vehicle-intelligence/types/domain'

export type Column = {
  key: string
  label: string
  help: string
  sortKey?: CorrelationRankingSort
  render: (row: CorrelationRankingRow, index: number) => ReactNode
}

function cispDetail(code: string, names: Record<string, string>) {
  const parts = cispParts(code, names[code] ?? names[code.padStart(3, '0')])
  const locality = parts.locality ?? 'Unidade sem nome cadastrado'
  return {
    code: parts.code,
    locality,
    unitName: parts.unit,
    fullName: `${locality} · ${parts.unit}`,
  }
}

export function cispCell(
  codes: string[],
  count: number,
  names: Record<string, string>,
): ReactNode {
  const details = codes
    .map((code) => cispDetail(code, names))
    .sort((left, right) => left.locality.localeCompare(right.locality, 'pt-BR'))
  const visible = details.slice(0, 2)
  const hidden = details.length - visible.length
  return (
    <div className="ranking-cisp-cell">
      <div className="ranking-cisp-tags">
        {visible.map((item) => (
          <span key={item.code} title={item.fullName}>
            {item.locality}
          </span>
        ))}
        {hidden > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ranking-cisp-more"
                aria-label={`Ver todas as ${count} áreas de delegacia`}
              >
                +{hidden}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="ranking-cisp-popover" align="start">
              <strong>Áreas de delegacia vinculadas</strong>
              <div>
                {details.map((item) => (
                  <span key={item.code}>
                    <b>{item.locality}</b>
                    <small>{item.unitName}</small>
                  </span>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <small>
        {count === 1 ? visible[0]?.unitName : `${count} áreas vinculadas`}
      </small>
    </div>
  )
}

/** Coluna "Modelo e origem": o modelo do cadastro PRF e a UF que emitiu a placa (fora do RJ em destaque). */
export function vehicleOriginCell(row: SignalFields): ReactNode {
  const plateOriginInfo = plateOrigin(row.plate)
  const tone = originTone(plateOriginInfo)
  const originLabel = plateOriginInfo.uf
    ? `${plateOriginInfo.code} · ${plateOriginInfo.alternative ? `${UF_NAMES[plateOriginInfo.uf]} ou ${UF_NAMES[plateOriginInfo.alternative]}` : UF_NAMES[plateOriginInfo.uf]}`
    : plateOriginInfo.kind === 'sem-uf'
      ? 'Série sem UF'
      : 'Fora do padrão'
  return (
    <span
      className="ranking-vehicle"
      title={[
        vehicleDetailsLabel(row),
        `Origem da placa: ${plateOriginInfo.description}`,
      ]
        .filter(Boolean)
        .join('\n')}
    >
      {row.vehicle_model ? (
        <b>{row.vehicle_model}</b>
      ) : (
        <b className="dim">Sem cadastro PRF</b>
      )}
      <small className={tone}>{originLabel}</small>
    </span>
  )
}

/** Coluna "CISP mais lida": a área de delegacia onde a placa mais passa no Cerco e a parcela das leituras dela ali. */
export function mainCispCell(
  row: Pick<
    CorrelationRankingRow,
    'main_cisp' | 'main_cisp_name' | 'main_cisp_share' | 'main_cisp_detections'
  >,
): ReactNode {
  if (!row.main_cisp)
    return (
      <span className="ranking-vehicle">
        <b className="dim">Sem leitura</b>
      </span>
    )
  const parts = cispParts(row.main_cisp, row.main_cisp_name)
  const share = formatPercent(row.main_cisp_share ?? 0, 0)
  const total = row.main_cisp_detections ?? 0
  return (
    <span
      className="ranking-vehicle"
      title={`${parts.locality ?? 'Unidade sem nome cadastrado'} · ${parts.unit}\n${share} de ${pluralize(total, 'leitura', 'leituras')} da placa no Cerco Eletrônico`}
    >
      <b>{parts.locality ?? parts.unit}</b>
      <small>
        {parts.locality ? `${parts.unit} · ` : ''}
        {share} das leituras
      </small>
    </span>
  )
}

/** Tipo do veículo da placa (PRF quando houver cadastro), para listas compactas. */
export function VehicleTypeText({
  fields,
  fallback,
}: {
  fields: VehicleFields
  fallback: string
}) {
  return (
    <>
      {vehicleTypeLabel(fields.vehicle_type, fields.vehicle_type_share) ??
        fallback}
    </>
  )
}

export function recentActivityCell(row: CorrelationRankingRow): ReactNode {
  const window = recentActivityWindow(row)
  if (!window)
    return (
      <span className="recent-activity-empty">Sem detecção em 45 dias</span>
    )
  const count = recentActivityCount(row, window)
  const detectionLabel = count === 1 ? 'detecção' : 'detecções'
  const details = `Cerco Eletrônico. 7 dias: ${formatNumber(row.detections_7d)}; 15 dias: ${formatNumber(row.detections_15d)}; 30 dias: ${formatNumber(row.detections_30d)}; 45 dias: ${formatNumber(row.detections_45d)}.`
  const lastSeen = row.recent_activity_last_seen
    ? `Última ${formatDayMonthTime(row.recent_activity_last_seen)}`
    : 'Sem horário recente'
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`ranking-activity-summary ${recentActivityTone(window)}`}
          aria-label={`${formatNumber(count)} ${detectionLabel} em ${window} dias. ${lastSeen}. ${details}`}
        >
          <span>
            <strong>{formatNumber(count)}</strong>
            <em>
              {detectionLabel} em {window} dias
            </em>
          </span>
          <small>{lastSeen}</small>
        </button>
      </TooltipTrigger>
      <TooltipContent className="recent-activity-tooltip" side="top">
        <strong>Atividade no Cerco Eletrônico</strong>
        <div>
          {([7, 15, 30, 45] as const).map((days) => (
            <span key={days}>
              <b>{days}d</b>
              {formatNumber(row[`detections_${days}d`])}
            </span>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
