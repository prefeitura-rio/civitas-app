import { useMemo } from 'react'

import {
  ActivityChart,
  type ActivityRow,
} from '@/modules/vehicle-intelligence/components/groups/activity-chart'
import { memberRole } from '@/modules/vehicle-intelligence/components/groups/group-text'
import { plateColor } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import type { GroupProfileData } from '@/modules/vehicle-intelligence/types/groups'

/** Começos e fins de leitura das placas do grupo, com as possíveis trocas; sem a camada de territórios, o aviso. */
export function GroupActivity({
  data,
  onOpenPlate,
}: {
  data: GroupProfileData
  onOpenPlate: (plate: string) => void
}) {
  const successions = useMemo(() => data.successions ?? [], [data])
  // A série: os membros e as placas de fora do grupo que começaram numa troca (ponto vazado, fora do total).
  const activityRows = useMemo<ActivityRow[]>(() => {
    const members = data.members
    const inGroup = new Set(members.map((m) => m.plate))
    const outside = new Map(
      successions.filter((t) => !inGroup.has(t.to)).map((t) => [t.to, t]),
    )
    return [
      ...members.map((m, i) => ({
        plate: m.plate,
        cited: m.cited,
        rank: m.coverage_rank,
        color: plateColor(i),
        note: memberRole(m),
      })),
      ...[...outside.values()].map((t) => ({
        plate: t.to,
        cited: Boolean(t.cited_to),
        rank: null,
        outside: true,
        note: 'fora do grupo',
      })),
    ]
  }, [data, successions])
  return data.activity ? (
    <ActivityChart
      key={data.id}
      activity={data.activity}
      onOpenPlate={onOpenPlate}
      pairs={successions}
      vocabulary="group"
      emptyText="Nenhuma placa do grupo neste caso."
      description="Placas do grupo, semana a semana, em qualquer câmera. Quando uma placa para e outra começa logo depois com a mesma rotina, a segunda aparece logo abaixo como possível troca."
      rows={activityRows}
    />
  ) : (
    <>
      <div className="panel-head">
        <div>
          <h2>Começos e fins de leitura</h2>
        </div>
      </div>
      <p className="groups-none">
        Série indisponível: falta a camada de territórios (
        <code>python -m pipeline.derivados territorios</code>).
      </p>
    </>
  )
}
