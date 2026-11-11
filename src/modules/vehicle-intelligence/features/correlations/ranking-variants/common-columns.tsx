/** Rótulos, colunas e campos do CSV comuns às duas estratégias (entorno do fato e copassagem). */
import type { Column } from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'
import type { ExportColumn } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants/types'
import { formatDate } from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import type { CorrelationRankingSort } from '@/modules/vehicle-intelligence/types/domain'

export const COMMON_SORT_LABELS: Partial<
  Record<CorrelationRankingSort, string>
> = {
  correlations: 'Correlações',
  distinct_days: 'Dias distintos',
  linked_events: 'Ocorrências ligadas',
  cisp_count: 'Áreas de delegacia',
  space_time_proximity: 'Índice de proximidade',
  min_fact_distance_meters: 'Distância mínima ao fato',
  coverage: 'Cobertura',
  circulation_days: 'Dias de atividade',
  max_same_day_correlations: 'Máximo no mesmo dia',
  span_minutes: 'Intervalo entre fatos',
  event_date: 'Data',
}

export const CSV_ACTIVITY: ExportColumn[] = [
  { header: 'taxi_ativo', value: (row) => row.is_active_taxi },
  { header: 'suspeita_clone', value: (row) => row.is_clone_suspect },
  { header: 'clone_confirmado', value: (row) => row.is_clone_confirmed },
  {
    header: 'ultima_deteccao_cerco_atual',
    value: (row) => row.recent_activity_last_seen,
  },
  { header: 'deteccoes_cerco_7d', value: (row) => row.detections_7d },
  { header: 'deteccoes_cerco_15d', value: (row) => row.detections_15d },
  { header: 'deteccoes_cerco_30d', value: (row) => row.detections_30d },
  { header: 'deteccoes_cerco_45d', value: (row) => row.detections_45d },
  { header: 'temperatura_clone', value: (row) => row.clone_temperature },
  {
    header: 'score_temperatura_clone',
    value: (row) => row.clone_temperature_score,
  },
]

export const coverage: Column = {
  key: 'coverage',
  label: 'Cobertura',
  sortKey: 'coverage',
  help: 'Fração das leituras da placa no Cerco Eletrônico que ocorreram em dias com fato correlacionado. Conta leituras, não dias: um dia com uma leitura solta pesa pouco.',
  render: (row) =>
    row.coverage == null ? (
      '—'
    ) : row.coverage_detections == null || row.total_detections == null ? (
      <b>{row.coverage}%</b>
    ) : (
      <span className="coverage-cell">
        <b>{row.coverage}%</b>
        <small>
          {formatNumber(row.coverage_detections)} de{' '}
          {pluralize(row.total_detections, 'leitura', 'leituras')}
        </small>
      </span>
    ),
}
export const circulation: Column = {
  key: 'circulation_days',
  label: 'Dias de atividade',
  sortKey: 'circulation_days',
  help: 'Dias diferentes em que a placa foi detectada no Cerco Eletrônico, não apenas nas correlações.',
  render: (row) =>
    row.circulation_days != null ? formatNumber(row.circulation_days) : '—',
}
export const eventDate: Column = {
  key: 'event_date',
  label: 'Data',
  sortKey: 'event_date',
  help: 'Dia em que a placa apareceu como correlata em pelo menos duas ocorrências distintas.',
  render: (row) => formatDate(row.event_date),
}
export const span: Column = {
  key: 'span',
  label: 'Intervalo entre fatos',
  sortKey: 'span_minutes',
  help: 'Tempo entre a primeira e a última ocorrência vinculada à placa nessa mesma data.',
  render: (row) => `${Math.round(row.span_minutes || 0)} min`,
}
