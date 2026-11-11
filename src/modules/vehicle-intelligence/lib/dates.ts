/**
 * Datas e horários do painel: sempre no horário de Brasília (Rio de Janeiro), qualquer que seja o
 * fuso do navegador (pedido de 10/10). Só este arquivo lê texto como data (`new Date(texto)` lê no fuso
 * do navegador; o ESLint barra o resto).
 *
 * A API manda instantes com fuso (`-03:00`, `-03` ou `Z`) e datas sem hora (`AAAA-MM-DD`). Um instante
 * sem fuso já vem do banco no horário local e é lido como `-03:00` (o Rio não tem horário de verão
 * desde 2019); uma data sem hora vira o meio-dia de Brasília, para não mudar de dia ao formatar.
 */

export const TIME_ZONE = 'America/Sao_Paulo'
/** O horário de Brasília como deslocamento fixo (sem horário de verão desde 2019). */
const OFFSET = '-03:00'
const DAY_MS = 86_400_000

/** Um valor da API (texto), um instante em ms ou uma data. */
type DateInput = string | number | Date | null | undefined

const DATE_ONLY = /^\d{4}-\d{2}(-\d{2})?$/
const WITHOUT_OFFSET = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/
const OFFSET_WITHOUT_MINUTES = /([+-]\d{2})$/

/** O instante de um valor da API. */
export function parseInstant(value: string): Date {
  const text = value.trim()
  if (DATE_ONLY.test(text))
    return new Date(
      `${text.length === 7 ? `${text}-01` : text}T12:00:00${OFFSET}`,
    )
  if (WITHOUT_OFFSET.test(text))
    return new Date(`${text.replace(' ', 'T')}${OFFSET}`)
  return new Date(
    text.replace(' ', 'T').replace(OFFSET_WITHOUT_MINUTES, '$1:00'),
  )
}

/** O instante de qualquer entrada; nulo sem valor ou quando ela não é uma data. */
export function toInstant(value: DateInput): Date | null {
  if (value == null || value === '') return null
  const date =
    value instanceof Date
      ? value
      : typeof value === 'number'
        ? new Date(value)
        : parseInstant(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** O instante em ms (`NaN` quando não é data), para ordenar e medir intervalos. */
export const instantMs = (value: string) => parseInstant(value).getTime()

// `toLocaleString` cria um formatador a cada chamada (~70× mais lento em listas longas): um por formato, guardado.
const formatters = new Map<string, Intl.DateTimeFormat>()

/** O formatador reaproveitável de um formato, já no horário de Brasília. */
export function brasiliaFormatter(
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = JSON.stringify(options)
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('pt-BR', {
      ...options,
      timeZone: TIME_ZONE,
    })
    formatters.set(key, formatter)
  }
  return formatter
}

/** Formata no horário de Brasília; `empty` quando não há valor ou ele não é uma data. */
export function formatInBrasilia(
  value: DateInput,
  options: Intl.DateTimeFormatOptions,
  empty = '—',
): string {
  const date = toInstant(value)
  return date ? brasiliaFormatter(options).format(date) : empty
}

const formatWith =
  (options: Intl.DateTimeFormatOptions) =>
  (value: DateInput, empty = '—') =>
    formatInBrasilia(value, options, empty)

/** "10/10/2026, 16:12". */
export const formatDateTime = formatWith({
  dateStyle: 'short',
  timeStyle: 'short',
})
/** "10/10/2026, 16:12:05". */
export const formatDateTimeSeconds = formatWith({
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
/** "10/10/2026". */
export const formatDate = formatWith({
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
/** "14/10". */
export const formatDayMonth = formatWith({ day: '2-digit', month: '2-digit' })
/** "14/10/26". */
export const formatDayMonthYear = formatWith({
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})
/** "14/10 16:12". */
export const formatDayMonthTime = formatWith({
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})
/** "16:12". */
export const formatTime = formatWith({ hour: '2-digit', minute: '2-digit' })
/** "16:12:05". */
export const formatTimeSeconds = formatWith({
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

/** A hora (0 a 23) em Brasília; nulo sem valor ou quando não é data. */
export function hourInBrasilia(value: DateInput): number | null {
  const date = toInstant(value)
  if (!date) return null
  const hour = Number(
    brasiliaFormatter({ hour: '2-digit', hour12: false }).format(date),
  )
  return Number.isFinite(hour) ? hour % 24 : null
}

// ---------------------------------------------------------------- dias civis (AAAA-MM-DD)

const ISO_DAY = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TIME_ZONE,
})

/** O dia civil em Brasília (AAAA-MM-DD) de um instante; vazio quando não é data. */
export function civilDay(value: DateInput): string {
  const date = toInstant(value)
  return date ? ISO_DAY.format(date) : ''
}

/** A data de hoje em Brasília, como AAAA-MM-DD (nomes de arquivo). */
export const todayIso = () => civilDay(new Date())

/** O começo do dia civil (00:00 em Brasília), em ms. */
export const dayStartMs = (day: string) =>
  new Date(`${day.slice(0, 10)}T00:00:00${OFFSET}`).getTime()

/** O dia `days` dias depois (ou antes, se negativo). */
export const shiftDay = (day: string, days: number) =>
  civilDay(parseInstant(day.slice(0, 10)).getTime() + days * DAY_MS)

/** A segunda-feira da semana do dia (a `date_trunc('week')` do DuckDB). */
export function weekStart(day: string): string {
  const noon = parseInstant(day.slice(0, 10))
  return civilDay(noon.getTime() - ((noon.getUTCDay() + 6) % 7) * DAY_MS)
}

/** Os dias de `start` a `end` (AAAA-MM-DD), um a um no calendário de Brasília. */
export function eachDay(start: string, end: string): string[] {
  const days: string[] = []
  const last = parseInstant(end.slice(0, 10)).getTime()
  for (
    let cursor = parseInstant(start.slice(0, 10)).getTime();
    cursor <= last;
    cursor += DAY_MS
  ) {
    days.push(civilDay(cursor))
  }
  return days
}

/** Dias corridos entre dois instantes, contando os dois; 0 sem um deles. */
export function calendarDaySpan(
  start: string | null,
  end: string | null,
): number {
  const from = start ? toInstant(start) : null
  const to = end ? toInstant(end) : null
  if (!from || !to) return 0
  return Math.max(1, Math.floor((to.getTime() - from.getTime()) / DAY_MS) + 1)
}

/** "2026-01-16" vira "16/01/2026" sem passar pelo fuso (é data civil, não instante). */
export function formatCivilDay(
  value: string | null | undefined,
  empty = '—',
): string {
  if (!value) return empty
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

/**
 * Intervalo de dias: "02/01 – 30/09/2026" (o ano do início só aparece quando difere do fim). O cabeçalho separa com
 * " – " e o rótulo do período com "–" colado.
 */
export function formatDayRange(
  start: string,
  end: string,
  separator = ' – ',
): string {
  const [y1, m1, d1] = start.slice(0, 10).split('-')
  const [y2, m2, d2] = end.slice(0, 10).split('-')
  return `${d1}/${m1}${y1 === y2 ? '' : `/${y1}`}${separator}${d2}/${m2}/${y2}`
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

/** "jan/26" de um dia AAAA-MM-DD. */
const shortMonth = (day: string) =>
  `${MONTH_ABBREVIATIONS[Number(day.slice(5, 7)) - 1]}/${day.slice(2, 4)}`

/** Intervalo de meses: "jan/26 – out/26". */
export const formatMonthRange = (start: string, end: string) =>
  `${shortMonth(start)} – ${shortMonth(end)}`

/** Intervalo de meses em maiúsculas: "JAN 2026 — SET 2026". */
export function formatMonthYearRange(start: string, end: string): string {
  const format = (value: string) =>
    formatInBrasilia(value, { month: 'short', year: 'numeric' })
      .replace('.', '')
      .toUpperCase()
  return `${format(start)} — ${format(end)}`
}
