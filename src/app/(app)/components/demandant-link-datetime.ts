import { addDays, endOfDay, isAfter, startOfDay } from 'date-fns'

/** Prazo máximo permitido pela regra de negócio (validade em relação a hoje). */
export const DEMANDANT_LINK_VALID_UNTIL_MAX_DAYS = 60

function startOfToday(now = new Date()): Date {
  return startOfDay(now)
}

export function getDemandantLinkValidUntilMaxInstant(now = new Date()): Date {
  const lastDay = startOfDay(addDays(now, DEMANDANT_LINK_VALID_UNTIL_MAX_DAYS))
  return endOfDay(lastDay)
}

/** Último dia (calendário) permitido para validade. */
export function getDemandantLinkValidUntilMaxDayStart(now = new Date()): Date {
  return startOfDay(addDays(now, DEMANDANT_LINK_VALID_UNTIL_MAX_DAYS))
}

/**
 * Limite inferior do calendário: hoje, ou o dia da data atual do vínculo se for anterior (edição legada).
 */
export function getDemandantLinkValidUntilCalendarFrom(
  selectedValue: Date | undefined,
  now = new Date(),
): Date {
  const todayStart = startOfToday(now)
  if (!selectedValue) return todayStart
  const dayStart = startOfDay(selectedValue)
  return dayStart < todayStart ? dayStart : todayStart
}

/**
 * Limite superior do calendário: hoje + 60 dias, ou o dia selecionado se for posterior (valor já existente fora do padrão).
 */
export function getDemandantLinkValidUntilCalendarTo(
  selectedValue: Date | undefined,
  now = new Date(),
): Date {
  const capStart = getDemandantLinkValidUntilMaxDayStart(now)
  if (!selectedValue) return capStart
  const dayStart = startOfDay(selectedValue)
  return isAfter(dayStart, capStart) ? dayStart : capStart
}

/** Pré-seleção sugerida: fim do dia em (hoje + 60 dias). */
export function getDefaultDemandantLinkValidUntil(now = new Date()): Date {
  return getDemandantLinkValidUntilMaxInstant(now)
}

export function isDemandantLinkValidUntilBeyondMax(
  date: Date | undefined,
  now = new Date(),
): boolean {
  if (!date) return false
  const max = getDemandantLinkValidUntilMaxInstant(now)
  return date.getTime() > max.getTime()
}

export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromDatetimeLocalValue(v: string): string | undefined {
  const t = v.trim()
  if (!t) return undefined
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

export function parseIsoToDate(
  iso: string | null | undefined,
): Date | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? undefined : d
}

/** Compara instantes de validade; `undefined` em ambos conta como iguais. */
export function validUntilInstantsEqual(
  a: Date | undefined,
  b: Date | undefined,
): boolean {
  const ta = a?.getTime()
  const tb = b?.getTime()
  if (ta === undefined && tb === undefined) return true
  if (ta === undefined || tb === undefined) return false
  return ta === tb
}
