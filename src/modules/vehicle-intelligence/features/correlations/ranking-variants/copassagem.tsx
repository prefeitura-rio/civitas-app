/** Ranking da copassagem (veículos e carga): passagens no mesmo radar junto à placa vítima. */
import { recorteAtual } from '@/modules/vehicle-intelligence/config/recortes'
import {
  type Column,
  formatDistance,
} from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'
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
  formatDate,
  formatDateTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import { plateOrigin } from '@/modules/vehicle-intelligence/lib/plate-origin'

const STOLEN_HELP =
  recorteAtual === 'carga'
    ? 'Data e hora em que o veículo da placa correlata foi registrado como subtraído junto com a carga.'
    : 'Data e hora em que a própria placa correlata foi registrada como roubada ou furtada.'

export const copassagemVariant: RankingVariant = {
  intro:
    'O ranking geral reúne volume, recorrência e proximidade ao fato; as demais visões preservam recortes com unidades próprias.',
  searchPlaceholder: 'Vítimas ou correlatas (separe por vírgula)',
  tabs: [
    { id: 'correlations', label: 'Ranking geral' },
    { id: 'same_day', label: 'Sequências em um só dia' },
    { id: 'cold_plate', label: 'Dias de circulação' },
    { id: 'stolen_before_recovery', label: 'Subtraída → recuperada' },
  ],
  sortLabels: {
    ...COMMON_SORT_LABELS,
    victim_plates: 'Placas vítimas',
    correlation_strength: 'Força da correlação',
    average_correlation_strength: 'Força média',
    avg_fact_candidate_minutes: 'Distância temporal do fato',
    close_passage_events_3m: 'Passagens até 3 min',
    close_passage_events_5m: 'Passagens até 5 min',
    median_passage_delta_minutes: 'Intervalo entre passagens',
    stolen_at: 'Subtraída em',
    recovered_on: 'Recuperada em',
  },
  ascending: ['median_passage_delta_minutes'],
  // Sequências em um só dia: a maior sequência primeiro, como no entorno do fato.
  defaultSort: (view) => [
    {
      key: view === 'same_day' ? 'linked_events' : 'correlations',
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
    // Como no ranking geral: as medidas secundárias (dias distintos, força média, tempo até o fato)
    // ficam como subtítulo da célula, com o atalho de ordenação, e a tabela não rola de lado.
    const victims: Column = {
      key: 'victim_plates',
      label: 'Placas vítimas',
      sortKey: 'victim_plates',
      help: 'Quantidade de placas vítimas distintas relacionadas à placa correlata e de dias diferentes em que houve fato correlacionado.',
      render: (row) => (
        <span className="ranking-proximity">
          <b>{formatNumber(row.victim_plates)}</b>
          <small>
            {sortButton(
              'distinct_days',
              'Ordenar por dias distintos',
              `${row.distinct_days ?? '—'} ${row.distinct_days === 1 ? 'dia distinto' : 'dias distintos'}`,
            )}
          </small>
        </span>
      ),
    }
    const strength: Column = {
      key: 'correlation_strength',
      label: 'Força da correlação',
      sortKey: 'correlation_strength',
      help: 'Combina intervalo vítima↔correlata (55%), tempo até o fato (20%) e distância ao fato (25%). Até 1 min, 10 min e 1,5 km ficam nas margens de tolerância. Abaixo, a força média: a média das forças calculadas evidência a evidência, que não satura em 100 com poucas evidências.',
      render: (row) => (
        <span className="ranking-proximity">
          <b>{row.correlation_strength ?? '—'}</b>
          <small>
            {row.correlation_strength == null ? (
              'Sem fato geocodificado'
            ) : (
              <>
                média{' '}
                {sortButton(
                  'average_correlation_strength',
                  'Ordenar por força média',
                  row.average_correlation_strength ?? '—',
                )}{' '}
                · {row.median_passage_delta_minutes ?? 0} min entre passagens ·{' '}
                {sortButton(
                  'avg_fact_candidate_minutes',
                  'Ordenar pela distância temporal do fato',
                  `${row.avg_fact_candidate_minutes ?? 0} min do fato`,
                )}{' '}
                · {formatDistance(row.median_fact_distance_meters)}
              </>
            )}
          </small>
        </span>
      ),
    }
    const circulationWithDays: Column = {
      ...circulation,
      help: 'Dias diferentes em que a placa foi detectada no Cerco Eletrônico e, abaixo, quantos deles tiveram fato correlacionado.',
      render: (row) => (
        <span className="ranking-proximity">
          <b>{row.circulation_days?.toLocaleString('pt-BR') ?? '—'}</b>
          <small>
            {sortButton(
              'distinct_days',
              'Ordenar por dias com correlação',
              `${row.distinct_days ?? '—'} com correlação`,
            )}
          </small>
        </span>
      ),
    }
    if (view === 'cold_plate')
      return [
        rank,
        plate,
        vehicle,
        mainCisp,
        recentActivity,
        coverage,
        circulationWithDays,
        strength,
        correlations,
        cisps,
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
          help: 'Fatos distintos da mesma data ligados à placa e as placas vítimas desses fatos. Embaixo, o total de vítimas da placa no período: é sobre os totais que valem os mínimos dos filtros.',
          render: (row) => (
            <span className="ranking-proximity">
              <b>{row.linked_events}</b>
              <small>
                {pluralize(row.victim_plates ?? 0, 'vítima', 'vítimas')}
                {row.plate_victim_plates != null
                  ? ` de ${formatNumber(row.plate_victim_plates)} no período`
                  : ''}
              </small>
            </span>
          ),
        },
        correlations,
        cisps,
        span,
        period,
      ]
    if (view === 'stolen_before_recovery')
      return [
        rank,
        plate,
        vehicle,
        mainCisp,
        recentActivity,
        {
          key: 'stolen_at',
          label: 'Subtraída em',
          sortKey: 'stolen_at',
          help: STOLEN_HELP,
          render: (row) => formatDateTime(row.stolen_at),
        },
        {
          key: 'recovered_on',
          label: 'Recuperada em',
          sortKey: 'recovered_on',
          help: 'Primeira data de recuperação informada. A fonte não possui o horário da recuperação.',
          render: (row) => formatDate(row.recovered_on),
        },
        {
          key: 'recovery_cisp',
          label: 'Área da recuperação',
          help: 'Delegacia associada ao primeiro registro de recuperação da placa.',
          render: (row) =>
            row.recovery_cisp
              ? cisps.render(
                  { ...row, cisps: [row.recovery_cisp], cisp_count: 1 },
                  0,
                )
              : '—',
        },
        correlations,
        victims,
        cisps,
        period,
      ]
    return [
      rank,
      plate,
      vehicle,
      mainCisp,
      recentActivity,
      correlations,
      victims,
      {
        key: 'joint_passage',
        label: 'Intervalo entre passagens',
        sortKey: 'median_passage_delta_minutes',
        help: 'Mediana do tempo entre a passagem da vítima e a passagem da correlata no mesmo radar. Clique para ordenar pelo menor ou maior intervalo.',
        render: (row) => (
          <span className="ranking-proximity">
            <b>
              {row.median_passage_delta_minutes == null
                ? '—'
                : `${row.median_passage_delta_minutes} min`}
            </b>
            <small>
              {row.median_passage_delta_minutes == null
                ? 'Sem intervalo calculado'
                : `${row.close_passage_events_3m ?? 0} ocorr. ≤3 min · ${row.close_passage_events_5m ?? 0} ≤5 min`}
            </small>
          </span>
        ),
      },
      strength,
      cisps,
      period,
    ]
  },
  basis: (query) =>
    `Base do ranking: ±${query.eventWindow} min do fato · ±${query.passageWindow} min entre passagens.`,
  csvViews: {
    correlations: 'Ranking geral',
    same_day: 'Sequências em um só dia',
    cold_plate: 'Dias de circulação',
    stolen_before_recovery: 'Subtraída até recuperação',
  },
  csvColumns: [
    { header: 'uf_origem_placa', value: (row) => plateOrigin(row.plate).code },
    { header: 'tipo_veiculo', value: (row) => row.vehicle_type },
    { header: 'marca_modelo_prf', value: (row) => row.vehicle_model },
    { header: 'cisp_mais_lida', value: (row) => row.main_cisp },
    { header: 'cisp_mais_lida_nome', value: (row) => row.main_cisp_name },
    {
      header: 'cisp_mais_lida_percentual_leituras',
      value: (row) => row.main_cisp_share,
    },
    { header: 'ocorrencias_vinculadas', value: (row) => row.linked_events },
    { header: 'leituras_correlatas', value: (row) => row.correlations },
    { header: 'placas_vitimas', value: (row) => row.victim_plates },
    {
      header: 'placas_vitimas_no_periodo',
      value: (row) => row.plate_victim_plates,
    },
    { header: 'dias_distintos', value: (row) => row.distinct_days },
    { header: 'cisps', value: (row) => row.cisps.join('|') },
    { header: 'primeira_correlacao', value: (row) => row.first_seen },
    { header: 'ultima_correlacao', value: (row) => row.last_seen },
    {
      header: 'mediana_intervalo_passagens_min',
      value: (row) => row.median_passage_delta_minutes,
    },
    {
      header: 'ocorrencias_passagem_ate_3_min',
      value: (row) => row.close_passage_events_3m,
    },
    {
      header: 'ocorrencias_passagem_ate_5_min',
      value: (row) => row.close_passage_events_5m,
    },
    { header: 'forca_correlacao', value: (row) => row.correlation_strength },
    {
      header: 'media_distancia_temporal_fato_min',
      value: (row) => row.avg_fact_candidate_minutes,
    },
    {
      header: 'mediana_distancia_fato_m',
      value: (row) => row.median_fact_distance_meters,
    },
    { header: 'dias_circulacao', value: (row) => row.circulation_days },
    { header: 'cobertura_percentual', value: (row) => row.coverage },
    {
      header: 'placa_tambem_subtraida',
      value: (row) => row.is_new_plate === false,
    },
    {
      header: 'max_correlacoes_mesmo_dia',
      value: (row) => row.max_same_day_correlations,
    },
    { header: 'data_ranking', value: (row) => row.event_date },
    { header: 'intervalo_fatos_min', value: (row) => row.span_minutes },
    ...CSV_ACTIVITY,
    { header: 'subtraida_em', value: (row) => row.stolen_at },
    { header: 'recuperada_em', value: (row) => row.recovered_on },
    { header: 'cisp_recuperacao', value: (row) => row.recovery_cisp },
  ],
}
