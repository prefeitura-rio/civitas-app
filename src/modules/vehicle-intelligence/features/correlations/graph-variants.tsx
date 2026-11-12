import type { ReactNode } from 'react'

import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import {
  vehicleDetailsLabel,
  vehicleTypeLabel,
  vehicleTypeSourceLabel,
} from '@/modules/vehicle-intelligence/lib/vehicles'
import type {
  CorrelationRankingRow,
  MasterPreData,
  PreEventCandidate,
} from '@/modules/vehicle-intelligence/types/domain'

export type GraphEdge = MasterPreData['graph']['edges'][number]
export type GraphNode = MasterPreData['graph']['nodes'][number]
type Candidate = PreEventCandidate | CorrelationRankingRow

const meters = (value: number | null | undefined) =>
  value != null ? `${Math.round(value)} m` : '—'
const minutes = (value: number | null | undefined) =>
  value != null ? `${value} min` : '—'

/** Linhas de situação comuns às dicas das correlatas. */
function statusLines(
  candidate: PreEventCandidate,
  citation?: string,
): string[] {
  return [
    citation ?? null,
    candidate.is_new_plate === false ? 'Placa também vítima' : null,
    candidate.is_clone_suspect
      ? `${candidate.is_clone_confirmed ? 'Clone confirmado' : 'Suspeita de clone'} · ${candidate.clone_temperature || 'classificação anual'} · temperatura ${candidate.clone_temperature_score ?? 0}`
      : null,
    candidate.detections_45d > 0
      ? `Cerco Eletrônico atual · 7d ${candidate.detections_7d} · 15d ${candidate.detections_15d} · 30d ${candidate.detections_30d} · 45d ${candidate.detections_45d}`
      : 'Sem detecção atual nos últimos 45 dias',
    candidate.is_active_taxi ? 'Táxi ativo' : null,
    candidate.vehicle_type
      ? `Veículo (${vehicleTypeSourceLabel(candidate.vehicle_type_source) || 'origem não informada'}): ${[vehicleTypeLabel(candidate.vehicle_type, candidate.vehicle_type_share), vehicleDetailsLabel(candidate)].filter(Boolean).join(' · ')}`
      : null,
  ].filter((line): line is string => Boolean(line))
}

export interface GraphVariant {
  heading: { title: string; text: string }
  legend: Array<{ className: string; label: string }>
  /** Nó-âncora da rede: o fato (RO) ou a placa vítima, que tem etiqueta CERCO e perfil próprio. */
  anchor: {
    singular: string
    plural: string
    linked: string
    title: string
    isPlate: boolean
  }
  anchorName: (node: GraphNode | undefined, id: string) => string
  anchorTitle: (node: GraphNode) => string
  /** Correlata em laranja: táxi ativo (entorno) ou também vítima (copassagem). */
  highlighted: (candidate: Candidate) => boolean
  candidateTitle: (
    label: string,
    candidate: PreEventCandidate,
    citation?: string,
  ) => string
  edgeTitle: (edge: GraphEdge) => string
  strengthLabel: string
  /** Medidas do inspetor da correlata, além da força ou proximidade. */
  candidateCards: (candidate: Candidate) => Array<[string, string]>
  /** Duas medidas curtas de cada ligação na lista do inspetor da âncora. */
  edgeCells: (edge: GraphEdge) => [string, string]
  method: { title: string; lines: string[] }
  table: { headers: string[]; cells: (edge: GraphEdge) => ReactNode[] }
}

const entornoVariant: GraphVariant = {
  heading: {
    title: 'Ocorrências e placas organizadas pelas ligações',
    text: 'Vermelho identifica correlatas, laranja os táxis ativos, magenta as citadas na dinâmica como veículo dos autores, roxo as suspeitas de clone, roxo forte os clones confirmados e os círculos azuis as ocorrências.',
  },
  legend: [
    { className: '', label: 'Correlata' },
    { className: 'known-dot', label: 'Táxi ativo' },
    { className: 'author-cited-dot', label: 'Citada na dinâmica' },
    { className: 'clone-dot', label: 'Suspeita de clone' },
    { className: 'clone-confirmed-dot', label: 'Clone confirmado' },
    { className: 'victim-dot', label: 'Ocorrência' },
  ],
  anchor: {
    singular: 'RO',
    plural: 'ROs',
    linked: 'ligados',
    title: 'OCORRÊNCIA',
    isPlate: false,
  },
  anchorName: (node, id) => `RO ${node?.ro ?? id}`,
  anchorTitle: (node) =>
    `RO ${node.label}\nOcorrência${node.detail ? `\n${node.detail}` : ''}`,
  highlighted: (candidate) => candidate.is_active_taxi,
  candidateTitle: (label, candidate, citation) =>
    [
      label,
      'Placa correlata',
      ...statusLines(candidate, citation),
      `${candidate.linked_events} ocorrências · ${candidate.distinct_days ?? '—'} dias distintos · ${candidate.cisp_count} CISPs`,
      `Tempo até o fato: mediana ${candidate.median_fact_delta_minutes ?? '—'} min · ${candidate.close_fact_events_3m ?? '—'} ocorr. ≤3 min · ${candidate.close_fact_events_5m ?? '—'} ≤5 min`,
      `Proximidade mediana: ${candidate.correlation_strength ?? 'não calculável'}`,
      `Distância típica equipamento → fato: ${candidate.median_fact_distance_meters != null ? `${Math.round(candidate.median_fact_distance_meters)} m` : 'não calculada'}`,
      `Leituras antes / depois do fato: ${candidate.before} / ${candidate.after}`,
    ].join('\n'),
  edgeTitle: (edge) =>
    [
      `RO ${edge.source} ↔ ${edge.target}`,
      `${edge.weight} leituras no entorno do fato`,
      `Leitura mais próxima do horário: ${edge.min_fact_delta_minutes} min · média ${edge.avg_fact_delta_minutes} min`,
      `Equipamento mais próximo do local: ${edge.min_fact_distance_meters != null ? `${Math.round(edge.min_fact_distance_meters)} m` : 'não calculado'}`,
      `Antes / depois do fato: ${edge.before} / ${edge.after}`,
      `Proximidade mediana: ${edge.correlation_strength ?? 'não calculável'}`,
    ].join('\n'),
  strengthLabel: 'Proximidade mediana',
  candidateCards: (candidate) => [
    ['Tempo até o fato', minutes(candidate.median_fact_delta_minutes)],
    ['Equipamento → fato', meters(candidate.median_fact_distance_meters)],
  ],
  edgeCells: (edge) => [
    minutes(edge.min_fact_delta_minutes),
    meters(edge.min_fact_distance_meters),
  ],
  method: {
    title: 'Como a proximidade é calculada',
    lines: [
      '1. Por ocorrência: tempo médio até o fato (60%), sem penalidade até 2 min',
      '2. Por ocorrência: distância média equipamento → fato (40%), sem penalidade até 200 m',
      '3. Mediana e média das notas por ocorrência; cada fato tem peso igual',
      '4. Passar perto de um fato não é indício: táxis e aplicativos cruzam a área o dia inteiro. O que pesa é a recorrência em fatos distintos',
      '5. Escala descritiva de proximidade; não mede autoria nem força de evidência',
    ],
  },
  table: {
    headers: [
      'Ocorrência',
      'Correlata',
      'Leituras',
      'Leitura mais próxima do horário',
      'Equipamento mais próximo',
      'Antes / depois',
      'Proximidade mediana',
    ],
    cells: (edge) => [
      edge.source,
      <strong key="plate">{edge.target}</strong>,
      edge.weight,
      minutes(edge.min_fact_delta_minutes),
      meters(edge.min_fact_distance_meters),
      `${edge.before} / ${edge.after}`,
      edge.correlation_strength ?? '—',
    ],
  },
}

const copassagemVariant: GraphVariant = {
  heading: {
    title: 'Correlatas no centro; vítimas nas pontas',
    text: 'Vermelho identifica correlatas, laranja as que também foram vítimas, magenta as citadas na dinâmica como veículo dos autores, roxo as suspeitas de clone, roxo forte os clones confirmados e azul as vítimas.',
  },
  legend: [
    { className: '', label: 'Correlata' },
    { className: 'known-dot', label: 'Também vítima' },
    { className: 'author-cited-dot', label: 'Citada na dinâmica' },
    { className: 'clone-dot', label: 'Suspeita de clone' },
    { className: 'clone-confirmed-dot', label: 'Clone confirmado' },
    { className: 'victim-dot', label: 'Vítima' },
  ],
  anchor: {
    singular: 'vítima',
    plural: 'vítimas',
    linked: 'ligadas',
    title: 'PLACA VÍTIMA',
    isPlate: true,
  },
  anchorName: (_node, id) => id,
  anchorTitle: (node) => `${node.label}\nPlaca vítima · ponta da rede`,
  highlighted: (candidate) => candidate.is_new_plate === false,
  candidateTitle: (label, candidate, citation) =>
    [
      label,
      'Placa correlata',
      ...statusLines(candidate, citation),
      `${candidate.linked_events} casos · ${candidate.distinct_days} dias distintos · ${candidate.cisp_count} CISPs`,
      `Intervalo entre passagens: ${candidate.median_passage_delta_minutes} min · ${candidate.close_passage_events_3m} ocorr. ≤3 min · ${candidate.close_passage_events_5m} ≤5 min`,
      `Força da correlação: ${candidate.correlation_strength ?? 'não calculável'}`,
      `Fato → correlata: ${candidate.avg_candidate_event_delta_minutes} min em média`,
      `Distância típica radar → fato: ${candidate.median_fact_distance_meters != null ? `${Math.round(candidate.median_fact_distance_meters)} m` : 'não calculada'}`,
    ].join('\n'),
  edgeTitle: (edge) =>
    [
      `${edge.source} ↔ ${edge.target}`,
      `${edge.weight} correlações · ${edge.events || 1} ocorrência(s)`,
      `Intervalo entre passagens: ${edge.median_passage_delta_minutes} min · ${edge.close_passage_events_3m} ocorr. ≤3 min · ${edge.close_passage_events_5m} ≤5 min`,
      `Força da correlação: ${edge.correlation_strength ?? 'não calculável'}`,
      `Fato → correlata: ${edge.avg_candidate_event_delta_minutes} min em média`,
      `Distância típica radar → fato: ${edge.median_fact_distance_meters != null ? `${Math.round(edge.median_fact_distance_meters)} m` : 'não calculada'}`,
    ].join('\n'),
  strengthLabel: 'Força da correlação',
  candidateCards: (candidate) => [
    [
      'Intervalo entre passagens',
      minutes(candidate.median_passage_delta_minutes),
    ],
    [
      'Fato → correlata',
      minutes(
        'score' in candidate
          ? candidate.avg_candidate_event_delta_minutes
          : candidate.avg_fact_candidate_minutes,
      ),
    ],
    ['Radar → fato', meters(candidate.median_fact_distance_meters)],
  ],
  edgeCells: (edge) => [
    minutes(edge.median_passage_delta_minutes),
    meters(edge.median_fact_distance_meters),
  ],
  method: {
    title: 'Como a evidência pesa',
    lines: [
      '1. Intervalo vítima ↔ correlata: 55%, pela mediana e sem penalidade até 1 min',
      '2. Tempo fato → correlata: 20%, pela média, sem penalidade até 10 min e queda forte a partir de 20 min',
      '3. Distância radar → fato: 25%, pela mediana e sem penalidade até 1,5 km',
      '4. A força só é calculada quando os três componentes estão disponíveis',
      '5. É priorização investigativa, não probabilidade ou confirmação',
    ],
  },
  table: {
    headers: [
      'Vítima',
      'Correlata',
      'Ocorrências',
      'Correlações',
      'Intervalo entre passagens',
      'Fato → correlata',
      'Força da correlação',
    ],
    cells: (edge) => [
      edge.source,
      <strong key="plate">{edge.target}</strong>,
      edge.events || 1,
      edge.weight,
      `${minutes(edge.median_passage_delta_minutes)} · ${edge.close_passage_events_3m} ocorr. ≤3 min · ${edge.close_passage_events_5m} ≤5 min`,
      minutes(edge.avg_candidate_event_delta_minutes),
      edge.correlation_strength ?? '—',
    ],
  },
}

export const GRAPH: GraphVariant = copassagem
  ? copassagemVariant
  : entornoVariant
