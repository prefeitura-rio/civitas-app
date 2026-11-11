import { ComplexName } from '@/modules/vehicle-intelligence/components/groups/complex-name'
import {
  PlateDot,
  PlateMarks,
} from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import type {
  Group,
  GroupsData,
} from '@/modules/vehicle-intelligence/types/groups'

/** As células territoriais: os complexos base de duas ou mais sementes, os grupos e as sementes que agem sozinhas. */
export function CellsTable({
  data,
  onOpenGroup,
  onOpenPlate,
}: {
  data: GroupsData
  onOpenGroup: (group: Group) => void
  onOpenPlate: (plate: string) => void
}) {
  const isInCerco = useIsInCerco()
  const groupsByLabel = new Map(
    data.groups.map((group) => [group.label, group]),
  )
  return (
    <div
      className="group-table group-table-cells"
      role="table"
      aria-label="Células territoriais"
    >
      <div className="group-table-head top" role="row">
        <span role="columnheader">Complexo</span>
        <span role="columnheader" className="num">
          Sementes
        </span>
        <span role="columnheader">Grupos</span>
        <span role="columnheader">Agem sozinhas</span>
      </div>
      {data.cells.map((cell) => {
        const alone = cell.seeds.filter((seed) => !seed.group)
        return (
          <div key={cell.complex} role="row" className="group-table-row">
            <span role="cell" className="group-cell-complex">
              <ComplexName
                name={cell.complex}
                faction={cell.faction}
                showAbbreviation={false}
              />
              <small>{cell.faction ?? 'facção não informada'}</small>
            </span>
            <span role="cell" className="num">
              {cell.seeds.length}
            </span>
            <span role="cell" className="group-cell-groups">
              {cell.groups.map((label) => {
                const group = groupsByLabel.get(label)
                return (
                  group && (
                    <button
                      key={label}
                      type="button"
                      className="group-link"
                      onClick={() => onOpenGroup(group)}
                    >
                      {label} <span>{group.members.length} placas</span>
                    </button>
                  )
                )
              })}
            </span>
            <span role="cell" className="group-cell-alone">
              {alone.length ? (
                alone.map((seed) => {
                  const cerco = isInCerco(seed.plate)
                  return (
                    <span
                      key={seed.plate}
                      className="group-plate-row"
                      title={seed.evidence
                        .map(
                          (e) =>
                            `${e.kind === 'departure' ? 'Partidas' : 'Desconexões'}: ${e.count} de ${e.total} perto`,
                        )
                        .join(' · ')}
                    >
                      <PlateDot seed cerco={cerco} background="#151a1a" />
                      <button
                        type="button"
                        className="group-plate underlined"
                        onClick={() => onOpenPlate(seed.plate)}
                      >
                        {seed.plate}
                      </button>
                      <PlateMarks cerco={cerco} cited={seed.member.cited} />
                      <span className="group-evidence">
                        {seed.evidence
                          .map(
                            (e) =>
                              `${e.kind === 'departure' ? 'parte' : 'desconecta'} ${Math.round(e.lift)}×`,
                          )
                          .join(', ')}
                      </span>
                    </span>
                  )
                })
              ) : (
                <span className="group-label">—</span>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
