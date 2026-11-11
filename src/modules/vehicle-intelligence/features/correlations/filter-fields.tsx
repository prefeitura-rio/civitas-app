import {
  copassagem,
  recorteAtual,
  type RecorteId,
} from '@/modules/vehicle-intelligence/config/recortes'
import {
  cargoOnly,
  cisp,
  eventWindow,
  factDistance,
  modality,
  offender,
  passageWindow,
  period,
  radius,
  targets,
} from '@/modules/vehicle-intelligence/features/correlations/filter-fields/fact-fields'
import type { FilterFieldDef } from '@/modules/vehicle-intelligence/features/correlations/filter-fields/field-types'
import {
  activity,
  denuncia,
  graphLimitField,
  minCorrelations,
  minEvents,
  minVictims,
  plateSituation,
  proximity,
  taxi,
  vehicle,
} from '@/modules/vehicle-intelligence/features/correlations/filter-fields/plate-fields'

export type {
  FieldContext,
  FilterFieldDef,
} from '@/modules/vehicle-intelligence/features/correlations/filter-fields/field-types'
export { graphLimitField }

// ------------------------------------------------- filtros dos recortes
/**
 * Os mesmos filtros nos três recortes. Muda só o que é do dado: o nome do
 * fato e do alvo, raio (entorno do fato) ou passagens da placa vítima
 * (copassagem), placas vítimas e o autor anotado na dinâmica.
 */
const VICTIM_WINDOW_HELP =
  'Intervalo máximo antes ou depois do fato em que a passagem da placa vítima pode ser considerada.'
const RECORTE_FIELDS: Record<
  RecorteId,
  {
    crimeType: FilterFieldDef
    target: FilterFieldDef
    windowHelp: string
    distanceHelp?: string
    alsoVictimLabel?: string
    victimsHelp?: string
  }
> = {
  transeuntes: {
    crimeType: modality('Tipo do fato'),
    target: targets('Alvo', 'Aparelho celular ou pertences do transeunte.', [
      'CELULAR',
      'TRANSEUNTE',
      'OUTROS',
    ]),
    windowHelp:
      'Intervalo antes e depois do horário do fato. Grafo e ranking usam esta janela; o ranking considera todas as associações elegíveis, mesmo fora da visualização.',
  },
  veiculos: {
    crimeType: modality('Tipo do fato'),
    target: targets(
      'Veículo subtraído',
      'Categoria do veículo roubado ou furtado.',
    ),
    windowHelp: VICTIM_WINDOW_HELP,
    distanceHelp:
      'Distância entre o radar que leu a placa vítima e o local do roubo ou furto.',
    alsoVictimLabel: 'Também subtraída',
    victimsHelp:
      'Quantidade mínima de veículos roubados ou furtados relacionados à placa encontrada.',
  },
  carga: {
    crimeType: modality(
      'Categoria da carga',
      'A categoria “Carga subtraída” inclui classificação automática pendente de revisão.',
    ),
    target: targets(
      'Veículo da carga',
      'Categoria do veículo associado à carga.',
    ),
    windowHelp: VICTIM_WINDOW_HELP,
    distanceHelp:
      'Distância entre o radar que leu a placa vítima e o local do roubo de carga.',
    alsoVictimLabel: 'Também vítima de carga',
    victimsHelp:
      'Quantidade mínima de veículos vítimas de carga relacionados à placa encontrada.',
  },
}
const recorteFields = RECORTE_FIELDS[recorteAtual]
export const FILTER_FIELDS: {
  facts: FilterFieldDef[]
  plates: FilterFieldDef[]
} = {
  facts: [
    period,
    recorteFields.crimeType,
    cargoOnly,
    recorteFields.target,
    offender,
    cisp,
    eventWindow(
      copassagem ? 'Janela do fato' : 'Janela de tempo',
      recorteFields.windowHelp,
    ),
    ...(copassagem
      ? [passageWindow, factDistance(recorteFields.distanceHelp ?? '')]
      : [radius]),
  ],
  plates: [
    vehicle,
    plateSituation(recorteFields.alsoVictimLabel),
    taxi,
    denuncia,
    minCorrelations,
    minEvents,
    ...(recorteFields.victimsHelp
      ? [minVictims(recorteFields.victimsHelp)]
      : []),
    proximity,
    activity,
  ],
}
