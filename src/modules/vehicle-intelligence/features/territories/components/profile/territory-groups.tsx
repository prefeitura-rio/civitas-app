import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import { TerritoryGroupCard } from '@/modules/vehicle-intelligence/features/territories/components/profile/territory-group-card'
import type { TerritoryGroup } from '@/modules/vehicle-intelligence/features/territories/types'

/** Os grupos do território: a legenda do mini-grafo e um cartão por grupo; o clique abre o perfil do grupo. */
export function TerritoryGroups({
  groups,
  faction,
  onOpen,
}: {
  groups: TerritoryGroup[]
  faction: string | null
  onOpen: (group: TerritoryGroup) => void
}) {
  const isInCerco = useIsInCerco()
  return (
    <>
      <div className="territory-legend-graph">
        <span>
          <i className="no base" aria-hidden="true" />
          Base aqui
        </span>
        <span>
          <i className="no" aria-hidden="true" />
          Sem base aqui
        </span>
        <span>
          <i className="row strong" aria-hidden="true" />
          Ligação forte
        </span>
        <span>
          <i className="row weak" aria-hidden="true" />
          Ligação fraca
        </span>
        <span>
          <i className="halo cerco" aria-hidden="true" />
          Cerco
        </span>
        <span>
          <i className="halo cited" aria-hidden="true" />
          Citada no relato
        </span>
      </div>
      <div className="territory-cards">
        {groups.map((group) => (
          <TerritoryGroupCard
            key={group.id}
            group={group}
            faction={faction}
            isInCerco={isInCerco}
            onOpen={() => onOpen(group)}
          />
        ))}
      </div>
    </>
  )
}
