import {
  PRIMARY,
  SECONDARY,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import type { MasterPostData } from '@/modules/vehicle-intelligence/features/post-event/types'

/** Os parâmetros do motor que a legenda explica, com os padrões de quando a metodologia não os traz. */
export function legendParameters(methodology: MasterPostData['methodology']) {
  const originPoleParameters =
    methodology.origin_cluster_parameters as unknown as
      | Record<string, { radius_meters: number; minimum_events: number }>
      | undefined
  const originConcentrationParameters =
    methodology.origin_concentration_parameters as unknown as
      | {
          radius_meters: number
          minimum_events: number
          minimum_days: number
        }
      | undefined
  return {
    primaryPoleRadius: originPoleParameters?.[PRIMARY]?.radius_meters ?? 300,
    primaryPoleMinimum: originPoleParameters?.[PRIMARY]?.minimum_events ?? 4,
    secondaryPoleRadius:
      originPoleParameters?.[SECONDARY]?.radius_meters ?? 300,
    secondaryPoleMinimum:
      originPoleParameters?.[SECONDARY]?.minimum_events ?? 4,
    disconnectionPoleRadius: Number(methodology.cluster_radius_meters) || 400,
    disconnectionPoleMinimum:
      Number(methodology.cluster_minimum_destination_points) || 3,
    concentratedPoleMinimum:
      Number(methodology.terminal_hub_minimum_events) || 3,
    concentratedPoleMinimumDays:
      Number(methodology.terminal_hub_minimum_days) || 3,
    originConcentrationRadius:
      originConcentrationParameters?.radius_meters ?? 75,
    originConcentrationMinimum:
      originConcentrationParameters?.minimum_events ?? 3,
    originConcentrationDays: originConcentrationParameters?.minimum_days ?? 3,
  }
}
