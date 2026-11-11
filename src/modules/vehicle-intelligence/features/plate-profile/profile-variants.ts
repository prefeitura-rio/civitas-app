import {
  copassagem,
  recorteAtual,
} from '@/modules/vehicle-intelligence/config/recortes'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type {
  PlateCorrelationsData,
  PlateProfileOccurrence,
} from '@/modules/vehicle-intelligence/types/domain'

export function distanceLabel(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value < 1000
    ? `${Math.round(value)} m`
    : `${(value / 1000).toFixed(1).replace('.', ',')} km`
}

const minutes = (value: number | null | undefined) =>
  value == null ? '—' : `${value} min`

/** Tipo de delito e deslocamento do autor, sem repetir "não informado". */
function factLabel(
  item: Pick<PlateProfileOccurrence, 'crime_type' | 'offender_mode'>,
): string {
  const mode =
    item.offender_mode && item.offender_mode !== 'NÃO INFORMADO'
      ? `autor ${categoryLabel(item.offender_mode).toLowerCase()}`
      : 'deslocamento não informado'
  return [item.crime_type || 'tipo não informado', mode].join(' · ')
}

/** Categoria cadastral e modelo do veículo subtraído, sem repetir "não informado". */
function vehicleLabel(
  item: Pick<PlateProfileOccurrence, 'target_category' | 'vehicle_model'>,
): string {
  const parts = [item.target_category, item.vehicle_model]
    .map((value) => (value || '').trim())
    .filter((value) => value && value.toUpperCase() !== 'NÃO INFORMADO')
  return parts.length
    ? [...new Set(parts)].join(' · ')
    : 'veículo não informado'
}

/** O que muda no perfil entre as estratégias: o fato é a âncora (entorno) ou a placa vítima (copassagem). */
interface ProfileVariant {
  /** Indicador da classificação, só quando a placa tem o sinal: táxi ativo (entorno) ou também vítima (copassagem). */
  classification: (
    data: PlateCorrelationsData,
  ) => { chip: string; title: string; text: string } | null
  /** Cartão do fato: âncora, assunto e medidas da ligação. */
  anchor: (item: PlateProfileOccurrence) => {
    label: string
    value: string
    isPlate: boolean
  }
  subject: (item: PlateProfileOccurrence) => string
  evidence: (
    item: PlateProfileOccurrence,
    cooccurrences?: number,
  ) => Array<[string, string, string?]>
  mapRole: (item: PlateProfileOccurrence) => string
  mapDetail: (item: PlateProfileOccurrence) => string
  mapLegend: string
  sections: { timeline: { title: string; text: string }; map: string }
  disclaimer: string
}

const VICTIM_TEXT =
  recorteAtual === 'carga'
    ? { known: 'também consta como vítima neste recorte de carga' }
    : { known: 'já registrada como vítima de subtração' }

const entorno: ProfileVariant = {
  classification: (data) =>
    data.is_active_taxi
      ? {
          chip: 'TÁXI',
          title: 'Táxi ativo',
          text: 'cruza a área por ofício; recorrência pesa menos',
        }
      : null,
  anchor: (item) => ({
    label: 'Ocorrência',
    value: item.event_id,
    isPlate: false,
  }),
  subject: factLabel,
  evidence: (item, cooccurrences) => [
    ['Leituras', cooccurrences == null ? '—' : formatNumber(cooccurrences)],
    [
      'Δt',
      minutes(item.fact_delta_minutes),
      'Tempo entre o fato e a leitura mais próxima',
    ],
    ['Distância', distanceLabel(item.fact_distance_meters)],
  ],
  mapRole: (item) => `RO ${item.event_id}`,
  mapDetail: factLabel,
  mapLegend: 'Local do fato em cujo entorno a placa foi lida',
  sections: {
    timeline: {
      title: 'Fatos em cujo entorno {plate} foi lida',
      text: 'Ordem cronológica dos roubos e furtos vinculados, com as leituras no raio e na janela, o tempo e a distância até o fato.',
    },
    map: 'Locais dos roubos e furtos vinculados — a leitura da proximidade entre os fatos sai daqui. Clique em uma ocorrência para abrir a timeline de 24 horas daquele dia.',
  },
  disclaimer:
    'Correlação é associação espaço-temporal com o entorno do fato, para triagem investigativa. Passar perto de um fato não é indício por si; não é prova de autoria nem confirma clonagem.',
}

const copassagemVariant: ProfileVariant = {
  classification: ({ summary }) =>
    summary.is_new_plate
      ? null
      : {
          chip: 'TAMBÉM VÍTIMA',
          title: 'Também placa vítima',
          text: VICTIM_TEXT.known,
        },
  anchor: (item) => ({
    label: 'Placa vítima',
    value: item.victim_plate ?? '—',
    isPlate: true,
  }),
  subject: vehicleLabel,
  evidence: (item) => [
    [
      'Δt ao fato',
      minutes(item.candidate_event_delta_minutes),
      'Tempo entre o fato e a passagem da correlata',
    ],
    ['Distância', distanceLabel(item.fact_distance_meters)],
  ],
  mapRole: (item) =>
    item.role === 'victim' ? 'PLACA VÍTIMA' : 'PLACA CORRELATA',
  mapDetail: (item) =>
    item.role === 'candidate'
      ? `vítima ${item.victim_plate}`
      : vehicleLabel(item),
  mapLegend: 'Ocorrência em que a placa aparece como correlata',
  sections: {
    timeline: {
      title: 'Fatos em que {plate} passou junto à vítima',
      text: 'Ordem cronológica das ocorrências vinculadas: a placa vítima, o local do fato e as medidas de proximidade.',
    },
    map: 'Locais geocodificados das subtrações vinculadas — a leitura da proximidade entre as vítimas sai daqui. Clique em uma ocorrência para abrir a timeline de 24 horas daquele dia.',
  },
  disclaimer:
    'Correlação é associação espaço-temporal no mesmo ponto de coleta, para triagem investigativa. Não é prova de autoria nem confirma clonagem.',
}

export const PROFILE: ProfileVariant = copassagem ? copassagemVariant : entorno
