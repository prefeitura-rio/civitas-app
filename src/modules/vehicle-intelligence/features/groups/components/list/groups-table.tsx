import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import {
  modalitiesText,
  shortTerritory,
} from '@/modules/vehicle-intelligence/features/groups/components/list/list-text'
import { PlateWithMarks } from '@/modules/vehicle-intelligence/features/groups/components/list/plate-with-marks'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { Group } from '@/modules/vehicle-intelligence/types/groups'

/** A vista em tabela da lista de grupos: uma linha por grupo; Enter ou clique abre o perfil. */
export function GroupsTable({
  groups,
  onOpen,
}: {
  groups: Group[]
  onOpen: (group: Group) => void
}) {
  const isInCerco = useIsInCerco()
  return (
    <div
      className="group-table group-table-groups"
      role="table"
      aria-label="Grupos"
    >
      <div className="group-table-head" role="row">
        {[
          'Grupo',
          'Placas',
          'ROs',
          'Lig. fortes',
          'Força',
          'Parte de',
          'Desconecta perto de',
          'Célula',
        ].map((title, i) => (
          <span
            key={title}
            role="columnheader"
            className={i >= 2 && i <= 4 ? 'num' : undefined}
          >
            {title}
          </span>
        ))}
      </div>
      {groups.map((group) => (
        <div
          key={group.id}
          role="row"
          tabIndex={0}
          className="group-table-row clickable"
          onClick={() => onOpen(group)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpen(group)
            }
          }}
        >
          <span role="cell" className="group-table-label">
            {group.label}
          </span>
          <span role="cell" className="group-table-plates">
            {group.members.map((m) => (
              <PlateWithMarks
                key={m.plate}
                member={m}
                isInCerco={isInCerco}
                background="#151a1a"
              />
            ))}
          </span>
          <span role="cell" className="num">
            {formatNumber(group.events)}
            <small>{formatNumber(group.shared_events)} com 2+</small>
            {group.modalities && (
              <small>{modalitiesText(group.modalities)}</small>
            )}
          </span>
          <span role="cell" className="num">
            {group.edges.filter((e) => e.strong).length}
          </span>
          <span role="cell" className="num">
            {formatNumber(group.strength)}
          </span>
          <span role="cell">{shortTerritory(group.territory.departure)}</span>
          <span role="cell">
            {shortTerritory(group.territory.disconnection)}
          </span>
          <span role="cell">{group.cell ?? '—'}</span>
        </div>
      ))}
    </div>
  )
}
