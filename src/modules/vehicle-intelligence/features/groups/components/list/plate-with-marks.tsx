import {
  PlateDot,
  PlateMarks,
} from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import type { GroupMember } from '@/modules/vehicle-intelligence/types/groups'

/** A placa na lista de grupos: o ponto (semente ou parceira, anel do Cerco), a placa e os sinais. */
export function PlateWithMarks({
  member,
  isInCerco,
  background,
}: {
  member: GroupMember
  isInCerco: (plate: string) => boolean
  background?: string
}) {
  const cerco = isInCerco(member.plate)
  return (
    <span className="group-plate-row">
      <PlateDot seed={member.seed} cerco={cerco} background={background} />
      <span className="group-plate">{member.plate}</span>
      <PlateMarks cerco={cerco} cited={member.cited} />
    </span>
  )
}
