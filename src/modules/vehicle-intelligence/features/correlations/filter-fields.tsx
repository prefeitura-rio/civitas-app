import {
  copassagem,
  recorte,
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
  zone,
} from '@/modules/vehicle-intelligence/features/correlations/filter-fields/fact-fields'
import type { FilterFieldDef } from '@/modules/vehicle-intelligence/features/correlations/filter-fields/field-types'
import {
  activity,
  denuncia,
  graphLimitField,
  minEvents,
  minPlateDetections,
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
 * Os mesmos filtros nos três recortes. Muda só o que é do dado (os nomes do fato, do alvo e da vítima vêm de
 * `config/recortes`): raio (entorno do fato) ou passagens da placa vítima (copassagem), placas vítimas e o autor
 * anotado na dinâmica.
 */
const WINDOW_HELP =
  recorte.windowHelp ??
  (copassagem
    ? 'Intervalo máximo antes ou depois do fato em que a passagem da placa vítima pode ser considerada.'
    : 'Intervalo antes e depois do horário do fato. Grafo e ranking usam esta janela; o ranking considera todas as associações elegíveis, mesmo fora da visualização.')
const { victim } = recorte
export const FILTER_FIELDS: {
  facts: FilterFieldDef[]
  plates: FilterFieldDef[]
} = {
  facts: [
    period,
    modality(recorte.modalityField.label, recorte.modalityField.help),
    cargoOnly,
    targets(
      recorte.target.label,
      recorte.target.help,
      recorte.target.fixedChoices,
    ),
    offender,
    zone,
    cisp,
    eventWindow(copassagem ? 'Janela do fato' : 'Janela de tempo', WINDOW_HELP),
    ...(copassagem
      ? [passageWindow, factDistance(victim?.factDistanceHelp ?? '')]
      : [radius]),
  ],
  plates: [
    vehicle,
    plateSituation(victim?.alsoVictimLabel),
    taxi,
    denuncia,
    minPlateDetections,
    minEvents,
    ...(victim ? [minVictims(victim.minimumVictimsHelp)] : []),
    proximity,
    activity,
  ],
}
