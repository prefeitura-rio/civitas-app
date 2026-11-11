import {
  brasiliaFormatter,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'

/** A hora do fato em Brasília ("20"), para o perfil horário. */
export const HOUR = brasiliaFormatter({ hour: '2-digit', hour12: false })

const DATE_TIME = brasiliaFormatter({ dateStyle: 'short', timeStyle: 'short' })

/** O instante de um valor da API (DuckDB manda "2026-01-04 22:00:00-03"); vazio ou inválido vira null. */
export function parseTime(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = parseInstant(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** "04/01/2026, 22:00"; sem valor, "Horário não informado"; o texto da API quando não é uma data. */
export function formatEventTime(value: string | null | undefined): string {
  const parsed = parseTime(value)
  if (!parsed) return value || 'Horário não informado'
  return DATE_TIME.format(parsed)
}
