import { AlertTriangle, Route } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ReadError } from '@/modules/vehicle-intelligence/components/error-banner'
import {
  ChoicePill,
  CispPill,
  FilterBar,
  MODALITY_SHORT_LABELS,
  MultiPill,
  PeriodPill,
} from '@/modules/vehicle-intelligence/components/filters/analysis-filters'
import { postEventPath } from '@/modules/vehicle-intelligence/features/post-event/api'
import {
  isRecurringConnection,
  RECURRENT_CONNECTION_MINIMUM_OCCURRENCES,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import {
  DEFAULT_FILTERS,
  type PostEventFilters,
  postEventParams,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/filters'
import { LastLocationsExplorer } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/last-locations-explorer'
import {
  isCargoRecorte,
  modalityName,
  PRIMARY,
  SECONDARY,
  TEXT,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import type { MasterPostData } from '@/modules/vehicle-intelligence/features/post-event/types'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { MASTER_GRAPH_OPTIONS_PATH } from '@/modules/vehicle-intelligence/lib/api'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type {
  DashboardFilters,
  MasterGraphOptions,
} from '@/modules/vehicle-intelligence/types/domain'

export default function StolenVehiclesView() {
  const { data: options } = useApi<MasterGraphOptions>(
    MASTER_GRAPH_OPTIONS_PATH,
  )
  const [filters, setFilters] = useState<PostEventFilters>(DEFAULT_FILTERS)
  const { data, loading, error } = useApi<MasterPostData>(
    postEventPath(postEventParams(filters, options?.fact_period).toString()),
    { delayMs: 180, fallbackError: 'Falha na leitura local' },
  )

  const cispOptions = useMemo(
    () =>
      (options?.cisps ?? []).map((codigo) => ({
        codigo,
        nome:
          options?.cisp_names?.[codigo] ||
          `CISP ${codigo} - nome não disponível`,
        total: 0,
      })),
    [options],
  )
  const modalities = DEFAULT_FILTERS.modalidades.filter(
    (crime) => !options || options.modalidades.includes(crime),
  )
  const dirty =
    filters.period.preset !== 'all' ||
    filters.alvos.length > 0 ||
    filters.cisps.length > 0 ||
    Boolean(filters.cargoOnly) ||
    !modalities.every((crime) => filters.modalidades.includes(crime))
  const methodologyNumber = (key: string, fallback = 0) => {
    const value = Number(data?.methodology[key])
    return Number.isFinite(value) && value > 0 ? value : fallback
  }
  const analysisHours = methodologyNumber('post_event_hours')
  const radarCispLimit = methodologyNumber('radar_cisp_breakdown_limit')
  const cargo = options?.cargo

  return (
    <div className="module-stack">
      <section className="module-hero">
        <div>
          <span className="eyebrow">PÓS-EVENTO · EXPLORADOR CARTOGRÁFICO</span>
          <h2>Fluxo entre polos de subtração e desconexão</h2>
          <p>
            {TEXT.hero}{' '}
            {analysisHours ? `Janela de ${analysisHours} h pós-evento.` : ''}
          </p>
        </div>
      </section>
      {options && (
        <FilterBar dirty={dirty} onClear={() => setFilters(DEFAULT_FILTERS)}>
          <PeriodPill
            value={filters.period}
            factPeriod={options.fact_period}
            onChange={(period) =>
              setFilters((current) => ({ ...current, period }))
            }
          />
          <ChoicePill
            label="Tipo do fato"
            value={
              modalities.every((crime) => filters.modalidades.includes(crime))
                ? 'TODOS'
                : filters.modalidades[0]
            }
            items={[
              { value: 'TODOS', label: 'Todos' },
              ...modalities.map((crime) => ({
                value: crime,
                label: MODALITY_SHORT_LABELS[crime] ?? categoryLabel(crime),
              })),
            ]}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                modalidades:
                  value === 'TODOS'
                    ? [...modalities]
                    : [value as DashboardFilters['modalidades'][number]],
              }))
            }
          />
          {cargo?.available && (
            <ChoicePill
              label="Natureza"
              value={filters.cargoOnly ? 'CARGA' : 'TODAS'}
              items={[
                { value: 'TODAS', label: 'Todas' },
                { value: 'CARGA', label: 'Roubo de carga' },
              ]}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  cargoOnly: value === 'CARGA',
                }))
              }
            />
          )}
          <MultiPill
            label="Tipo de veículo"
            options={options.alvos.map((value) => ({ value }))}
            selected={filters.alvos}
            onChange={(alvos) =>
              setFilters((current) => ({ ...current, alvos }))
            }
          />
          <CispPill
            options={cispOptions}
            selected={filters.cisps}
            onChange={(cisps) =>
              setFilters((current) => ({ ...current, cisps }))
            }
          />
        </FilterBar>
      )}
      {error && <ReadError message={error} />}
      {data && !data.ready && (
        <section className="materialization-callout">
          <Route size={34} />
          <div>
            <strong>Motor pronto; falta a base evento a evento</strong>
            <p>{data.reason}</p>
            <code>{data.build_command}</code>
            <small>Arquivo esperado: {data.missing_source}</small>
          </div>
        </section>
      )}
      {data?.ready && (
        <>
          <div className="post-ruler">
            <article>
              <span>Placas localizadas</span>
              <strong>{formatNumber(data.summary.plates_detected)}</strong>
              <small>{TEXT.vehicles} lidos após o fato</small>
            </article>
            <article>
              <span>
                <i className="marker origin" />
                Polos de subtração
              </span>
              <strong>{formatNumber(data.origin_clusters.length)}</strong>
              <small>
                {isCargoRecorte
                  ? 'carga e carga + veículo'
                  : `${modalityName(PRIMARY)} e ${modalityName(SECONDARY)}`}
              </small>
            </article>
            <article>
              <span>
                <i className="marker destination" />
                Polos de desconexão
              </span>
              <strong>
                {formatNumber(
                  data.destination_clusters.length +
                    data.destination_hubs.length,
                )}
              </strong>
              <small>polos e radares terminais</small>
            </article>
            <article>
              <span>
                <i className="marker flow" />
                Conexões recorrentes
              </span>
              <strong>
                {formatNumber(
                  data.cluster_connections.filter(isRecurringConnection).length,
                )}
              </strong>
              <small>
                {RECURRENT_CONNECTION_MINIMUM_OCCURRENCES} ou mais ocorrências
              </small>
            </article>
          </div>
          {loading && (
            <div className="map-loading-state loading">Aplicando recorte…</div>
          )}
          <LastLocationsExplorer
            data={data}
            cispLimit={radarCispLimit}
            filters={filters}
          />
          <div className="data-note">
            <AlertTriangle size={16} />
            <span>{String(data.methodology.warning)}</span>
          </div>
        </>
      )}
    </div>
  )
}
