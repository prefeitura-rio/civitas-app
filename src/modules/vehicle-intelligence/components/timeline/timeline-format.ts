/**
 * Textos da timeline: horários e dias no fuso de Brasília, durações, distâncias e as notas de desconexão,
 * georreferenciamento, veículo e território.
 */
import { factionAbbreviation } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import type { TimelineCase } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import {
  brasiliaFormatter,
  formatDayMonthTime,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatDistance,
  formatDuration,
  formatHours,
} from '@/modules/vehicle-intelligence/lib/format'
import type { GroupDetectionMark } from '@/modules/vehicle-intelligence/types/domain'

const dateFormatter = brasiliaFormatter({
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
export function dayLabel(value: string) {
  return dateFormatter.format(parseInstant(value))
}
const shortDateFormatter = brasiliaFormatter({
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const listDateFormatter = brasiliaFormatter({
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
})
const capitalized = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)
/** "Dom, 02 mar 2026" no seletor de dia. */
export function shortDayLabel(value: string) {
  const parts = Object.fromEntries(
    shortDateFormatter
      .formatToParts(parseInstant(value))
      .map((part) => [part.type, part.value.replace('.', '')]),
  )
  return `${capitalized(parts.weekday)}, ${parts.day} ${parts.month} ${parts.year}`
}
/** "Qui 16/01" na lista de dias. */
export function listDayLabel(value: string) {
  const parts = Object.fromEntries(
    listDateFormatter
      .formatToParts(parseInstant(value))
      .map((part) => [part.type, part.value.replace('.', '')]),
  )
  return `${capitalized(parts.weekday)} ${parts.day}/${parts.month}`
}
/** `reference` já vem com o artigo: "do fato", "da vítima". */
export function relativeTimeLabel(
  value: string,
  reference: string,
  referenceLabel: string,
) {
  const seconds =
    (parseInstant(value).getTime() - parseInstant(reference).getTime()) / 1000
  if (Math.abs(seconds) < 1) return `no mesmo instante ${referenceLabel}`
  return `${formatDuration(Math.abs(seconds))} ${seconds < 0 ? 'antes' : 'depois'} ${referenceLabel}`
}
/** "18,5 h sem leitura (próxima em 13/02 10:46); lida aqui 0,7 h depois do fato." */
export function disconnectionText(mark: GroupDetectionMark) {
  const gapText =
    mark.gap_hours != null && mark.next_at
      ? `Último local antes de ${formatHours(mark.gap_hours)} sem leitura (próxima leitura em ${formatDayMonthTime(mark.next_at)}).`
      : 'Último local antes do fim das passagens: a placa não foi mais lida.'
  return mark.elapsed_hours != null
    ? `${gapText} A placa passou aqui ${formatHours(mark.elapsed_hours)} depois do fato.`
    : gapText
}

const GEOCODE_LABELS: Record<string, string> = {
  logradouro: 'Logradouro',
  logradouro_numero: 'Logradouro e número',
  logradouro_bairro: 'Logradouro e bairro',
  logradouro_bairro_numero: 'Logradouro, bairro e número',
  logradouro_oficial: 'Nome oficial equivalente',
  logradouro_oficial_numero: 'Nome oficial equivalente e número',
  logradouro_oficial_bairro: 'Nome oficial equivalente e bairro',
  logradouro_oficial_bairro_numero: 'Nome oficial equivalente, bairro e número',
  logradouro_variante: 'Variante estrutural da via',
  logradouro_variante_numero: 'Variante estrutural e número',
  logradouro_variante_bairro: 'Variante estrutural e bairro',
  logradouro_variante_bairro_numero: 'Variante estrutural, bairro e número',
  logradouro_aproximado_bairro: 'Grafia aproximada no bairro',
  logradouro_aproximado_bairro_numero: 'Grafia aproximada, bairro e número',
  // Geocodificados pelo painel (`pipeline.geocodificacao`): número fora das faixas da malha cai no trecho mais próximo.
  logradouro_numero_proximo: 'Logradouro e número aproximado',
  logradouro_bairro_numero_proximo: 'Logradouro, bairro e número aproximado',
  logradouro_aproximado: 'Grafia aproximada',
  logradouro_aproximado_numero: 'Grafia aproximada e número',
  logradouro_aproximado_numero_proximo: 'Grafia aproximada e número aproximado',
  logradouro_aproximado_bairro_numero_proximo:
    'Grafia aproximada, bairro e número aproximado',
  esquina: 'Esquina dos dois logradouros',
  nominatim_cache: 'Logradouro no cache do Nominatim',
  isp: 'Ponto informado pelo ISP',
  bairro: 'Só o bairro (ponto central)',
  cisp: 'Só a área da delegacia (ponto central)',
}

export function geocodeQualityLabel(value: string | null) {
  if (!value) return 'Precisão do georreferenciamento não informada'
  if (GEOCODE_LABELS[value])
    return `Georreferenciamento: ${GEOCODE_LABELS[value].toLowerCase()}`
  return `Georreferenciamento: ${value.replace(/^\d+\s*/, '').toLowerCase()}`
}

/** Categoria e modelo do veículo subtraído (copassagem), sem repetir "não informado". */
export function vehicleLabel(item: TimelineCase) {
  return (
    [item.target_category, item.vehicle_model]
      .map((value) => (value || '').trim())
      .filter((value) => value && value.toUpperCase() !== 'NÃO INFORMADO')
      .join(' · ') || 'veículo não informado'
  )
}

/** Território perto da marca: "Complexo do São Carlos · TCP · 320 m". */
export function territoryLabel(
  mark: Pick<GroupDetectionMark, 'complex' | 'faction' | 'distance_meters'>,
) {
  if (!mark.complex) return null
  return [
    mark.complex,
    factionAbbreviation(mark.faction) || null,
    mark.distance_meters != null
      ? formatDistance(mark.distance_meters, { fixedKm: true })
      : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

const LOWERCASE_WORDS = new Set([
  'a',
  'as',
  'o',
  'os',
  'e',
  'de',
  'da',
  'das',
  'do',
  'dos',
  'em',
  'na',
  'nas',
  'no',
  'nos',
])
const UPPERCASE_WORDS = new Set(['br', 'rj', 'sp', 'mg', 'es', 'cep', 'cet'])
/** Algarismos romanos curtos (Praça XV, Pedro II): só x, v e i, para não pegar palavras como "mil". */
const ROMAN_NUMERAL = /^x{0,3}(ix|iv|v?i{0,3})$/

/**
 * Local em caixa de título, como na timeline do Painel de Clonagem: a fonte publica tudo em maiúsculas, o que alonga e
 * pesa as listas. Texto que já vem com caixa mista fica igual; siglas, códigos com número e conectivos ficam como são.
 */
export function placeName(value: string | null | undefined) {
  const text = String(value || '').trim()
  if (!text || text !== text.toUpperCase()) return text
  return text
    .toLowerCase()
    .split(/(\s+|-|\/|\(|,)/)
    .map((part, index, parts) => {
      if (
        !/\p{L}/u.test(part) ||
        /\d/.test(part) ||
        UPPERCASE_WORDS.has(part) ||
        ROMAN_NUMERAL.test(part)
      )
        return part.toUpperCase()
      // Conectivo no meio fica minúsculo; no fim é nome (Rua E, Rua A).
      if (index > 0 && index < parts.length - 1 && LOWERCASE_WORDS.has(part))
        return part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join('')
}
