import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

import { PlateCell } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plates-table'
import {
  distanceLabel,
  factDeltaLabel,
  hasSignal,
  type PlateSignal,
  plateSignals,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type {
  OccurrencePlateRow,
  OccurrenceProfileData,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

type Found = Extract<OccurrenceProfileData, { found: true }>
type Entry = {
  plate: string
  together?: OccurrencePlateRow
  nearby?: OccurrencePlateRow
  signals: PlateSignal[]
}

/** Quantas aparecem antes de "Mostrar as outras". */
const FIRST = 8

/** "1,3 min antes do fato", "a 3,3 min do fato", "no minuto do fato". */
function factPhrase(row: OccurrencePlateRow, eventTime: string | null): string {
  const label = factDeltaLabel(row.min_fact_delta_minutes, row, eventTime)
  if (label === '—' || label === 'no minuto do fato') return label
  return /(antes|depois)$/.test(label)
    ? `${label} do fato`
    : `a ${label} do fato`
}

const strength = (row: OccurrencePlateRow) =>
  row.correlation_strength == null
    ? null
    : `força ${row.correlation_strength.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}`

/** As placas com sinal das duas listas, uma vez cada, na ordem do sinal; empate pela maior força. */
function entries(data: Found): Entry[] {
  const byPlate = new Map<string, Entry>()
  for (const [kind, list] of [
    ['together', data.together],
    ['nearby', data.nearby],
  ] as const) {
    if (!list?.available) continue
    for (const row of list.rows.filter(hasSignal)) {
      const entry = byPlate.get(row.plate) ?? {
        plate: row.plate,
        signals: plateSignals(row, data.ro),
      }
      entry[kind] = row
      byPlate.set(row.plate, entry)
    }
  }
  const best = (entry: Entry) =>
    Math.max(
      entry.together?.correlation_strength ?? -1,
      entry.nearby?.correlation_strength ?? -1,
    )
  return [...byPlate.values()]
    .filter((entry) => entry.signals.length)
    .sort(
      (a, b) =>
        a.signals[0].tier - b.signals[0].tier ||
        best(b) - best(a) ||
        a.plate.localeCompare(b.plate),
    )
}

/** Por que não há placa para conferir: o que cada lista diz quando vem vazia. */
function emptyReason(data: Found): string {
  const { parameters, together, nearby } = data
  const parts: string[] = []
  if (data.strategy === 'copassagem') {
    if (!together) parts.push('o RO não tem fato no grafo de copassagem')
    else if (!together.available)
      parts.push(together.reason.replace(/\.$/, '').toLocaleLowerCase('pt-BR'))
    else if (!together.total)
      parts.push(
        data.facts.every((fact) => !fact.victim_passages.length)
          ? 'a placa vítima não passou por um ponto de coleta perto do horário do fato, então não há com quem comparar'
          : 'nenhuma placa passou junto da vítima nestas janelas',
      )
  }
  if (!nearby.available)
    parts.push(nearby.reason.replace(/\.$/, '').toLocaleLowerCase('pt-BR'))
  else if (!nearby.total)
    parts.push(
      nearby.points_in_radius === 0
        ? `não há ponto de coleta até ${distanceLabel(parameters.radius_meters)} do local`
        : `nenhuma placa foi lida até ${distanceLabel(parameters.radius_meters)} do local em ±${parameters.near_window_minutes} min`,
    )
  const total =
    (together?.available ? together.total : 0) +
    (nearby.available ? nearby.total : 0)
  if (!parts.length || total)
    return `Nenhuma das placas que passaram ${data.strategy === 'copassagem' ? 'junto da vítima ou ' : ''}perto do local tem sinal próprio nestas janelas.${parts.length ? ` Além disso, ${parts.join('; ')}.` : ''}`
  return `Nenhuma placa para conferir nestas janelas: ${parts.join('; ')}.`
}

function ListCell({
  kind,
  row,
  eventTime,
}: {
  kind: 'together' | 'nearby'
  row: OccurrencePlateRow | undefined
  eventTime: string | null
}) {
  if (!row)
    return (
      <span role="cell">
        <span className="empty">—</span>
      </span>
    )
  const extra = [
    kind === 'together'
      ? null
      : `${formatNumber(row.readings ?? 0)} ${row.readings === 1 ? 'leitura' : 'leituras'}`,
    strength(row),
  ].filter(Boolean)
  return (
    <span role="cell">
      <span className="light">
        {kind === 'together'
          ? `${formatNumber(row.cooccurrences ?? 0)} ${row.cooccurrences === 1 ? 'passagem' : 'passagens'} com a vítima`
          : `${distanceLabel(row.min_fact_distance_meters)} · ${factPhrase(row, eventTime)}`}
      </span>
      <small>
        {kind === 'together'
          ? [factPhrase(row, eventTime), ...extra].join(' · ')
          : extra.join(' · ')}
      </small>
    </span>
  )
}

/** O que conferir primeiro: as placas das listas com sinal próprio (citada, compatível com um trecho citado, Cerco,
 * clone), juntas e na ordem do sinal, com o que cada lista diz delas. Sem nenhuma, o motivo. */
export function SignalPlates({
  data,
  loading,
  onOpenPlate,
}: {
  data: Found
  loading: boolean
  onOpenPlate: (plate: string) => void
}) {
  const [all, setAll] = useState(false)
  const items = entries(data)
  const copassagem = data.strategy === 'copassagem'
  const outside = data.cited.filter(
    (item) => item.plate && !item.in_together && !item.in_nearby,
  )
  const shown = all ? items : items.slice(0, FIRST)
  return (
    <section
      className={`groups-panel occurrence-signal${loading ? ' is-loading' : ''}`}
      aria-labelledby="occurrence-signal-title"
      aria-busy={loading}
    >
      <div className="panel-head">
        <div>
          <h2 id="occurrence-signal-title">
            {items.length
              ? `${formatNumber(items.length)} ${items.length === 1 ? 'placa' : 'placas'} com sinal`
              : 'Placas com sinal'}
          </h2>
          {items.length > 0 && (
            <>
              <p>
                Das placas que passaram{' '}
                {copassagem ? 'junto da vítima ou ' : ''}perto do local, as que
                têm um sinal próprio: citada na dinâmica, no Cerco Digital, no
                Disque Denúncia, compatível com um trecho de placa citado ou com
                suspeita de clone. A ordem diz o que conferir primeiro.
              </p>
              <p className="occurrence-warning">
                <AlertTriangle size={13} aria-hidden="true" />
                {data.methodology.warning} Passar junto ou perto não prova
                presença no fato.
              </p>
            </>
          )}
        </div>
      </div>
      {items.length ? (
        <>
          <div
            className={`list occurrence-list occurrence-list-signal${copassagem ? '' : ' single'}`}
            role="table"
            aria-labelledby="occurrence-signal-title"
          >
            <div className="list-head" role="row">
              <span role="columnheader">Placa</span>
              <span role="columnheader">Sinal</span>
              {copassagem && <span role="columnheader">Junto da vítima</span>}
              <span role="columnheader">Perto do local</span>
            </div>
            {shown.map((entry, index) => {
              const row = entry.together ?? entry.nearby!
              const [main, ...others] = entry.signals
              return (
                <div
                  key={entry.plate}
                  role="row"
                  className={`list-row${index % 2 ? ' pair' : ''}`}
                >
                  <span role="cell">
                    <PlateCell
                      row={row}
                      ro={data.ro}
                      onOpenPlate={onOpenPlate}
                    />
                  </span>
                  <span role="cell">
                    <span className="light">{main.label}</span>
                    {main.detail && (
                      <small className="break">{main.detail}</small>
                    )}
                    {others.length > 0 && (
                      <small>
                        também {others.map((item) => item.short).join(', ')}
                      </small>
                    )}
                  </span>
                  {copassagem && (
                    <ListCell
                      kind="together"
                      row={entry.together}
                      eventTime={data.occurrence.event_time}
                    />
                  )}
                  <ListCell
                    kind="nearby"
                    row={entry.nearby}
                    eventTime={data.occurrence.event_time}
                  />
                </div>
              )
            })}
          </div>
          {items.length > FIRST && (
            <div className="list-footer">
              <button
                type="button"
                className="occurrence-more"
                onClick={() => setAll((current) => !current)}
              >
                {all
                  ? 'Mostrar só as primeiras'
                  : `Mostrar as outras ${formatNumber(items.length - FIRST)}`}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="list-empty">{emptyReason(data)}</p>
      )}
      {outside.length > 0 && (
        <p className="occurrence-outside">
          {outside.length === 1 ? 'A placa citada' : 'As placas citadas'} na
          dinâmica deste RO {outside.map((item) => item.plate).join(', ')}{' '}
          {outside.length === 1 ? 'não aparece' : 'não aparecem'} nas listas
          destas janelas.{' '}
          <button
            type="button"
            className="occurrence-more"
            onClick={() =>
              document
                .getElementById('occurrence-cited')
                ?.scrollIntoView({ block: 'start' })
            }
          >
            Ver as leituras do dia
          </button>
        </p>
      )}
    </section>
  )
}
