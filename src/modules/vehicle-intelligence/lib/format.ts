/** Números, distâncias, durações e textos curtos do painel, no formato pt-BR. */

const NUMBER = new Intl.NumberFormat('pt-BR')
// Um formatador por número de casas, criado na primeira vez (`toLocaleString` cria um a cada chamada).
const decimals = new Map<string, Intl.NumberFormat>()

/** "12.345"; ausente vira 0. */
export const formatNumber = (value: number | null | undefined) =>
  NUMBER.format(value ?? 0)

/** "1,5": até `digits` casas, e pelo menos `minimum` ("1,0" com 1 e 1). */
export function formatDecimal(value: number, digits = 1, minimum = 0): string {
  const key = `${minimum}:${digits}`
  let formatter = decimals.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: minimum,
      maximumFractionDigits: digits,
    })
    decimals.set(key, formatter)
  }
  return formatter.format(value)
}

/** "1 placa", "3 placas", "1.204 leituras". */
export const pluralize = (count: number, singular: string, plural: string) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`

/** "12,5%" (até `digits` casas); `fixed` escreve sempre uma casa ("12,0%"). */
export const formatPercent = (value: number, digits = 1, fixed = false) =>
  `${formatDecimal(value, digits, fixed ? digits : 0)}%`

// ---------------------------------------------------------------- distâncias

/**
 * Distância em metros: "510 m", "2,4 km". O perfil da placa e a timeline escrevem o km sempre com uma casa
 * (`fixedKm`: "1,0 km"); as correlatas, o Perfil do RO e os filtros, só quando há fração ("1 km").
 */
export function formatDistance(
  meters: number | null | undefined,
  { empty = '—', fixedKm = false }: { empty?: string; fixedKm?: boolean } = {},
): string {
  if (meters == null || !Number.isFinite(meters)) return empty
  if (meters < 1000) return `${formatNumber(Math.round(meters))} m`
  return `${formatDecimal(meters / 1000, 1, fixedKm ? 1 : 0)} km`
}

/** Sempre em metros, sem passar a km: "850 m", "1.500 m". */
export const formatMeters = (meters: number | null | undefined, empty = '—') =>
  meters == null ? empty : `${formatNumber(Math.round(meters))} m`

// ---------------------------------------------------------------- tempos

/** "1,5 h" (até uma casa decimal). */
export const formatHours = (hours: number) => `${formatDecimal(hours, 1)} h`

/** "3,3 min" (até uma casa). */
export const formatMinutes = (
  minutes: number | null | undefined,
  empty = '—',
) => (minutes == null ? empty : `${formatDecimal(minutes, 1)} min`)

/** Tempo entre duas leituras (timeline): "45 s", "1 h 05 min", "12 min"; os minutos são truncados. */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.max(0, Math.round(seconds))} s`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours
    ? `${hours} h ${minutes.toString().padStart(2, '0')} min`
    : `${minutes} min`
}

/**
 * Duração de uma parada ou viagem (tendências da placa): "45 s", "2 h 05 min", "1,5 dias"; "—" sem valor. Os
 * minutos são arredondados.
 */
export function formatStopDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—'
  if (seconds < 60) return `${Math.round(seconds)} s`
  if (seconds >= 86_400)
    return `${formatDecimal(seconds / 3600 / 24, 1, 1)} dias`
  const minutes = Math.round(seconds / 60)
  const hours = Math.floor(minutes / 60)
  return hours
    ? `${hours} h ${String(minutes % 60).padStart(2, '0')} min`
    : `${minutes} min`
}

/** Intervalo arredondado à maior unidade: "25 min", "5 h", "3 dias"; "—" sem valor. */
export function formatInterval(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return '—'
  const minutes = Math.round(milliseconds / 60000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.round(hours / 24)
  return `${days} ${days === 1 ? 'dia' : 'dias'}`
}

/**
 * Tempo do fato à desconexão (pós-evento): "5 h" até um dia, "1,5 dias" depois. As horas saem com até `hourDigits`
 * casas: a copassagem mostra até 3, o entorno até 1.
 */
export function formatElapsedHours(
  value: number | null | undefined,
  hourDigits = 3,
): string {
  if (value == null) return 'tempo não calculado'
  if (value < 24) return `${formatDecimal(value, hourDigits)} h`
  return `${formatDecimal(value / 24, 1)} dias`
}

/**
 * Minutos até o fato, com o sentido (Perfil do RO): "7 min antes", "2,5 h depois" (de 2 h em diante),
 * "no minuto do fato"; `minutes` negativo é antes.
 */
export function formatMinutesFromFact(
  minutes: number | null | undefined,
): string {
  if (minutes == null) return '—'
  const rounded = Math.round(Math.abs(minutes))
  if (rounded === 0) return 'no minuto do fato'
  const amount = rounded >= 120 ? formatHours(rounded / 60) : `${rounded} min`
  return `${amount} ${minutes < 0 ? 'antes' : 'depois'}`
}

/** Minutos até o fato, sem o sentido (perfil da placa): "12 min", "1h15", "2 h". */
export function formatMinutesApart(minutes: number): string {
  const absolute = Math.abs(minutes)
  if (absolute < 60) return `${formatNumber(Math.round(absolute))} min`
  const hours = Math.floor(absolute / 60)
  const rest = Math.round(absolute % 60)
  return rest ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours} h`
}

// ---------------------------------------------------------------- texto

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Texto seguro para o HTML montado à mão (popups e rótulos do Leaflet e do deck.gl); ausente vira "". */
export const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) => HTML_ENTITIES[character],
  )
