import type { DemandVolumeGranularity } from '@/http/tickets/get-demand-volume'

const MONTH_ABBR = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export function formatPeriodLabel(
  label: string,
  granularity: DemandVolumeGranularity,
): string {
  if (granularity === 'monthly') {
    // "2026-03" → "Mar/26"
    const [year, month] = label.split('-')
    const monthIdx = parseInt(month, 10) - 1
    const abbr = MONTH_ABBR[monthIdx] ?? label
    return `${abbr}/${year?.slice(2)}`
  }

  if (granularity === 'weekly') {
    // "2026-W12" → "Sem. 12"
    const match = label.match(/W(\d+)$/)
    if (match) return `Sem. ${match[1]}`
    return label
  }

  if (granularity === 'yearly') {
    // "2026" → "2026"
    return label
  }

  return label
}
