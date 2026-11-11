import type { ReactNode } from 'react'

import type { GraphQuery } from '@/modules/vehicle-intelligence/features/correlations/query'
import type { Column } from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'
import type {
  CorrelationRankingData,
  CorrelationRankingRow,
  CorrelationRankingSort,
  CorrelationRankingSortTerm,
  CorrelationRankingView,
} from '@/modules/vehicle-intelligence/types/domain'

/** Colunas comuns montadas pela tabela (posição, placa, modelo e origem, CISP mais lida, Cerco, áreas, período e correlações). */
export interface ColumnKit {
  rank: Column
  plate: Column
  vehicle: Column
  mainCisp: Column
  recentActivity: Column
  cisps: Column
  period: Column
  correlations: Column
  /** Atalho de ordenação dentro de uma célula. */
  sortButton: (
    key: CorrelationRankingSort,
    label: string,
    text: ReactNode,
  ) => ReactNode
}

type CsvValue = string | number | boolean | null | undefined
export type ExportColumn = {
  header: string
  value: (row: CorrelationRankingRow) => CsvValue
}

export interface RankingVariant {
  intro: string
  searchPlaceholder: string
  tabs: Array<{ id: CorrelationRankingView; label: string }>
  sortLabels: Partial<Record<CorrelationRankingSort, string>>
  /** Ordenações que começam crescentes (menor tempo ou distância primeiro). */
  ascending: CorrelationRankingSort[]
  defaultSort: (view: CorrelationRankingView) => CorrelationRankingSortTerm[]
  columns: (view: CorrelationRankingView, kit: ColumnKit) => Column[]
  basis: (query: GraphQuery, data: CorrelationRankingData) => string
  csvViews: Partial<Record<CorrelationRankingView, string>>
  csvColumns: ExportColumn[]
}
