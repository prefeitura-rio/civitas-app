import {
  PlateButton,
  PlateTags,
} from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import type { PlateSort } from '@/modules/vehicle-intelligence/features/territories/components/profile/base-plates'
import type {
  TerritoryGroup,
  TerritoryMember,
} from '@/modules/vehicle-intelligence/features/territories/types'
import { ITEMS_TITLE } from '@/modules/vehicle-intelligence/features/territories/vocabulary'
import { formatDayMonthYear } from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { titleCaseText } from '@/modules/vehicle-intelligence/lib/labels'

/** As placas de base já filtradas e ordenadas; o título das colunas Ranking e Base no complexo reordena. */
export function BasePlatesTable({
  members,
  sortKey,
  onSortChange,
  groupsByLabel,
  regionName,
  onOpenPlate,
  onOpenGroup,
}: {
  members: TerritoryMember[]
  sortKey: PlateSort
  onSortChange: (sortKey: PlateSort) => void
  groupsByLabel: Map<string, TerritoryGroup>
  regionName: string
  onOpenPlate: (plate: string) => void
  onOpenGroup: (group: TerritoryGroup) => void
}) {
  const isInCerco = useIsInCerco()
  return (
    <div
      className="list territory-list-plates"
      role="table"
      aria-label={`${ITEMS_TITLE} de base`}
    >
      <div className="list-head" role="row">
        <span role="columnheader">Placa</span>
        {(['ranking', 'base'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="columnheader"
            aria-sort={
              sortKey === key
                ? key === 'ranking'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
            className={`list-sort${key === 'ranking' ? ' num' : ''}${sortKey === key ? ' active' : ''}`}
            onClick={() => onSortChange(key)}
          >
            {key === 'ranking' ? 'Ranking' : 'Base no complexo'}
            {sortKey === key ? ' ↓' : ''}
          </button>
        ))}
        <span role="columnheader">Origem</span>
        <span role="columnheader">Período lido</span>
        <span role="columnheader">Grupo</span>
      </div>
      {members.map((m, i) => {
        const cerco = isInCerco(m.plate)
        const group = m.group ? groupsByLabel.get(m.group) : undefined
        return (
          <div
            key={m.plate}
            role="row"
            className={`list-row${i % 2 ? ' pair' : ''}`}
          >
            <span role="cell">
              <PlateButton plate={m.plate} onOpen={onOpenPlate} />
              {(cerco || m.cited) && (
                <span className="list-tags">
                  <PlateTags plate={m.plate} cited={m.cited} />
                </span>
              )}
              <small className="break">
                {m.vehicle_model ??
                  (m.vehicle_type
                    ? titleCaseText(m.vehicle_type)
                    : 'sem cadastro PRF')}
              </small>
            </span>
            <span role="cell" className="num">
              <span className="light">{m.rank ? `${m.rank}ª` : '—'}</span>
              <small>{formatNumber(m.linked_events)} ocorr.</small>
            </span>
            <span role="cell" className="num-text">
              {(
                [
                  ['Parte', m.departure],
                  ['Desconecta', m.disconnection],
                ] as const
              )
                .filter(([, e]) => e)
                .map(([label, e]) => (
                  <span key={label}>
                    <span className="dim">{label}</span>{' '}
                    <span className="light">
                      {e!.count}/{e!.total}
                    </span>{' '}
                    <span className="dim">· {Math.round(e!.lift)}×</span>
                  </span>
                ))}
              {m.also.length > 0 && (
                <small className="break">
                  também em {m.also.map((o) => o.complex).join(', ')}
                </small>
              )}
            </span>
            <span role="cell">
              {m.start_in_region == null ? (
                <span className="dim">Poucos dias sem fato</span>
              ) : (
                <span className={m.from_outside ? 'light' : undefined}>
                  {m.from_outside
                    ? 'Vem de fora'
                    : m.start_in_region >= 70
                      ? `Começa na ${regionName}`
                      : 'Misto'}
                </span>
              )}
              {m.start_in_region != null && (
                <small>
                  {m.start_in_region}% na {regionName}
                </small>
              )}
              {m.night != null && <small>{m.night}% à noite</small>}
            </span>
            <span role="cell" className="num-text">
              <span className="nowrap">
                {m.first_read
                  ? `${formatDayMonthYear(m.first_read)} – ${formatDayMonthYear(m.last_read)}`
                  : '—'}
              </span>
              <small>{formatNumber(m.days_read)} dias lidos</small>
            </span>
            <span role="cell">
              {group ? (
                <button
                  type="button"
                  className="territory-group"
                  onClick={() => onOpenGroup(group)}
                >
                  {group.label}
                </button>
              ) : m.group ? (
                <span className="territory-group">{m.group}</span>
              ) : (
                <span className="empty">—</span>
              )}
            </span>
          </div>
        )
      })}
      {!members.length && (
        <p className="list-empty">Nenhuma placa com estes filtros.</p>
      )}
    </div>
  )
}
