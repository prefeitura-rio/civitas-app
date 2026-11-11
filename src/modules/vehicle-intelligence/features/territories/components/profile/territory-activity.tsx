import { useMemo } from 'react'

import {
  ActivityChart,
  type ActivityRow,
} from '@/modules/vehicle-intelligence/components/groups/activity-chart'
import { rankingNote } from '@/modules/vehicle-intelligence/features/territories/components/profile/base-plates'
import type {
  TerritoryMember,
  TerritoryProfileData,
} from '@/modules/vehicle-intelligence/features/territories/types'

/** Começos e fins de leitura das placas do território, com as possíveis trocas; sem a camada, o aviso. */
export function TerritoryActivity({
  data,
  membersByPlate,
  onOpenPlate,
}: {
  data: TerritoryProfileData
  membersByPlate: Map<string, TerritoryMember>
  onOpenPlate: (plate: string) => void
}) {
  const activityRows = useMemo<ActivityRow[]>(
    () =>
      (data.activity?.plates ?? []).map(({ plate }) => {
        const m = membersByPlate.get(plate)
        return {
          plate,
          cited: Boolean(m?.cited),
          rank: m?.rank ?? null,
          note: rankingNote(m, 'fora do ranking'),
        }
      }),
    [data, membersByPlate],
  )
  return data.activity ? (
    <ActivityChart
      activity={data.activity}
      rows={activityRows}
      onOpenPlate={onOpenPlate}
      pairs={data.successions ?? []}
      description="Placas em destaque, no Cerco, citadas ou que vêm de fora, semana a semana, em qualquer câmera. Quando uma placa para e outra começa logo depois com a mesma rotina, a segunda aparece logo abaixo como possível troca."
    />
  ) : (
    <>
      <div className="panel-head">
        <div>
          <h2>Começos e fins de leitura</h2>
        </div>
      </div>
      <p className="list-empty">
        Série indisponível: falta a camada de territórios.
      </p>
    </>
  )
}
