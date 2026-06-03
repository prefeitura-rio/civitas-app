export function parseDemandVolumeDate(s: string | undefined): Date | undefined {
  if (!s?.trim()) return undefined
  const trimmed = s.trim()
  const datePart = trimmed.includes('T') ? trimmed.slice(0, 10) : trimmed
  const [year, month, day] = datePart.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const d = new Date(year, month - 1, day)
  return Number.isNaN(d.getTime()) ? undefined : d
}

export function toDemandVolumeDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function compareDemandVolumeDates(a: string, b: string): number {
  const dateA = parseDemandVolumeDate(a)
  const dateB = parseDemandVolumeDate(b)
  if (!dateA || !dateB) return 0
  return dateA.getTime() - dateB.getTime()
}

/** Garante dateFrom <= dateTo; ajusta o campo oposto quando o usuário viola o intervalo. */
export function normalizeDemandVolumeDateRange(
  dateFrom: string,
  dateTo: string,
  changed: 'from' | 'to',
): { dateFrom: string; dateTo: string } {
  if (!dateFrom || !dateTo) return { dateFrom, dateTo }
  if (compareDemandVolumeDates(dateFrom, dateTo) <= 0) {
    return { dateFrom, dateTo }
  }
  if (changed === 'from') {
    return { dateFrom, dateTo: dateFrom }
  }
  return { dateFrom: dateTo, dateTo }
}
