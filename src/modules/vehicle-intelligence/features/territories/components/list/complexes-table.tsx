import { ComplexName } from '@/modules/vehicle-intelligence/components/groups/complex-name'
import {
  type ComplexRow,
  percentOf,
} from '@/modules/vehicle-intelligence/features/territories/components/list/complex-rows'
import { PlateList } from '@/modules/vehicle-intelligence/features/territories/components/list/plate-list'
import {
  ITEMS,
  ITEMS_TITLE,
} from '@/modules/vehicle-intelligence/features/territories/vocabulary'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

/** A tabela dos complexos (top `highlight` das `rankingMinimum`+ em destaque); Enter ou clique abre o território. */
export function ComplexesTable({
  rows,
  highlight,
  rankingMinimum,
  regionName,
  onOpen,
}: {
  rows: ComplexRow[]
  highlight: number
  rankingMinimum: number
  regionName: string
  onOpen: (complex: string) => void
}) {
  return (
    <div
      className="group-table territory-table scroll"
      role="table"
      aria-label="Complexos"
    >
      <div className="group-table-head top" role="row">
        {[
          'Complexo',
          `${ITEMS_TITLE} de base`,
          `Em destaque (top ${highlight} das ${rankingMinimum}+)`,
          'Sem citação nem Cerco',
          'Citadas ou no Cerco',
          'Vêm de fora',
          `${ITEMS_TITLE} que partem · desconectam`,
        ].map((title, i) => (
          <span
            key={title}
            role="columnheader"
            className={[1, 2, 5, 6].includes(i) ? 'num' : undefined}
          >
            {title}
          </span>
        ))}
      </div>
      {rows.map((l) => (
        <div
          key={l.complex}
          role="row"
          tabIndex={0}
          className="group-table-row clickable"
          onClick={() => onOpen(l.complex)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpen(l.complex)
            }
          }}
        >
          <span role="cell" className="group-cell-complex">
            <ComplexName
              name={l.complex}
              faction={l.faction}
              showAbbreviation={false}
            />
            <small>
              {l.faction ?? 'facção não informada'} ·{' '}
              {l.in_region
                ? `na ${regionName}`
                : `fora (${l.region ?? 'fora do município'})`}
            </small>
          </span>
          <span role="cell" className="num">
            {formatNumber(l.plates)}
          </span>
          <span role="cell" className="num light">
            {formatNumber(l.highlighted.length)}
            <small>
              {percentOf(l.highlighted.length, l.plates)} das {ITEMS}
            </small>
          </span>
          <span role="cell">
            <PlateList plates={l.unmarked} otherBases={l.otherBases} />
          </span>
          <span role="cell">
            <PlateList plates={l.known} otherBases={l.otherBases} />
            {l.cited.length >
              l.known.filter((p) => l.cited.includes(p)).length && (
              <small>
                +
                {l.cited.length -
                  l.known.filter((p) => l.cited.includes(p)).length}{' '}
                citada fora do destaque
              </small>
            )}
          </span>
          <span role="cell" className="num">
            {percentOf(l.from_outside, l.with_profile)}
          </span>
          <span role="cell" className="num">
            {formatNumber(l.departure_plates)} ·{' '}
            {formatNumber(l.disconnection_plates)}
            {l.shared_plates > 0 && (
              <small>
                {formatNumber(l.shared_plates)} com base também em outro
              </small>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
