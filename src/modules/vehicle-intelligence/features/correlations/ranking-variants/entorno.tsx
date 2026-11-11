/** Ranking no entorno do fato (transeuntes): leituras perto do local e do horário de cada ocorrência. */
import { type Column } from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'
import {
  circulation,
  COMMON_SORT_LABELS,
  coverage,
  CSV_ACTIVITY,
  eventDate,
  span,
} from '@/modules/vehicle-intelligence/features/correlations/ranking-variants/common-columns'
import type { RankingVariant } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants/types'
import {
  formatDistance,
  formatNumber,
} from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import { plateOrigin } from '@/modules/vehicle-intelligence/lib/plate-origin'

export const entornoVariant: RankingVariant = {
  intro:
    'O ranking geral reúne recorrência, volume e proximidade ao fato. Dias de circulação compara os fatos com a circulação habitual da placa: quem passa pela área todo dia tem cobertura baixa, mesmo aparecendo em muitos fatos.',
  searchPlaceholder: 'Placas correlatas (separe por vírgula)',
  tabs: [
    { id: 'correlations', label: 'Ranking geral' },
    { id: 'same_day', label: 'Sequências em um só dia' },
    { id: 'cold_plate', label: 'Dias de circulação' },
  ],
  sortLabels: {
    ...COMMON_SORT_LABELS,
    correlation_strength: 'Proximidade mediana',
    average_correlation_strength: 'Proximidade média',
    avg_fact_delta_minutes: 'Tempo médio até o fato',
    median_fact_delta_minutes: 'Tempo até o fato',
    close_fact_events_3m: 'Leituras até 3 min do fato',
    close_fact_events_5m: 'Leituras até 5 min do fato',
    before_count: 'Leituras antes do fato',
    after_count: 'Leituras depois do fato',
  },
  ascending: [
    'median_fact_delta_minutes',
    'avg_fact_delta_minutes',
    'min_fact_distance_meters',
  ],
  defaultSort: (view) => [
    {
      key:
        ({ same_day: 'linked_events', cold_plate: 'coverage' } as const)[
          view as 'same_day' | 'cold_plate'
        ] ?? 'correlations',
      direction: 'desc',
    },
  ],
  columns: (
    view,
    {
      rank,
      plate,
      vehicle,
      mainCisp,
      recentActivity,
      cisps,
      period,
      correlations,
      sortButton,
    },
  ) => {
    const events: Column = {
      key: 'linked_events',
      label: 'Ocorrências',
      sortKey: 'linked_events',
      help: 'Quantidade de fatos distintos e de dias diferentes em cujo entorno a placa foi lida.',
      render: (row) => (
        <span className="ranking-proximity">
          <b>{formatNumber(row.linked_events)}</b>
          <small>
            {sortButton(
              'distinct_days',
              'Ordenar por dias distintos',
              `${row.distinct_days ?? '—'} ${row.distinct_days === 1 ? 'dia distinto' : 'dias distintos'}`,
            )}
            {row.offender_modes?.length
              ? ` · ${row.offender_modes.map(categoryLabel).join(' · ')}`
              : ''}
          </small>
        </span>
      ),
    }
    const strength: Column = {
      key: 'correlation_strength',
      label: 'Proximidade mediana',
      sortKey: 'correlation_strength',
      help: 'Mediana das proximidades de cada relação placa/ocorrência. Cada fato tem o mesmo peso: 100 × exp[−0,6 × max(t−2,0)/4 − 0,4 × max(d−200,0)/300], com t em minutos e d em metros. Não mede força de evidência.',
      render: (row) => (
        <span className="ranking-proximity">
          <b>{row.correlation_strength ?? '—'}</b>
          <small>
            {row.correlation_strength == null ? (
              'Sem distância calculada'
            ) : (
              <>
                média{' '}
                {sortButton(
                  'average_correlation_strength',
                  'Ordenar por proximidade média',
                  row.average_correlation_strength ?? '—',
                )}{' '}
                ·{' '}
                {formatDistance(row.median_fact_distance_meters, {
                  empty: 'distância indisponível',
                })}
              </>
            )}
          </small>
        </span>
      ),
    }
    // Dias distintos e proximidade média já aparecem como subtítulo de Ocorrências e de Proximidade mediana.
    if (view === 'cold_plate')
      return [
        rank,
        plate,
        vehicle,
        mainCisp,
        recentActivity,
        coverage,
        circulation,
        events,
        strength,
        correlations,
        period,
      ]
    if (view === 'same_day')
      return [
        rank,
        plate,
        vehicle,
        mainCisp,
        recentActivity,
        eventDate,
        {
          key: 'linked_events',
          label: 'Ocorrências no dia',
          sortKey: 'linked_events',
          help: 'Fatos distintos da mesma data em cujo entorno a placa foi lida. Embaixo, o total da placa no período: é sobre ele que vale o mínimo de ocorrências ligadas dos filtros.',
          render: (row) => (
            <span className="ranking-proximity">
              <b>{row.linked_events}</b>
              {row.plate_linked_events != null && (
                <small>
                  de {formatNumber(row.plate_linked_events)} no período
                </small>
              )}
            </span>
          ),
        },
        correlations,
        cisps,
        span,
        period,
      ]
    return [
      rank,
      plate,
      vehicle,
      mainCisp,
      recentActivity,
      events,
      correlations,
      {
        key: 'fact_time',
        label: 'Tempo até o fato',
        sortKey: 'median_fact_delta_minutes',
        help: 'Mediana, entre as ocorrências ligadas, do intervalo entre o horário registrado do fato e as leituras da placa no entorno. Conta também as ocorrências com leitura até 3 e 5 minutos do horário.',
        render: (row) => (
          <span className="ranking-proximity">
            <b>
              {row.median_fact_delta_minutes == null
                ? '—'
                : `${row.median_fact_delta_minutes} min`}
            </b>
            <small>
              {row.median_fact_delta_minutes == null
                ? 'Sem intervalo calculado'
                : `${row.close_fact_events_3m ?? 0} ocorr. ≤3 min · ${row.close_fact_events_5m ?? 0} ≤5 min`}
            </small>
          </span>
        ),
      },
      strength,
      cisps,
      period,
    ]
  },
  basis: (query, data) =>
    `Base do ranking: ±${data.analysis?.window_minutes ?? query.eventWindow} min · ${formatNumber(data.analysis?.radius_meters ?? query.radius)} m.`,
  csvViews: {
    correlations: 'Ranking geral',
    same_day: 'Sequências em um só dia',
    cold_plate: 'Dias de circulação',
  },
  csvColumns: [
    { header: 'uf_origem_placa', value: (row) => plateOrigin(row.plate).code },
    { header: 'tipo_veiculo', value: (row) => row.vehicle_type },
    {
      header: 'tipo_veiculo_origem',
      value: (row) =>
        row.vehicle_type_source === 'tipoveiculo'
          ? 'não PRF'
          : row.vehicle_type_source,
    },
    { header: 'cor_veiculo_prf', value: (row) => row.vehicle_color },
    { header: 'marca_modelo_prf', value: (row) => row.vehicle_model },
    { header: 'cisp_mais_lida', value: (row) => row.main_cisp },
    { header: 'cisp_mais_lida_nome', value: (row) => row.main_cisp_name },
    {
      header: 'cisp_mais_lida_percentual_leituras',
      value: (row) => row.main_cisp_share,
    },
    { header: 'ano_fabricacao_prf', value: (row) => row.manufacture_year },
    { header: 'ano_modelo_prf', value: (row) => row.model_year },
    { header: 'ocorrencias_vinculadas', value: (row) => row.linked_events },
    { header: 'leituras_correlatas', value: (row) => row.correlations },
    {
      header: 'deslocamento_autor',
      value: (row) => row.offender_modes?.join('|'),
    },
    { header: 'ros_do_dia', value: (row) => row.event_ids?.join('|') },
    {
      header: 'ocorrencias_no_periodo',
      value: (row) => row.plate_linked_events,
    },
    { header: 'dias_distintos', value: (row) => row.distinct_days },
    { header: 'cisps', value: (row) => row.cisps.join('|') },
    { header: 'primeira_correlacao', value: (row) => row.first_seen },
    { header: 'ultima_correlacao', value: (row) => row.last_seen },
    {
      header: 'mediana_tempo_ate_fato_min',
      value: (row) => row.median_fact_delta_minutes,
    },
    {
      header: 'ocorrencias_leitura_ate_3_min',
      value: (row) => row.close_fact_events_3m,
    },
    {
      header: 'ocorrencias_leitura_ate_5_min',
      value: (row) => row.close_fact_events_5m,
    },
    { header: 'proximidade_mediana', value: (row) => row.correlation_strength },
    {
      header: 'proximidade_media',
      value: (row) => row.average_correlation_strength,
    },
    {
      header: 'media_tempo_ate_fato_min',
      value: (row) => row.avg_fact_delta_minutes,
    },
    {
      header: 'mediana_distancia_fato_m',
      value: (row) => row.median_fact_distance_meters,
    },
    { header: 'leituras_antes_fato', value: (row) => row.before_count },
    { header: 'leituras_depois_fato', value: (row) => row.after_count },
    {
      header: 'correlatas_da_ocorrencia',
      value: (row) => row.event_correlata_min,
    },
    { header: 'dias_circulacao', value: (row) => row.circulation_days },
    { header: 'cobertura_percentual', value: (row) => row.coverage },
    {
      header: 'leituras_dias_correlacao',
      value: (row) => row.coverage_detections,
    },
    { header: 'leituras_total', value: (row) => row.total_detections },
    {
      header: 'max_correlacoes_mesmo_dia',
      value: (row) => row.max_same_day_correlations,
    },
    { header: 'data_ranking', value: (row) => row.event_date },
    { header: 'intervalo_fatos_min', value: (row) => row.span_minutes },
    ...CSV_ACTIVITY,
  ],
}
