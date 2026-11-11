import type { ReactNode } from 'react'

import { PlateButton } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import {
  looseRanges,
  readingLabel,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type {
  CitedPlate,
  OccurrenceFact,
  OccurrenceProfileData,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import {
  formatDate,
  formatDateTime,
  formatDayMonth,
  formatTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import {
  categoryLabel,
  cispParts,
  titleCaseText,
} from '@/modules/vehicle-intelligence/lib/labels'

type Found = Extract<OccurrenceProfileData, { found: true }>
type Occurrence = Found['occurrence']

/** De onde veio o horário (revisão de transeuntes). */
const TIME_ORIGINS: Record<string, string> = {
  relato_aproximado: 'aproximado, pelo relato',
  registro_isp: 'registro no ISP, sem revisão',
  ponto_medio_intervalo: 'ponto médio do intervalo do relato',
  sem_minutos: 'sem os minutos: só a hora',
  conflito_hora_relato: 'a hora registrada diverge da do relato',
  relato_minutos_explicitos: 'com os minutos ditos no relato',
  conflito_data_relato: 'a data registrada diverge da do relato',
  conflito_data_intervalo: 'a data diverge do intervalo do relato',
  intervalo_limites_iguais: 'início e fim do intervalo iguais',
  base_antiga_preservada: 'o da base anterior, mantido',
  horario_ambiguo: 'ambíguo no relato',
  intervalo_ambiguo: 'intervalo ambíguo no relato',
}

/** A precisão do horário (carga). */
const TIME_PRECISIONS: Record<string, string> = {
  MINUTO_NARRATIVA: 'minuto dito na dinâmica',
  MINUTO_GERENCIALWEB: 'minuto do registro',
  HORA_NARRATIVA: 'só a hora, pela dinâmica',
  HORA_ISP: 'só a hora, pelo ISP',
  'hora cheia': 'hora cheia no registro (pode ser aproximada)',
  'meia hora': 'meia hora no registro (pode ser aproximada)',
  minuto: 'minuto do registro',
}

/** O episódio (banco experimental): ROs do mesmo lugar e horário contam como um fato só. */
function episodeDetail(occurrence: Occurrence): string | null {
  const episode = occurrence.episode
  if (!episode) return null
  if (episode.grouped_into)
    return `Agrupado no RO ${episode.grouped_into}, do mesmo lugar e horário: as placas estão lá.`
  const count = episode.grouped.length
  return count
    ? `Reúne ${count === 1 ? 'mais 1 RO' : `mais ${count} ROs`} do mesmo lugar e horário: ${episode.grouped.join(', ')}.`
    : null
}

/** Como o local foi achado no mapa (o código vem em minúsculas ou maiúsculas, conforme a fonte). */
const GEOCODES: Record<string, string> = {
  fonte: 'o ponto da base revisada',
  isp: 'o ponto do ISP',
  fora_area_cisps: 'o ponto da base, fora da área das CISPs dela',
  logradouro_bairro_numero: 'pelo número da rua',
  logradouro_numero: 'pelo número da rua',
  numero_porta: 'pelo número da rua',
  logradouro_bairro_numero_proximo: 'pelo número mais próximo da rua',
  logradouro_numero_proximo: 'pelo número mais próximo da rua',
  numero_porta_proximo: 'pelo número mais próximo da rua',
  numero_porta_interpolado: 'pelo número, estimado no trecho da rua',
  numero_interpolado_trecho: 'pelo número, estimado no trecho da rua',
  logradouro_bairro: 'pela rua, sem o número',
  logradouro: 'pela rua, sem o número',
  logradouro_area: 'pela rua, sem o número',
  logradouro_aproximado: 'pela rua, com o nome aproximado',
  logradouro_aproximado_bairro: 'pela rua, com o nome aproximado',
  logradouro_aproximado_numero: 'pela rua, com o nome aproximado',
  logradouro_aproximado_bairro_numero: 'pela rua, com o nome aproximado',
  logradouro_aproximado_numero_proximo: 'pela rua, com o nome aproximado',
  logradouro_aproximado_bairro_numero_proximo:
    'pela rua, com o nome aproximado',
  esquina: 'pelo cruzamento',
  cruzamento: 'pelo cruzamento',
  bairro: 'pelo bairro: aproximado',
  cisp: 'pela delegacia: aproximado',
  comunidade: 'pela comunidade: aproximado',
  gps_narrativa: 'a coordenada dita na dinâmica',
  nominatim_cache: 'pelo endereço (OpenStreetMap)',
  fora_cobertura: 'fora da cobertura do mapa de endereços',
}

/** Como o fato foi classificado (carga). */
const CLASSIFICATIONS: Record<string, string> = {
  leitura_narrativa: 'pela leitura da dinâmica',
}

const readable = (value: string) =>
  value.replace(/_/g, ' ').toLocaleLowerCase('pt-BR')
const informed = (value: string | null | undefined) =>
  value && !/^n[aã]o informad[oa]$/i.test(value.trim()) ? value : null
/** A divergência de data e hora vem como texto ("sim", "nao", a explicação): só aparece quando há. */
const hasDivergence = (value: string | null) =>
  Boolean(value && !/^(n[aã]o|false|0)$/i.test(value.trim()))
/** "021A. DP - [BONSUCESSO]" vira "21ª DP (Bonsucesso)". */
function stationLabel(rawName: string): string {
  const { unit, locality } = cispParts('', rawName)
  return locality ? `${unit} (${locality})` : rawName
}

/** O horário: de onde veio e o intervalo do relato (o horário em si já está no cabeçalho). */
function timeDetail(occurrence: Occurrence): string | null {
  const { interval_start: start, interval_end: end } = occurrence
  const sameDay = start && end && formatDayMonth(start) === formatDayMonth(end)
  const interval =
    start && end
      ? sameDay
        ? `intervalo do relato: ${formatDayMonth(start)}, das ${formatTime(start)} às ${formatTime(end)}`
        : `intervalo do relato: ${formatDateTime(start)} a ${formatDateTime(end)}`
      : null
  const original = occurrence.original_time?.trim()
  const parts = [
    occurrence.time_origin &&
      (TIME_ORIGINS[occurrence.time_origin] ??
        readable(occurrence.time_origin)),
    occurrence.time_precision &&
      (TIME_PRECISIONS[occurrence.time_precision] ??
        readable(occurrence.time_precision)),
    interval,
    original &&
      `no registro: ${/^\d{1,2}$/.test(original) ? `${original}h` : original}`,
    hasDivergence(occurrence.time_date_divergent) &&
      `data e hora divergentes: ${occurrence.time_date_divergent}`,
  ]
  const text = parts.filter(Boolean).join(' · ')
  return text ? text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1) : null
}

/** O local: como foi achado no mapa (o endereço já está no cabeçalho). */
function placeDetail(occurrence: Occurrence): string | null {
  const quality = occurrence.geocode_quality
  const how = quality
    ? (GEOCODES[quality.toLowerCase()] ?? readable(quality))
    : null
  const parts = [
    informed(occurrence.neighborhood) &&
      titleCaseText(occurrence.neighborhood!),
    how &&
      `no mapa: ${how}${occurrence.geocoded_in_panel ? ', localizado pelo painel' : ''}`,
    !occurrence.latitude && 'sem ponto no mapa',
  ]
  return parts.filter(Boolean).join(' · ') || null
}

/** A placa vítima: o veículo, a recuperação e as leituras dela no dia do fato. */
function VictimVehicle({
  fact,
  onOpenPlate,
}: {
  fact: OccurrenceFact
  onOpenPlate: (plate: string) => void
}) {
  const day = fact.victim_day
  const closest = day?.closest_in_time
  const readings = day?.readings
    ? `${formatNumber(day.readings)} ${day.readings === 1 ? 'leitura' : 'leituras'} no dia`
    : 'Sem leitura no dia do fato'
  const role =
    fact.victim_role && !/^v[ií]tima$/i.test(fact.victim_role)
      ? readable(fact.victim_role)
      : null
  return (
    <li>
      <div className="occurrence-victim-plate">
        {fact.victim_plate ? (
          <PlateButton plate={fact.victim_plate} onOpen={onOpenPlate} />
        ) : (
          <span>sem placa</span>
        )}
        <span className="dim">
          {[
            informed(fact.vehicle_model),
            fact.category && categoryLabel(fact.category),
            role,
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      <span>
        {readings}
        {closest &&
          `; a mais perto da hora: ${readingLabel(closest)}${closest.place ? ` (${titleCaseText(closest.place)})` : ''}`}
        .
        {fact.recovered_at &&
          ` Recuperado em ${formatDate(fact.recovered_at)}${fact.recovery_cisp_name ? ` na ${stationLabel(fact.recovery_cisp_name)}` : ''}.`}
      </span>
    </li>
  )
}

/** A chave de uma citação no relato (a placa ou o trecho): liga a linha das citadas ao trecho marcado no texto. */
export const citationKey = (item: CitedPlate) =>
  item.plate ?? `trecho:${item.fragment}`

type Mark = { start: number; end: number; key: string | null; victim: boolean }

/** Onde a vítima e cada citação aparecem no relato, sem sobreposição: a placa como estiver escrita ("Era 5j37") e o
 * trecho citado só a partir de 3 caracteres e numa fronteira de palavra. */
export function relatoMarks(text: string, data: Found): Mark[] {
  const marks: Mark[] = []
  for (const fact of data.facts)
    if (fact.victim_plate)
      for (const [start, end] of looseRanges(text, fact.victim_plate))
        marks.push({ start, end, key: null, victim: true })
  for (const item of data.cited) {
    const needle = item.plate ?? (item.pattern ? item.fragment_text : null)
    if (!needle) continue
    for (const [start, end] of looseRanges(text, needle, !item.plate))
      marks.push({ start, end, key: citationKey(item), victim: false })
  }
  marks.sort((a, b) => a.start - b.start)
  return marks.filter(
    (mark, index) =>
      !marks.slice(0, index).some((other) => other.end > mark.start),
  )
}

function MarkedText({ text, marks }: { text: string; marks: Mark[] }) {
  const parts: ReactNode[] = []
  let cursor = 0
  marks.forEach((mark, index) => {
    if (mark.start > cursor) parts.push(text.slice(cursor, mark.start))
    parts.push(
      <mark
        key={index}
        data-cite={mark.key ?? undefined}
        className={mark.victim ? 'victim' : undefined}
      >
        {text.slice(mark.start, mark.end)}
      </mark>,
    )
    cursor = mark.end
  })
  if (cursor < text.length) parts.push(text.slice(cursor))
  return <>{parts}</>
}

/** O fato: o que o cabeçalho não diz (de onde veio o horário, como o local foi achado, os autores), as placas vítima
 * e a dinâmica com as placas marcadas. */
export function OccurrenceFacts({
  data,
  onOpenPlate,
}: {
  data: Found
  onOpenPlate: (plate: string) => void
}) {
  const { occurrence } = data
  const text = occurrence.dynamics || occurrence.summary
  const victims = data.facts.filter((fact) => fact.victim_plate)
  const kind =
    occurrence.crime_type ||
    (occurrence.modality ? categoryLabel(occurrence.modality) : null)
  const category = occurrence.category && categoryLabel(occurrence.category)
  const details: Array<[string, string | null]> = [
    ['Horário', timeDetail(occurrence)],
    ['Episódio', episodeDetail(occurrence)],
    ['Local', placeDetail(occurrence)],
    // O tipo do fato está no cabeçalho; o alvo entra quando diz mais que ele.
    [
      'Alvo',
      category &&
      !kind
        ?.toLocaleLowerCase('pt-BR')
        .includes(category.toLocaleLowerCase('pt-BR'))
        ? category
        : null,
    ],
    [
      'Autores',
      occurrence.offender_mode
        ? `de ${readable(occurrence.offender_mode)}`
        : null,
    ],
    [
      'Classificação',
      [
        occurrence.classification &&
          (CLASSIFICATIONS[occurrence.classification] ??
            readable(occurrence.classification)),
        occurrence.original_offense,
      ]
        .filter(Boolean)
        .join(' · ') || null,
    ],
    // Em carga, o RO de carga ligado é o próprio RO.
    [
      'RO de carga ligado',
      occurrence.linked_cargo_ro !== occurrence.ro
        ? occurrence.linked_cargo_ro
        : null,
    ],
  ]
  return (
    <section className="groups-panel occurrence-facts">
      <div className="panel-head">
        <div>
          <h2>O fato</h2>
        </div>
      </div>
      <div className={`occurrence-facts-body${text ? '' : ' single'}`}>
        <dl className="occurrence-details">
          {details
            .filter(([, value]) => value)
            .map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          {victims.length > 0 && (
            <div>
              <dt>{victims.length === 1 ? 'Placa vítima' : 'Placas vítima'}</dt>
              <dd>
                <ul className="occurrence-victims">
                  {victims.map((fact) => (
                    <VictimVehicle
                      key={fact.event_id}
                      fact={fact}
                      onOpenPlate={onOpenPlate}
                    />
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
        {text && (
          <div className="occurrence-relato">
            <h3>
              {occurrence.dynamics ? 'Dinâmica do fato' : 'Resumo da dinâmica'}
            </h3>
            <p
              tabIndex={0}
              aria-label={
                occurrence.dynamics ? 'Dinâmica do fato' : 'Resumo da dinâmica'
              }
            >
              <MarkedText text={text} marks={relatoMarks(text, data)} />
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
