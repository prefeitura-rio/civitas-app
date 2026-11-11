/** Período dos fatos da barra de filtros: atalhos contados a partir do fato mais recente ou intervalo livre. */
import { MONTH_ABBREVIATIONS } from '@/modules/vehicle-intelligence/lib/dates'
import { periodStart } from '@/modules/vehicle-intelligence/lib/period'

export type PeriodPreset = 'all' | '12m' | '6m' | '3m' | '30d' | 'custom'
export interface FactPeriodFilter {
  preset: PeriodPreset
  start?: string
  end?: string
}
export const ALL_PERIOD: FactPeriodFilter = { preset: 'all' }
export type FactPeriod =
  | { start?: string | null; end?: string | null }
  | null
  | undefined

export const PERIOD_PRESETS: Array<
  [Exclude<PeriodPreset, 'custom'>, string, string]
> = [
  ['all', 'Base inteira', 'Base inteira'],
  ['12m', 'Últimos 12 meses', '12 meses'],
  ['6m', 'Últimos 6 meses', '6 meses'],
  ['3m', 'Últimos 3 meses', '3 meses'],
  ['30d', 'Últimos 30 dias', '30 dias'],
]

function shiftDays(iso: string, days: number): string {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Datas do período pedido; os atalhos contam a partir do fato mais recente da base. */
export function periodDates(
  period: FactPeriodFilter,
  factPeriod: FactPeriod,
): { start: string | null; end: string | null } {
  if (period.preset === 'all') return { start: null, end: null }
  if (period.preset === 'custom')
    return { start: period.start || null, end: period.end || null }
  const end = factPeriod?.end?.slice(0, 10)
  if (!end) return { start: null, end: null }
  if (period.preset === '30d') return { start: shiftDays(end, -29), end }
  return {
    start: periodStart(end, Number(period.preset.replace('m', '')))
      .toISOString()
      .slice(0, 10),
    end,
  }
}

const shortMonth = (iso: string) =>
  `${MONTH_ABBREVIATIONS[Number(iso.slice(5, 7)) - 1]}/${iso.slice(2, 4)}`
export const dayLabel = (iso: string) => iso.split('-').reverse().join('/')

export function periodRangeLabel(
  preset: Exclude<PeriodPreset, 'custom'>,
  factPeriod: FactPeriod,
): string {
  const { start, end } =
    preset === 'all'
      ? {
          start: factPeriod?.start?.slice(0, 10) ?? null,
          end: factPeriod?.end?.slice(0, 10) ?? null,
        }
      : periodDates({ preset }, factPeriod)
  return start && end ? `${shortMonth(start)} – ${shortMonth(end)}` : ''
}
