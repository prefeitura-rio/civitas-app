/**
 * Datas e horários do painel: sempre no horário de Brasília (Rio de Janeiro), qualquer que seja o
 * fuso do navegador (pedido de 10/10).
 *
 * A API manda instantes com fuso (`-03:00`, `-03` ou `Z`) e datas sem hora (`AAAA-MM-DD`). Um instante
 * sem fuso já vem do banco no horário local e é lido como `-03:00` (o Rio não tem horário de verão
 * desde 2019); uma data sem hora vira o meio-dia de Brasília, para não mudar de dia ao formatar.
 */

export const TIME_ZONE = 'America/Sao_Paulo'

type DateInput = string | Date | null | undefined

const DATE_ONLY = /^\d{4}-\d{2}(-\d{2})?$/
const WITHOUT_OFFSET = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/
const OFFSET_WITHOUT_MINUTES = /([+-]\d{2})$/

/** O instante de um valor da API. */
export function parseInstant(value: string): Date {
  const text = value.trim()
  if (DATE_ONLY.test(text))
    return new Date(`${text.length === 7 ? `${text}-01` : text}T12:00:00-03:00`)
  if (WITHOUT_OFFSET.test(text))
    return new Date(`${text.replace(' ', 'T')}-03:00`)
  return new Date(
    text.replace(' ', 'T').replace(OFFSET_WITHOUT_MINUTES, '$1:00'),
  )
}

/** Formata no horário de Brasília; `empty` quando não há valor ou ele não é uma data. */
export function formatInBrasilia(
  value: DateInput,
  options: Intl.DateTimeFormatOptions,
  empty = '—',
): string {
  if (value == null || value === '') return empty
  const date = value instanceof Date ? value : parseInstant(value)
  return Number.isNaN(date.getTime())
    ? empty
    : date.toLocaleString('pt-BR', { ...options, timeZone: TIME_ZONE })
}

/** "10/10/2026, 16:12". */
export const formatDateTime = (value: DateInput, empty = '—') =>
  formatInBrasilia(value, { dateStyle: 'short', timeStyle: 'short' }, empty)

/** "10/10/2026". */
export const formatDate = (value: DateInput, empty = '—') =>
  formatInBrasilia(
    value,
    { day: '2-digit', month: '2-digit', year: 'numeric' },
    empty,
  )

/** Um formatador reaproveitável, já no horário de Brasília. */
export function brasiliaFormatter(
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: TIME_ZONE })
}

// Formatadores em cache: `formatInBrasilia` cria um a cada chamada (~70× mais lento em listas longas).
const DAY_MONTH = brasiliaFormatter({ day: '2-digit', month: '2-digit' })
const DAY_MONTH_YEAR = brasiliaFormatter({
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})
const withFormatter =
  (formatter: Intl.DateTimeFormat) =>
  (value: DateInput, empty = '—') => {
    if (value == null || value === '') return empty
    const date = value instanceof Date ? value : parseInstant(value)
    return Number.isNaN(date.getTime()) ? empty : formatter.format(date)
  }
/** "14/10". */
export const formatDayMonth = withFormatter(DAY_MONTH)
/** "14/10/26". */
export const formatDayMonthYear = withFormatter(DAY_MONTH_YEAR)

/** A data de hoje em Brasília, como AAAA-MM-DD (nomes de arquivo). */
export function todayIso(): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIME_ZONE,
  }).format(new Date())
}

/** "jan", "fev"… (eixos e rótulos curtos dos gráficos). */
export const MONTH_ABBREVIATIONS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]
