import { RANKING } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants'
import { todayIso } from '@/modules/vehicle-intelligence/lib/dates'
import type {
  CorrelationRankingRow,
  CorrelationRankingView,
} from '@/modules/vehicle-intelligence/types/domain'

function csvCell(value: string | number | boolean | null | undefined): string {
  if (value == null) return '""'
  const text =
    typeof value === 'boolean' ? (value ? 'sim' : 'não') : String(value)
  // Evita que planilhas interpretem o conteúdo como fórmula.
  const safeText = /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

export function buildCorrelationRankingCsv(
  rows: CorrelationRankingRow[],
  view: CorrelationRankingView,
): string {
  const header = [
    'posicao',
    'placa',
    'visao',
    ...RANKING.csvColumns.map((column) => column.header),
  ]
    .map(csvCell)
    .join(';')
  const body = rows.map((row, index) =>
    [
      index + 1,
      row.plate,
      RANKING.csvViews[view] ?? view,
      ...RANKING.csvColumns.map((column) => column.value(row)),
    ]
      .map(csvCell)
      .join(';'),
  )
  return `\uFEFF${[header, ...body].join('\r\n')}\r\n`
}

export function correlationRankingFilename(
  view: CorrelationRankingView,
  exportedRows: number,
): string {
  const date = todayIso()
  return `ranking-placas-${view.replaceAll('_', '-')}-top-${exportedRows}-${date}.csv`
}
