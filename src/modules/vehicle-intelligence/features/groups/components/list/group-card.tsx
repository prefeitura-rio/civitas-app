import { ComplexName } from '@/modules/vehicle-intelligence/components/groups/complex-name'
import { GroupGraph } from '@/modules/vehicle-intelligence/components/groups/group-graph'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import { modalitiesText } from '@/modules/vehicle-intelligence/features/groups/components/list/list-text'
import { PlateWithMarks } from '@/modules/vehicle-intelligence/features/groups/components/list/plate-with-marks'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type {
  Group,
  TerritoryItem,
} from '@/modules/vehicle-intelligence/types/groups'

function TerritoryLine({
  label,
  item,
}: {
  label: string
  item: TerritoryItem
}) {
  return (
    <span className="group-card-territory-row">
      <span className="group-label">{label}</span>
      <ComplexName name={item.complex} faction={item.faction} />
      <span className="group-lift">{Math.round(item.lift)}×</span>
    </span>
  )
}

/** Cartão do grupo: mini-grafo, placas, números e território. */
export function GroupCard({
  group,
  onOpen,
}: {
  group: Group
  onOpen: () => void
}) {
  const isInCerco = useIsInCerco()
  const strongLinks = group.edges.filter((e) => e.strong).length
  const departure = group.territory.departure[0]
  const disconnection = group.territory.disconnection[0]
  return (
    <button
      type="button"
      className="group-card"
      onClick={onOpen}
      aria-label={`Abrir o perfil do grupo ${group.label}: ${group.members.map((m) => m.plate).join(', ')}`}
    >
      <span className="group-card-top">
        <strong>{group.label}</strong>
        <span>
          força <b>{formatNumber(group.strength)}</b>
        </span>
      </span>
      <span className="group-card-graph">
        <GroupGraph members={group.members} edges={group.edges} />
      </span>
      <span className="group-card-plates">
        {group.members.map((m) => (
          <PlateWithMarks key={m.plate} member={m} isInCerco={isInCerco} />
        ))}
      </span>
      <span className="group-card-numbers">
        <span>
          <b>{formatNumber(group.events)}</b>
          <small>ROs</small>
          {group.modalities && (
            <small className="group-card-modalities">
              {modalitiesText(group.modalities)}
            </small>
          )}
        </span>
        <span>
          <b>{formatNumber(group.shared_events)}</b>
          <small>com 2+ placas</small>
        </span>
        <span>
          <b>{strongLinks}</b>
          <small>
            {strongLinks === 1 ? 'ligação forte' : 'ligações fortes'}
          </small>
        </span>
      </span>
      <span className="group-card-territory">
        {departure && <TerritoryLine label="Parte de" item={departure} />}
        {disconnection && (
          <TerritoryLine label="Desconecta perto de" item={disconnection} />
        )}
        {!departure && !disconnection && (
          <span className="group-label">Sem território acima do comum</span>
        )}
      </span>
    </button>
  )
}
