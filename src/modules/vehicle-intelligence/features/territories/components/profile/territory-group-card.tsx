import {
  factionAbbreviation,
  factionColor,
} from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { MiniGraph } from '@/modules/vehicle-intelligence/features/territories/components/profile/mini-graph'
import type { TerritoryGroup } from '@/modules/vehicle-intelligence/features/territories/types'
import { formatDayMonth } from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'

/** O cartão do grupo no território: placas com base aqui, ROs juntos, dias juntos e a célula. */
export function TerritoryGroupCard({
  group,
  faction,
  isInCerco,
  onOpen,
}: {
  group: TerritoryGroup
  faction: string | null
  isInCerco: (plate: string) => boolean
  onOpen: () => void
}) {
  const strongLinks = group.edges.filter((e) => e.strong).length
  const together = group.together
  const cellFaction = group.is_cell ? faction : group.cell_faction
  return (
    <button
      type="button"
      className="territory-card"
      onClick={onOpen}
      aria-label={`Abrir o perfil do grupo ${group.label}: ${group.members.map((m) => m.plate).join(', ')}`}
    >
      <span className="territory-card-top">
        <span>
          <b>{group.label}</b>
          <small>
            {group.members.length} placas · {strongLinks}{' '}
            {strongLinks === 1 ? 'lig. forte' : 'lig. fortes'}
          </small>
        </span>
        <span
          className={`territory-card-cell${group.is_cell ? ' here' : group.cell ? '' : ' none'}`}
        >
          {group.cell && (
            <i
              style={{ background: factionColor(cellFaction) }}
              aria-hidden="true"
            />
          )}
          {group.is_cell
            ? 'Célula: este complexo'
            : group.cell
              ? `Célula: ${group.cell}${cellFaction ? ` · ${factionAbbreviation(cellFaction)}` : ''}`
              : 'Sem célula'}
        </span>
      </span>
      <span className="territory-card-graph">
        <MiniGraph group={group} isInCerco={isInCerco} />
      </span>
      <span className="territory-card-numbers">
        <span>
          <b>
            {group.members_with_base.length} de {group.members.length}
          </b>
          <small>placas com base aqui</small>
        </span>
        <span>
          <b>
            {formatNumber(group.shared_events)} de {formatNumber(group.events)}
          </b>
          <small>ROs juntos</small>
        </span>
        <span>
          <b className="nowrap">
            {together?.first && together.last
              ? `${formatDayMonth(together.first)} – ${formatDayMonth(together.last)}`
              : '—'}
          </b>
          <small>
            {together
              ? pluralize(together.days, 'dia junto', 'dias juntos')
              : 'dias juntos'}
          </small>
        </span>
      </span>
    </button>
  )
}
