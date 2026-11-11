/** Regras puras do perfil do RO: o que a chave da rota é, os sinais e a ordem das listas, os rótulos e os pontos do
 * mapa, e onde uma placa citada aparece no relato. */
import type {
  OccurrencePlateRow,
  OccurrencePoint,
  PlateMarks,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import {
  formatDate,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { titleCase } from '@/modules/vehicle-intelligence/lib/labels'

const PLATE = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/

/** A rota `/occurrence/<chave>` abre um RO ou a lista dos ROs de uma placa vítima. */
export const keyKind = (key: string): 'plate' | 'ro' =>
  PLATE.test(key.trim().toUpperCase()) ? 'plate' : 'ro'

// ---------------------------------------------------------------- sinais

/** Um sinal próprio da placa, com a posição dele na ordem (`tier`: menor primeiro). */
export type PlateSignal = {
  tier: number
  label: string
  short: string
  detail?: string
}

const CLONE_TEMPERATURES: Record<string, number> = {
  quente: 0,
  morna: 1,
  fria: 2,
}

/** Os sinais da placa, na ordem em que pesam: a citada no relato deste RO, a citada em outro RO, o Cerco, a citada no
 * Disque Denúncia (anônima, não verificada), a compatível com um trecho de placa citado aqui (um trecho casa com várias
 * placas: pesa menos que a placa inteira) e o clone (confirmado, depois as suspeitas quente, morna e fria). A ordem diz
 * o que conferir primeiro; nenhum sinal é autoria. */
export function plateSignals(
  row: Omit<PlateMarks, 'plate'>,
  ro: string,
): PlateSignal[] {
  const signals: PlateSignal[] = []
  const otherRos = [
    ...new Set(row.author_citations.map((item) => item.ro)),
  ].filter((item) => item !== ro)
  if (row.cited_here)
    signals.push({
      tier: 0,
      label: 'Citada na dinâmica deste RO',
      short: 'citada neste RO',
    })
  if (otherRos.length)
    signals.push({
      tier: 1,
      label:
        otherRos.length === 1
          ? 'Citada na dinâmica de outro RO'
          : `Citada na dinâmica de ${otherRos.length} ROs`,
      short: 'citada em outro RO',
      detail:
        otherRos.slice(0, 3).join(', ') + (otherRos.length > 3 ? '…' : ''),
    })
  if (row.in_cerco)
    signals.push({
      tier: 2,
      label: 'Monitorada hoje no Cerco Digital',
      short: 'Cerco',
    })
  if (row.dd_reports)
    signals.push({
      tier: 3,
      label:
        row.dd_reports === 1
          ? 'Citada numa denúncia do Disque Denúncia'
          : `Citada em ${row.dd_reports} denúncias do Disque Denúncia`,
      short: 'Disque Denúncia',
      detail: [
        row.dd_last_subject && titleCase(row.dd_last_subject.toLowerCase()),
        row.dd_last_report && `a última em ${formatDate(row.dd_last_report)}`,
        'anônima, não verificada',
      ]
        .filter(Boolean)
        .join(' · '),
    })
  if (row.compatible_with?.length)
    signals.push({
      tier: 4,
      label: 'Compatível com o trecho citado',
      short: 'compatível com o trecho citado',
      detail: row.compatible_with.map((item) => `“${item}”`).join(', '),
    })
  if (row.is_clone_suspect) {
    const temperature = row.clone_temperature?.toLocaleLowerCase('pt-BR') ?? ''
    signals.push(
      row.is_clone_confirmed
        ? { tier: 5, label: 'Clone confirmado', short: 'clone confirmado' }
        : {
            tier: 6 + (CLONE_TEMPERATURES[temperature] ?? 2),
            label: `Suspeita de clone${temperature ? ` · ${temperature}` : ''}`,
            short: 'suspeita de clone',
          },
    )
  }
  return signals
}

export const hasSignal = (row: { signals?: string[] }) =>
  Boolean(row.signals?.length)

/** A posição da placa na ordem dos sinais; sem sinal, no fim. */
export const signalTier = (row: Omit<PlateMarks, 'plate'>, ro: string) =>
  plateSignals(row, ro)[0]?.tier ?? Number.POSITIVE_INFINITY

export const SIGNAL_ORDER =
  'citada na dinâmica deste RO, citada em outro RO, Cerco, citada no Disque Denúncia, compatível com um trecho de placa citado neste RO, clone confirmado e as suspeitas de clone quente, morna e fria'

// ---------------------------------------------------------------- ordem das listas

export type PlateSort =
  | 'signal'
  | 'strength'
  | 'together'
  | 'fact_time'
  | 'distance'
  | 'plate'

export const SORT_LABELS: Record<PlateSort, string> = {
  signal: 'com sinal primeiro, na ordem do sinal; depois, a força',
  strength: 'força da correlação',
  together: 'passagens junto da vítima',
  fact_time: 'menor tempo até o fato',
  distance: 'menor distância do local',
  plate: 'placa',
}

/** Maior primeiro (força, passagens) ou menor primeiro (tempo, distância); ausente sempre no fim. */
const SORT_VALUES: Record<
  Exclude<PlateSort, 'signal' | 'plate'>,
  [(row: OccurrencePlateRow) => number | null | undefined, 1 | -1]
> = {
  strength: [(row) => row.correlation_strength, -1],
  together: [(row) => row.cooccurrences ?? row.readings, -1],
  fact_time: [(row) => row.min_fact_delta_minutes, 1],
  distance: [(row) => row.min_fact_distance_meters, 1],
}

/** As linhas na ordem pedida. "signal": pela ordem dos sinais; dentro de cada um (e sem sinal), a ordem da API, que é
 * a da força. */
export function sortRows(
  rows: OccurrencePlateRow[],
  sort: PlateSort,
  ro: string,
): OccurrencePlateRow[] {
  if (sort === 'signal') {
    const tiers = new Map(rows.map((row) => [row.plate, signalTier(row, ro)]))
    return [...rows].sort((a, b) => {
      const left = tiers.get(a.plate)!
      const right = tiers.get(b.plate)!
      return left === right ? 0 : left < right ? -1 : 1
    })
  }
  if (sort === 'plate')
    return [...rows].sort((a, b) => a.plate.localeCompare(b.plate))
  const [value, direction] = SORT_VALUES[sort]
  return [...rows].sort((a, b) => {
    const left = value(a)
    const right = value(b)
    if (left == null || right == null)
      return left == null ? (right == null ? 0 : 1) : -1
    return (left - right) * direction || a.plate.localeCompare(b.plate)
  })
}

// ---------------------------------------------------------------- rótulos

/** "7 min antes", "3 min depois", "no minuto do fato" (`minutes` negativo é antes). */
export function minutesLabel(minutes: number | null | undefined): string {
  if (minutes == null) return '—'
  const rounded = Math.round(Math.abs(minutes))
  if (rounded === 0) return 'no minuto do fato'
  const amount =
    rounded >= 120
      ? `${(rounded / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`
      : `${rounded} min`
  return `${amount} ${minutes < 0 ? 'antes' : 'depois'}`
}

/** "3,3 min" (sem sinal; a lista guarda o tempo absoluto). */
export const minutesAmount = (minutes: number | null | undefined) =>
  minutes == null
    ? '—'
    : `${minutes.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min`

/** As leituras de uma placa: a primeira e a última. */
export type ReadingSpan = {
  first_seen: string | null
  last_seen: string | null
}

/** O menor tempo até o fato com o sentido, quando as leituras dizem: todas antes do fato, todas depois. Com leituras
 * dos dois lados, a lista não diz de qual veio o menor, então fica só o tempo. */
export function factDeltaLabel(
  minutes: number | null | undefined,
  span: ReadingSpan,
  eventTime: string | null,
): string {
  if (minutes == null) return '—'
  if (Math.abs(minutes) < 0.5) return 'no minuto do fato'
  const amount = minutesAmount(minutes)
  if (!eventTime || !span.first_seen || !span.last_seen) return amount
  const fact = parseInstant(eventTime).getTime()
  if (parseInstant(span.last_seen).getTime() < fact) return `${amount} antes`
  if (parseInstant(span.first_seen).getTime() > fact) return `${amount} depois`
  return amount
}

/** "4 antes e 7 depois do fato", "3 antes da vítima" (`reference`: do que as leituras contam antes e depois). */
export function aroundLabel(
  before: number,
  after: number,
  reference: 'do fato' | 'da vítima',
): string {
  if (!after) return `${formatNumber(before)} antes ${reference}`
  if (!before) return `${formatNumber(after)} depois ${reference}`
  return `${formatNumber(before)} antes e ${formatNumber(after)} depois ${reference}`
}

/** "510 m", "2,4 km". */
export function distanceLabel(meters: number | null | undefined): string {
  if (meters == null) return '—'
  if (meters < 1000) return `${formatNumber(Math.round(meters))} m`
  return `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`
}

/** "a 510 m · 7 min antes" (sem as partes ausentes). */
export const readingLabel = (reading: {
  distance_meters: number | null
  minutes_from_fact: number
}) =>
  [
    reading.distance_meters != null
      ? `a ${distanceLabel(reading.distance_meters)}`
      : null,
    minutesLabel(reading.minutes_from_fact),
  ]
    .filter(Boolean)
    .join(' · ')

// ---------------------------------------------------------------- a placa no relato

/** Um trecho de placa citado só é cruzado com as listas a partir destes caracteres (`analise.ocorrencia.TRECHO_MINIMO`). */
export const TRECHO_MINIMO = 3

/** Onde a placa (ou o trecho) aparece no texto, sem olhar espaço, ponto, traço, acento e caixa: "ERA5J37" acha
 * "Era 5j37". Com `boundary`, o achado começa ou termina numa fronteira de palavra (um trecho curto não casa no meio
 * de uma palavra qualquer). */
export function looseRanges(
  text: string,
  needle: string,
  boundary = false,
): Array<[number, number]> {
  const wanted = needle.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!wanted) return []
  let folded = ''
  const offsets: number[] = []
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
    if (/^[A-Z0-9]$/.test(character)) {
      folded += character
      offsets.push(index)
    }
  }
  const isWord = (index: number) =>
    index >= 0 && index < text.length && /[\p{L}\p{N}]/u.test(text[index])
  const ranges: Array<[number, number]> = []
  for (
    let from = folded.indexOf(wanted);
    from !== -1;
    from = folded.indexOf(wanted, from + 1)
  ) {
    const start = offsets[from]
    const end = offsets[from + wanted.length - 1] + 1
    if (boundary && isWord(start - 1) && isWord(end)) continue
    ranges.push([start, end])
  }
  return ranges
}

/** O trecho do texto em volta de um achado, cortado em palavras inteiras. */
export function snippetAround(
  text: string,
  [start, end]: [number, number],
  radius = 70,
) {
  let from = Math.max(0, start - radius)
  let to = Math.min(text.length, end + radius)
  if (from > 0) from = text.indexOf(' ', from) + 1 || from
  if (to < text.length)
    to = text.lastIndexOf(' ', to) > end ? text.lastIndexOf(' ', to) : to
  return {
    before: `${from > 0 ? '…' : ''}${text.slice(from, start)}`,
    match: text.slice(start, end),
    after: `${text.slice(end, to)}${to < text.length ? '…' : ''}`,
  }
}

// ---------------------------------------------------------------- mapa

/** Um marcador do mapa: os pontos de coleta no mesmo lugar (câmeras de um poste, sentidos) viram um só. */
export type MergedPoint = Omit<OccurrencePoint, 'point'> & { points: string[] }

export function mergePoints(points: OccurrencePoint[]): MergedPoint[] {
  const merged = new Map<string, MergedPoint>()
  for (const point of points) {
    const key = `${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}`
    const current = merged.get(key)
    if (!current) {
      const { point: id, ...rest } = point
      merged.set(key, {
        ...rest,
        points: [id],
        together: [...point.together],
        nearby: [...point.nearby],
        marked: [...point.marked],
        cited: [...point.cited],
      })
      continue
    }
    current.points.push(point.point)
    current.victim ||= point.victim
    for (const field of ['together', 'nearby', 'marked', 'cited'] as const)
      for (const plate of point[field])
        if (!current[field].includes(plate)) current[field].push(plate)
  }
  return [...merged.values()]
}
