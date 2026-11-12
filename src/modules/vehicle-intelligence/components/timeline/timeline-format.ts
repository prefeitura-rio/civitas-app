/**
 * Textos da timeline: horários e dias no fuso de Brasília, durações, distâncias e as notas de desconexão,
 * georreferenciamento, veículo e território.
 */
import { factionAbbreviation } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import type { TimelineCase } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import {
  brasiliaFormatter,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatHours } from '@/modules/vehicle-intelligence/lib/format'
import type { GroupDetectionMark } from '@/modules/vehicle-intelligence/types/domain'

const dateFormatter = brasiliaFormatter({
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const timeFormatter = brasiliaFormatter({
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function formatTime(value: string) {
  return timeFormatter.format(parseInstant(value))
}
export const dayMonthTime = brasiliaFormatter({
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})
export function dayLabel(value: string) {
  return dateFormatter.format(new Date(`${value}T12:00:00-03:00`))
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
      .formatToParts(new Date(`${value}T12:00:00-03:00`))
      .map((part) => [part.type, part.value.replace('.', '')]),
  )
  return `${capitalized(parts.weekday)}, ${parts.day} ${parts.month} ${parts.year}`
}
/** "Qui 16/01" na lista de dias. */
export function listDayLabel(value: string) {
  const parts = Object.fromEntries(
    listDateFormatter
      .formatToParts(new Date(`${value}T12:00:00-03:00`))
      .map((part) => [part.type, part.value.replace('.', '')]),
  )
  return `${capitalized(parts.weekday)} ${parts.day}/${parts.month}`
}
export function durationLabel(seconds: number) {
  if (seconds < 60) return `${Math.max(0, Math.round(seconds))} s`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours
    ? `${hours} h ${minutes.toString().padStart(2, '0')} min`
    : `${minutes} min`
}
export function distanceLabel(kilometers: number) {
  return kilometers < 1
    ? `${Math.round(kilometers * 1000)} m`
    : `${kilometers.toFixed(1).replace('.', ',')} km`
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
  return `${durationLabel(Math.abs(seconds))} ${seconds < 0 ? 'antes' : 'depois'} ${referenceLabel}`
}
/** "18,5 h sem leitura (próxima em 13/02 10:46); lida aqui 0,7 h depois do fato." */
export function disconnectionText(mark: GroupDetectionMark) {
  const gapText =
    mark.gap_hours != null && mark.next_at
      ? `Último local antes de ${formatHours(mark.gap_hours)} sem leitura (próxima leitura em ${dayMonthTime.format(parseInstant(mark.next_at))}).`
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
      ? distanceLabel(mark.distance_meters / 1000)
      : null,
  ]
    .filter(Boolean)
    .join(' · ')
}
