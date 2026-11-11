import {
  formatCivilDay,
  formatTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatDistance,
  formatMinutesApart,
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import { titleCase } from '@/modules/vehicle-intelligence/lib/labels'
import type { PlateCitation } from '@/modules/vehicle-intelligence/types/domain'

/** O perfil escreve o km sempre com uma casa ("1,0 km"). */
const distanceLabel = (meters: number | null | undefined) =>
  formatDistance(meters, { fixedKm: true })

function relativeReading(
  reading: NonNullable<PlateCitation['nearest_in_time']>,
  approximate: boolean,
): string {
  const delta = reading.delta_minutes
  const when =
    delta == null
      ? ''
      : delta === 0
        ? approximate
          ? 'dentro da hora informada'
          : 'no horário do fato'
        : `${formatMinutesApart(delta)} ${delta < 0 ? 'antes' : 'depois'}${approximate ? ' da hora informada' : ' do fato'}`
  const where =
    reading.distance_meters == null
      ? ''
      : `a ${distanceLabel(reading.distance_meters)} do local`
  return [
    `às ${formatTime(reading.detected_at)}`,
    when,
    where,
    reading.location ? `(${titleCase(reading.location)})` : '',
  ]
    .filter(Boolean)
    .join(', ')
    .replace(', (', ' (')
}

export const citationVerdicts: Record<
  PlateCitation['status'],
  { tone: string; title: string }
> = {
  correlated: { tone: 'match', title: 'Correlacionada com o RO que a cita' },
  correlated_wider: { tone: 'near', title: 'Correlação só num recorte maior' },
  approximate_match: { tone: 'near', title: 'Lida dentro da hora informada' },
  no_time: { tone: 'unknown', title: 'RO sem horário exato' },
  read_outside: {
    tone: 'miss',
    title: 'Lida no dia, fora do raio e da janela',
  },
  not_read_that_day: { tone: 'miss', title: 'Não lida no dia do fato' },
  never_read: { tone: 'miss', title: 'Nunca lida pelo cerco' },
}

export function citationExplanation(
  item: PlateCitation,
  windowMinutes: number,
  radius: number,
): string {
  const nearest = item.nearest_in_time
  const approximate = item.approximate_hour
  const hourLabel = approximate
    ? `${formatTime(approximate.start)}–${formatTime(approximate.end)} (${approximate.origin})`
    : null
  const sameDay = `${pluralize(item.same_day_readings, 'leitura', 'leituras')} no dia`
  const closest = item.nearest_in_space
    ? `; a mais perto do local, a ${distanceLabel(item.nearest_in_space.distance_meters)}, às ${formatTime(item.nearest_in_space.detected_at)}`
    : ''
  switch (item.status) {
    case 'correlated':
      return `${formatNumber(item.correlation?.cooccurrences ?? 0)} leituras no raio de ${formatNumber(radius)} m e na janela de ±${windowMinutes} min; a mais próxima a ${formatMinutesApart(item.correlation?.min_delta_minutes ?? 0)} do horário e a ${distanceLabel(item.correlation?.min_distance_meters ?? null)} do local.`
    case 'correlated_wider': {
      const wider = item.wider_correlation
      return wider
        ? `Aparece com janela de ±${wider.event_window_minutes} min e raio de ${formatNumber(wider.radius_meters)} m: leitura a ${formatMinutesApart(wider.min_delta_minutes ?? 0)} do horário e a ${distanceLabel(wider.min_distance_meters)} do local. No recorte atual (±${windowMinutes} min, ${formatNumber(radius)} m) fica de fora.`
        : ''
    }
    case 'approximate_match':
      return `O RO só informa a hora: ${hourLabel}. ${pluralize(item.approximate_matches, 'leitura caiu', 'leituras caíram')} nessa hora (±${windowMinutes} min) a até ${formatNumber(radius)} m do fato${item.approximate_best ? `; a mais perto do local foi ${relativeReading(item.approximate_best, true)}` : ''}. É compatível, mas não substitui um horário exato.`
    case 'no_time':
      return hourLabel
        ? `O RO só informa a hora: ${hourLabel}. ${nearest ? `A leitura mais próxima dessa hora foi ${relativeReading(nearest, true)}` : 'Nenhuma leitura perto dessa hora'}. ${sameDay}${closest}.`
        : `Sem horário não há janela para correlacionar. ${sameDay}${closest}.`
    case 'read_outside':
      return `${nearest ? `Leitura mais próxima do horário ${relativeReading(nearest, false)}` : 'Sem leitura perto do horário'}. ${sameDay}${closest}.`
    case 'not_read_that_day':
      return `A placa tem ${formatNumber(item.total_readings)} leituras no período do cerco, nenhuma em ${formatCivilDay(item.event_date, 'data não informada')}.`
    case 'never_read':
      return 'Nenhuma leitura desta placa no período do cache: placa possivelmente transcrita errada, adulterada ou fora da cobertura dos equipamentos.'
  }
}

/** Texto curto da citação para as listas: conclusão e o que as leituras mostram. */
export function citationNote(
  item: PlateCitation,
  windowMinutes: number,
  radius: number,
): string {
  return `Placa citada na dinâmica deste RO. ${citationVerdicts[item.status].title}: ${citationExplanation(item, windowMinutes, radius)}`
}

/** Situação curta da citação, para a linha dos indicadores. */
export const citationStatusShort: Record<PlateCitation['status'], string> = {
  correlated: 'correlacionada',
  correlated_wider: 'correlacionada só num recorte maior',
  approximate_match: 'lida na hora informada',
  no_time: 'RO sem horário exato',
  read_outside: 'lida fora do raio e da janela',
  not_read_that_day: 'não lida no dia do fato',
  never_read: 'nunca lida pelo cerco',
}
