import { type ReactNode, useMemo } from 'react'

import { PlateSignals } from '@/modules/vehicle-intelligence/components/plate/plate-signals'
import {
  cispCell,
  type Column,
  mainCispCell,
  recentActivityCell,
  vehicleOriginCell,
} from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'
import { RANKING } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants'
import {
  type SelectMode,
  selectModeFor,
} from '@/modules/vehicle-intelligence/features/correlations/selection'
import { formatDateTime } from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type {
  CorrelationRankingData,
  CorrelationRankingRow,
  CorrelationRankingSort,
  CorrelationRankingView,
} from '@/modules/vehicle-intelligence/types/domain'

/** As colunas da vista: as comuns montadas aqui e as da estratégia do recorte (RANKING.columns). */
export function useRankingColumns({
  view,
  data,
  currentData,
  selectedPlates,
  onSelectPlate,
  cispNames,
  citedPlateNotes,
  onSort,
}: {
  view: CorrelationRankingView
  data: CorrelationRankingData | null
  currentData: boolean
  selectedPlates: string[]
  onSelectPlate: (
    plate: string,
    row: CorrelationRankingRow,
    mode: SelectMode,
  ) => void
  cispNames: Record<string, string>
  citedPlateNotes: Record<string, string>
  /** Só muda a ordenação (setters estáveis): não precisa refazer as colunas. */
  onSort: (key: CorrelationRankingSort, additive: boolean) => void
}): Column[] {
  return useMemo<Column[]>(() => {
    const sortButton = (
      key: CorrelationRankingSort,
      label: string,
      text: ReactNode,
    ) => (
      <button
        type="button"
        className="ranking-inline-sort"
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation()
          onSort(key, false)
        }}
      >
        {text}
      </button>
    )
    return RANKING.columns(view, {
      rank: {
        key: 'rank',
        label: '#',
        help: 'Posição da placa na ordenação atual, considerando os filtros e a página selecionada.',
        render: (_row, index) =>
          data
            ? (data.pagination.page - 1) * data.pagination.page_size + index + 1
            : index + 1,
      },
      plate: {
        key: 'plate',
        label: 'Placa correlata',
        help: 'Clique na placa para selecioná-la e abrir suas ligações no grafo. Ctrl+clique (ou Shift+clique) soma várias placas à seleção.',
        render: (row) => (
          <button
            type="button"
            className="ranking-plate"
            disabled={!currentData}
            aria-pressed={selectedPlates.includes(row.plate)}
            onClick={(event) =>
              onSelectPlate(row.plate, row, selectModeFor(event))
            }
            title="Localizar no grafo · Ctrl+clique soma à seleção"
          >
            <strong>{row.plate}</strong>
            <PlateSignals
              row={row}
              citationNote={citedPlateNotes[row.plate]}
              origem={false}
            />
          </button>
        ),
      },
      vehicle: {
        key: 'vehicle',
        label: 'Modelo e origem',
        help: 'Modelo do cadastro PRF e, embaixo, a UF que emitiu a placa, pelas três primeiras letras. A placa não muda quando o veículo troca de estado: é a origem, não o registro atual. Fora do RJ em azul; série que nenhum estado recebeu em vermelho.',
        render: vehicleOriginCell,
      },
      mainCisp: {
        key: 'main_cisp',
        label: 'CISP mais lida',
        help: 'Área de delegacia (CISP) onde a placa foi mais lida no Cerco Eletrônico e, embaixo, a parcela das leituras dela nessa área. Conta todas as leituras da placa até a data de referência da atividade, não só as correlatas: é a mesma em qualquer recorte.',
        render: mainCispCell,
      },
      recentActivity: {
        key: 'recent_activity',
        label: 'Cerco Eletrônico',
        help: 'Mostra a janela mais recente com atividade e sua contagem. Passe o mouse ou use o foco para consultar os acumulados de 7, 15, 30 e 45 dias. Esta camada não participa das métricas históricas.',
        render: recentActivityCell,
      },
      cisps: {
        key: 'cisps',
        label: 'Áreas de delegacia',
        sortKey: 'cisp_count',
        help: 'Bairros ou localidades das delegacias de circunscrição vinculadas às ocorrências.',
        render: (row) => cispCell(row.cisps, row.cisp_count, cispNames),
      },
      period: {
        key: 'period',
        label: 'Primeira → última correlação',
        help: 'Horários da primeira e da última leitura correlata encontradas dentro do recorte atual.',
        render: (row) => (
          <span>
            {formatDateTime(row.first_seen)}
            <small>→ {formatDateTime(row.last_seen)}</small>
          </span>
        ),
      },
      correlations: {
        key: 'correlations',
        label: 'Correlações',
        sortKey: 'correlations',
        help: 'Quantidade total de leituras correlatas. Uma mesma placa pode gerar mais de uma leitura na mesma ocorrência.',
        render: (row) => <b>{formatNumber(row.correlations)}</b>,
      },
      sortButton,
    })
    // `onSort` é recriada a cada render, mas só chama setters estáveis; as colunas mudam com os dados e a seleção.
    // Dependências incompletas de propósito.
  }, [
    cispNames,
    citedPlateNotes,
    data,
    view,
    selectedPlates,
    onSelectPlate,
    currentData,
  ])
}
