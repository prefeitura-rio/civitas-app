import { PlateButton } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import {
  PlateSignals,
  type SignalFields,
} from '@/modules/vehicle-intelligence/components/plate/plate-signals'
import {
  citationKey,
  relatoMarks,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-facts'
import {
  distanceLabel,
  factDeltaLabel,
  readingLabel,
  snippetAround,
  TRECHO_MINIMO,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type {
  CitedPlate,
  OccurrenceProfileData,
  OccurrenceReading,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { titleCaseText } from '@/modules/vehicle-intelligence/lib/labels'

type Found = Extract<OccurrenceProfileData, { found: true }>

const ROLE_LABELS: Record<string, string> = {
  autor: 'Veículo dos autores',
  indeterminado: 'Papel indeterminado',
  terceiro: 'Terceiro',
}

const FRAGMENT_KINDS: Record<string, string> = {
  prefixo: 'começo da placa',
  final: 'final da placa',
  fragmento: 'parte da placa, sem posição',
  incerta: 'leitura incerta',
}

/** Compatíveis mostradas na linha do trecho; as outras ficam na contagem. */
const COMPATIBLE_SHOWN = 4

function Reading({
  title,
  reading,
}: {
  title: string
  reading: OccurrenceReading | null | undefined
}) {
  if (!reading) return null
  return (
    <span className="occurrence-reading">
      <span>
        <span className="dim">{title}:</span>{' '}
        <span className="light">{readingLabel(reading)}</span>
      </span>
      {reading.place && <small>{titleCaseText(reading.place)}</small>}
    </span>
  )
}

function Lists({ item }: { item: CitedPlate }) {
  const lists = [
    item.in_together && 'junto da vítima',
    item.in_nearby && 'perto do local',
  ].filter(Boolean)
  return lists.length ? (
    <span className="occurrence-cited-in">Aparece {lists.join(' e ')}</span>
  ) : (
    <span className="dim">Fora das listas nestas janelas</span>
  )
}

/** As placas das listas compatíveis com o trecho: em que lista, a distância e o tempo ao fato. */
function Compatible({
  item,
  eventTime,
  onOpenPlate,
}: {
  item: CitedPlate
  eventTime: string | null
  onOpenPlate: (plate: string) => void
}) {
  if (!item.pattern)
    return (
      <span className="dim">
        Curto demais para cruzar com as listas (menos de {TRECHO_MINIMO}{' '}
        caracteres)
      </span>
    )
  const matches = item.matches ?? []
  const total = item.matches_total ?? matches.length
  if (!total)
    return <span className="dim">Nenhuma placa das listas é compatível</span>
  return (
    <span className="occurrence-compatible-list">
      <span className="light">
        {formatNumber(total)}{' '}
        {total === 1 ? 'placa compatível' : 'placas compatíveis'} nas listas
      </span>
      {matches.slice(0, COMPATIBLE_SHOWN).map((match) => (
        <span key={match.plate} className="occurrence-compatible-plate">
          <PlateButton plate={match.plate} onOpen={onOpenPlate} />
          <small>
            {[
              match.lists
                .map((list) =>
                  list === 'together' ? 'junto da vítima' : 'perto do local',
                )
                .join(' e '),
              match.min_fact_distance_meters != null &&
                distanceLabel(match.min_fact_distance_meters),
              factDeltaLabel(match.min_fact_delta_minutes, match, eventTime),
            ]
              .filter(Boolean)
              .join(' · ')}
          </small>
        </span>
      ))}
      {total > COMPATIBLE_SHOWN && (
        <small>e mais {formatNumber(total - COMPATIBLE_SHOWN)} na lista</small>
      )}
    </span>
  )
}

/** O trecho da dinâmica de onde a citação veio; o clique leva até ele no texto. */
function Passage({
  item,
  text,
  ranges,
}: {
  item: CitedPlate
  text: string | null
  ranges: Map<string, [number, number]>
}) {
  const key = citationKey(item)
  const range = ranges.get(key)
  if (!text || !range) return null
  const { before, match, after } = snippetAround(text, range)
  const show = () => {
    const target = document.querySelector<HTMLElement>(
      `mark[data-cite="${CSS.escape(key)}"]`,
    )
    if (!target) return
    target.scrollIntoView({ block: 'center', behavior: 'smooth' })
    target.classList.remove('flash')
    void target.offsetWidth
    target.classList.add('flash')
  }
  return (
    <button
      type="button"
      className="occurrence-passage"
      onClick={show}
      title="Ver na dinâmica do fato"
    >
      {before}
      <mark>{match}</mark>
      {after}
    </button>
  )
}

/** As placas que o relato deste RO cita (fora a vítima): de onde veio cada citação, se a placa foi lida no dia e onde
 * e quando passou mais perto; os trechos de placa, com as placas das listas compatíveis com eles. */
export function CitedPlates({
  data,
  onOpenPlate,
}: {
  data: Found
  onOpenPlate: (plate: string) => void
}) {
  if (!data.cited.length) return null
  const text = data.occurrence.dynamics || data.occurrence.summary
  const ranges = new Map<string, [number, number]>()
  for (const mark of text ? relatoMarks(text, data) : [])
    if (mark.key && !ranges.has(mark.key))
      ranges.set(mark.key, [mark.start, mark.end])
  const plates = data.cited.filter((item) => item.plate).length
  const fragments = data.cited.length - plates
  return (
    <section className="groups-panel occurrence-cited" id="occurrence-cited">
      <div className="panel-head">
        <div>
          <h2>
            {[
              plates &&
                `${formatNumber(plates)} ${plates === 1 ? 'placa citada' : 'placas citadas'}`,
              fragments &&
                `${formatNumber(fragments)} ${fragments === 1 ? 'trecho de placa' : 'trechos de placa'}`,
            ]
              .filter(Boolean)
              .join(' e ')}{' '}
            na dinâmica deste RO
          </h2>
          <p>
            Placas que a dinâmica liga aos autores ou cujo papel não ficou
            claro, com as leituras delas no dia do fato. Um trecho de placa é
            cruzado com as placas das listas: compatível não quer dizer que é a
            placa citada. A citação é uma declaração da fonte, não prova de
            autoria; a placa vem de texto livre, então confira o trecho.
          </p>
        </div>
      </div>
      <div
        className="list occurrence-list occurrence-list-cited"
        role="table"
        aria-label="Placas citadas na dinâmica"
      >
        <div className="list-head" role="row">
          <span role="columnheader">Placa</span>
          <span role="columnheader">Citação</span>
          <span role="columnheader" className="num">
            No dia do fato
          </span>
          <span role="columnheader">Leitura mais próxima</span>
          <span role="columnheader">Nas listas</span>
        </div>
        {data.cited.map((item, index) => {
          const day = item.day
          return (
            <div
              key={citationKey(item)}
              role="row"
              className={`list-row${index % 2 ? ' pair' : ''}`}
            >
              <span role="cell">
                {item.plate ? (
                  <>
                    <PlateButton plate={item.plate} onOpen={onOpenPlate} />
                    {item.signals && (
                      <PlateSignals
                        row={
                          {
                            ...item,
                            author_citations: item.author_citations?.filter(
                              (c) => c.ro !== data.ro,
                            ),
                          } as SignalFields
                        }
                      />
                    )}
                  </>
                ) : (
                  <>
                    <span className="group-plate">
                      {item.fragment_text || item.fragment}
                    </span>
                    <small>
                      {FRAGMENT_KINDS[item.fragment_kind ?? ''] ??
                        'trecho de placa'}
                    </small>
                  </>
                )}
              </span>
              <span role="cell">
                <span className="light">
                  {ROLE_LABELS[item.role] ?? titleCaseText(item.role)}
                </span>
                <small>
                  {[
                    item.confidence && `confiança ${item.confidence}`,
                    item.source,
                    item.vehicle_status,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </small>
                <Passage item={item} text={text} ranges={ranges} />
              </span>
              <span role="cell" className="num">
                <span className="light">
                  {item.plate ? formatNumber(day?.readings ?? 0) : '—'}
                </span>
                <small>
                  {item.plate
                    ? day?.readings === 1
                      ? 'leitura'
                      : 'leituras'
                    : ''}
                </small>
              </span>
              <span role="cell" className="num-text">
                {item.plate && !day?.readings && (
                  <span className="dim">Não foi lida no dia do fato</span>
                )}
                <Reading title="Do local" reading={day?.closest_in_space} />
                {day?.closest_in_time &&
                  day.closest_in_time.time !== day.closest_in_space?.time && (
                    <Reading title="Da hora" reading={day.closest_in_time} />
                  )}
              </span>
              <span role="cell">
                {item.plate ? (
                  <Lists item={item} />
                ) : (
                  <Compatible
                    item={item}
                    eventTime={data.occurrence.event_time}
                    onOpenPlate={onOpenPlate}
                  />
                )}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
