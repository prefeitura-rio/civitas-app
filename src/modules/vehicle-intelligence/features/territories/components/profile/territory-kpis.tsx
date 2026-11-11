import type {
  TerritoryMember,
  TerritoryProfileData,
} from '@/modules/vehicle-intelligence/features/territories/types'
import { ITEMS } from '@/modules/vehicle-intelligence/features/territories/vocabulary'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

/** O resumo do território: placas de base, em destaque, sem marca, conhecidas e as que vêm de fora da região. */
export function TerritoryKpis({
  data,
  members,
  highlightedCount,
  unmarkedCount,
  knownCount,
  regionName,
}: {
  data: TerritoryProfileData
  members: TerritoryMember[]
  highlightedCount: number
  unmarkedCount: number
  knownCount: number
  regionName: string
}) {
  const withProfile = members.filter((m) => m.from_outside != null)
  const fromOutside = withProfile.filter((m) => m.from_outside)
  return (
    <section className="groups-kpis profile territory-kpis" aria-label="Resumo">
      <div>
        <strong>{formatNumber(members.length)}</strong>
        <span>{ITEMS} de base</span>
      </div>
      <div>
        <strong>{formatNumber(highlightedCount)}</strong>
        <span>
          em destaque (top {data.parameters?.highlight} das {ITEMS}{' '}
          {data.parameters?.ranking_minimum}+)
        </span>
      </div>
      <div>
        <strong>{formatNumber(unmarkedCount)}</strong>
        <span>em destaque sem citação nem Cerco</span>
      </div>
      <div>
        <strong>{formatNumber(knownCount)}</strong>
        <span>citadas ou no Cerco</span>
      </div>
      <div>
        <strong>
          {withProfile.length
            ? `${Math.round((100 * fromOutside.length) / withProfile.length)}%`
            : '—'}
        </strong>
        <span>
          vêm de fora da {regionName} ({fromOutside.length} de{' '}
          {withProfile.length})
        </span>
      </div>
    </section>
  )
}
