import { addDays, endOfDay, isAfter, startOfDay } from 'date-fns'

export const MONITORED_PLATE_AUTHORITY_VALID_UNTIL_MAX_DAYS = 60

function startOfToday(now = new Date()): Date {
  return startOfDay(now)
}

export function getMonitoredPlateAuthorityValidUntilMaxInstant(
  now = new Date(),
): Date {
  const lastDay = startOfDay(
    addDays(now, MONITORED_PLATE_AUTHORITY_VALID_UNTIL_MAX_DAYS),
  )
  return endOfDay(lastDay)
}

export function getMonitoredPlateAuthorityValidUntilMaxDayStart(
  now = new Date(),
): Date {
  return startOfDay(
    addDays(now, MONITORED_PLATE_AUTHORITY_VALID_UNTIL_MAX_DAYS),
  )
}

export function getMonitoredPlateAuthorityValidUntilCalendarFrom(
  selectedValue: Date | undefined,
  now = new Date(),
): Date {
  const todayStart = startOfToday(now)
  if (!selectedValue) return todayStart
  const dayStart = startOfDay(selectedValue)
  return dayStart < todayStart ? dayStart : todayStart
}

export function getMonitoredPlateAuthorityValidUntilCalendarTo(
  selectedValue: Date | undefined,
  now = new Date(),
): Date {
  const capStart = getMonitoredPlateAuthorityValidUntilMaxDayStart(now)
  if (!selectedValue) return capStart
  const dayStart = startOfDay(selectedValue)
  return isAfter(dayStart, capStart) ? dayStart : capStart
}

export function getDefaultMonitoredPlateAuthorityValidUntil(
  now = new Date(),
): Date {
  return getMonitoredPlateAuthorityValidUntilMaxDayStart(now)
}

export function isMonitoredPlateAuthorityValidUntilBeyondMax(
  date: Date | undefined,
  now = new Date(),
): boolean {
  if (!date) return false
  const max = getMonitoredPlateAuthorityValidUntilMaxDayStart(now)
  return startOfDay(date).getTime() > max.getTime()
}

export const MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE =
  'Não é possível ativar um vínculo com validade anterior a hoje.'

export function isMonitoredPlateAuthorityValidUntilExpired(
  validUntil: string | Date | null | undefined,
  now = new Date(),
): boolean {
  if (!validUntil) return true
  const date = validUntil instanceof Date ? validUntil : new Date(validUntil)
  if (Number.isNaN(date.getTime())) return true
  return startOfDay(date).getTime() < startOfToday(now).getTime()
}

export function parseIsoToDate(
  iso: string | null | undefined,
): Date | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? undefined : startOfDay(d)
}

export function toMonitoredPlateAuthorityValidUntilIso(date: Date): string {
  return endOfDay(date).toISOString()
}

export function validUntilInstantsEqual(
  a: Date | undefined,
  b: Date | undefined,
): boolean {
  const ta = a ? startOfDay(a).getTime() : undefined
  const tb = b ? startOfDay(b).getTime() : undefined
  if (ta === undefined && tb === undefined) return true
  if (ta === undefined || tb === undefined) return false
  return ta === tb
}
