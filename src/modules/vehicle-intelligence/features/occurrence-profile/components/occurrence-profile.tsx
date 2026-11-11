/**
 * Perfil do RO: os dados do RO (o fato, a dinâmica e as placas citadas nela), o mapa e a lista de quem passou junto da
 * vítima (copassagem) e perto do local, com o trilho de filtros ao lado. As janelas, os filtros e a ordem pedem o
 * perfil de novo (a API filtra e ordena antes do limite de linhas); o anterior fica na tela enquanto o novo chega. Os
 * filtros valem de um RO para o outro na mesma sessão do navegador.
 */
import '@/modules/vehicle-intelligence/components/groups/groups.css'
import '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-profile.css'

import { Maximize2, Minimize2 } from 'lucide-react'
import { useCallback, useState } from 'react'

import { ErrorBanner } from '@/modules/vehicle-intelligence/components/error-banner'
import { recorteStorageKey } from '@/modules/vehicle-intelligence/config/recortes'
import {
  DEFAULT_PLATE_FILTERS,
  occurrenceProfilePath,
  occurrenceProfileQuery,
  type PlateFilterChoice,
  type WindowChoice,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/api'
import { CitedPlates } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/cited-plates'
import { OccurrenceFacts } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-facts'
import { OccurrenceHeader } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-header'
import { OccurrenceMap } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-map'
import { PlateLists } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plate-lists'
import {
  DEFAULT_SORT,
  type PlateSort,
  SERVER_SORT,
  SIGNAL_ORDER,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type { OccurrenceProfileData } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { OccurrenceReportMenu } from '@/modules/vehicle-intelligence/features/reports'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { formatDate } from '@/modules/vehicle-intelligence/lib/dates'
import { formatDistance } from '@/modules/vehicle-intelligence/lib/format'

type Found = Extract<OccurrenceProfileData, { found: true }>

const FILTERS_KEY = recorteStorageKey('occurrence-plate-filters')

function storedFilters(): PlateFilterChoice {
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(FILTERS_KEY) ?? 'null',
    ) as Partial<PlateFilterChoice> | null
    return {
      ...DEFAULT_PLATE_FILTERS,
      ...(stored && typeof stored === 'object' ? stored : {}),
    }
  } catch {
    return DEFAULT_PLATE_FILTERS
  }
}

/** Os filtros de placa da tela, guardados na sessão do navegador (por recorte). */
function usePlateFilters(): [
  PlateFilterChoice,
  (next: PlateFilterChoice) => void,
] {
  const [filters, setFilters] = useState(storedFilters)
  const change = useCallback((next: PlateFilterChoice) => {
    setFilters(next)
    try {
      window.sessionStorage.setItem(FILTERS_KEY, JSON.stringify(next))
    } catch {
      // Sem armazenamento (modo privado cheio): os filtros valem só nesta tela.
    }
  }, [])
  return [filters, change]
}

export function OccurrenceProfile({
  ro,
  backLabel,
  onBack,
  onOpenPlate,
}: {
  ro: string
  backLabel: string
  onBack: () => void
  onOpenPlate: (plate: string) => void
}) {
  const [windows, setWindows] = useState<WindowChoice>({})
  const [filters, setFilters] = usePlateFilters()
  const [sort, setSort] = useState<PlateSort>(DEFAULT_SORT)
  const [inverted, setInverted] = useState(false)
  // A mesma query pede o perfil e o relatório do RO: o PDF sai com as janelas, os filtros e a ordem da tela.
  const query = occurrenceProfileQuery(
    ro,
    windows,
    filters,
    SERVER_SORT[sort],
    inverted,
  )
  const profile = useApi<OccurrenceProfileData>(occurrenceProfilePath(query), {
    delayMs: 120,
  })
  const { data, error, loading } = profile
  const choose = (field: keyof WindowChoice) => (value: number) =>
    setWindows((current) => ({ ...current, [field]: value }))

  return (
    <div className="groups-page group-profile occurrence-page">
      <OccurrenceHeader
        title={`RO ${ro}`}
        data={data?.found ? data : null}
        backLabel={backLabel}
        onBack={onBack}
        actions={
          data?.found ? <OccurrenceReportMenu ro={ro} query={query} /> : null
        }
      />
      {error && <ErrorBanner message={error} />}
      {!data && !error && (
        <p role="status" className="groups-status">
          Carregando o RO e as placas que passaram junto e perto…
        </p>
      )}
      {data && !data.found && (
        <section className="groups-panel">
          <p className="list-empty">{data.reason}</p>
        </section>
      )}
      {data?.found && (
        <FoundProfile
          data={data}
          loading={loading}
          choose={choose}
          filters={filters}
          onFiltersChange={setFilters}
          onReset={() => {
            setFilters(DEFAULT_PLATE_FILTERS)
            setWindows({})
          }}
          sort={sort}
          inverted={inverted}
          onSortChange={setSort}
          onInvertedChange={setInverted}
          onOpenPlate={onOpenPlate}
        />
      )}
    </div>
  )
}

function FoundProfile({
  data,
  loading,
  choose,
  filters,
  onFiltersChange,
  onReset,
  sort,
  inverted,
  onSortChange,
  onInvertedChange,
  onOpenPlate,
}: {
  data: Found
  loading: boolean
  choose: (field: keyof WindowChoice) => (value: number) => void
  filters: PlateFilterChoice
  onFiltersChange: (filters: PlateFilterChoice) => void
  onReset: () => void
  sort: PlateSort
  inverted: boolean
  onSortChange: (sort: PlateSort) => void
  onInvertedChange: (inverted: boolean) => void
  onOpenPlate: (plate: string) => void
}) {
  const { parameters } = data
  const copassagem = data.strategy === 'copassagem'
  const [mapExpanded, setMapExpanded] = useState(false)
  return (
    <>
      <OccurrenceFacts data={data} onOpenPlate={onOpenPlate} />
      <CitedPlates data={data} onOpenPlate={onOpenPlate} />
      <section className="groups-panel" id="occurrence-map-panel">
        <div className="panel-head">
          <div>
            <h2>Onde passaram</h2>
            <p>
              O local do fato e o raio de{' '}
              {formatDistance(parameters.radius_meters)}, os pontos de coleta
              onde as placas das listas foram lidas
              {copassagem ? ', as passagens da vítima perto do horário' : ''} e
              a leitura mais próxima de cada placa citada neste RO. O número de
              cada ponto conta as placas da lista
              {data.filters.active ? ', com os filtros ao lado dela' : ''};
              clique num ponto para ver as placas.
            </p>
          </div>
          <button
            type="button"
            className="occurrence-map-expand"
            aria-pressed={mapExpanded}
            onClick={() => {
              setMapExpanded((current) => !current)
              window.requestAnimationFrame(() =>
                document
                  .getElementById('occurrence-map-panel')
                  ?.scrollIntoView({ block: 'start', behavior: 'smooth' }),
              )
            }}
          >
            {mapExpanded ? (
              <Minimize2 size={15} aria-hidden="true" />
            ) : (
              <Maximize2 size={15} aria-hidden="true" />
            )}
            {mapExpanded ? 'Reduzir mapa' : 'Ampliar mapa'}
          </button>
        </div>
        <OccurrenceMap
          data={data}
          expanded={mapExpanded}
          onOpenPlate={onOpenPlate}
        />
      </section>
      <PlateLists
        data={data}
        loading={loading}
        choose={choose}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onReset={onReset}
        sort={sort}
        inverted={inverted}
        onSortChange={onSortChange}
        onInvertedChange={onInvertedChange}
        onOpenPlate={onOpenPlate}
      />
      <section className="groups-method">
        <div>
          <h2>Critérios</h2>
          <p>
            Detecções de {formatDate(data.detection_period.start)} a{' '}
            {formatDate(data.detection_period.end)}.
          </p>
        </div>
        <dl>
          <div>
            <dt>Sinal</dt>
            <dd>{data.methodology.signal}</dd>
          </div>
          <div>
            <dt>Ordem</dt>
            <dd>
              Pelas abas, feita na lista inteira antes do limite de 300 por
              lista: do mais perto do horário do fato ao mais longe (o padrão),
              dias de circulação, leituras no dia do RO, correlações ou com
              sinal primeiro (na ordem: {SIGNAL_ORDER}; depois, pela força). Em
              qualquer ordem a lista traz também todas as placas com sinal, na
              posição delas. O botão ao lado das abas troca o sentido.
            </dd>
          </div>
          <div>
            <dt>Força</dt>
            <dd>{data.methodology.strength}</dd>
          </div>
          <div>
            <dt>Perto do local</dt>
            <dd>{data.methodology.nearby_note}</dd>
          </div>
          <div>
            <dt>Correlações</dt>
            <dd>
              Em quantos ROs do recorte a placa aparece no grafo de correlatas,
              nas janelas da tela (conta este RO), e os dias em que ela foi lida
              no período das detecções. Muitas correlações e muitos dias
              costumam ser trânsito comum do lugar; poucos dias, uma placa que
              quase não circula por ali.
            </dd>
          </div>
        </dl>
      </section>
    </>
  )
}
