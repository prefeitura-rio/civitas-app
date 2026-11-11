import { factionAbbreviation } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import {
  formatDate,
  formatDayMonth,
  formatInBrasilia,
  MONTH_ABBREVIATIONS,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { GroupProfileData } from '@/modules/vehicle-intelligence/types/groups'

/** O resumo do perfil: placas e sementes, ROs, ligações fortes, o período dos fatos e o território principal. */
export function GroupSummary({ data }: { data: GroupProfileData }) {
  const events = data.events
  const strongLinks = data.edges.filter((e) => e.strong).length
  const seeds = data.members.filter((m) => m.seed).length
  const sharedEvents = events.filter((e) => e.plates.length >= 2).length
  const mainTerritory =
    data.territory?.departure[0] ?? data.territory?.disconnection[0]
  const first = events[0]?.occurred_at
  const last = events[events.length - 1]?.occurred_at
  const monthName = (value: string) =>
    MONTH_ABBREVIATIONS[
      Number(formatInBrasilia(value, { month: 'numeric' })) - 1
    ]
  const period =
    first && last
      ? monthName(first) === monthName(last) &&
        first.slice(0, 4) === last.slice(0, 4)
        ? monthName(first)
        : `${monthName(first)} – ${monthName(last)}`
      : '—'
  return (
    <section className="groups-kpis profile" aria-label="Resumo">
      <div>
        <strong>{data.members.length}</strong>
        <span>
          placas, {seeds} {seeds === 1 ? 'semente' : 'sementes'}
        </span>
      </div>
      <div>
        <strong>{formatNumber(events.length)}</strong>
        <span>ROs, {formatNumber(sharedEvents)} com 2+ placas</span>
      </div>
      <div>
        <strong>{strongLinks}</strong>
        <span>
          {strongLinks === 1 ? 'ligação forte' : 'ligações fortes'}, de{' '}
          {data.edges.length} {data.edges.length === 1 ? 'par' : 'pares'}
        </span>
      </div>
      <div>
        <strong>{period}</strong>
        <span>
          {first && last
            ? `${formatDayMonth(first)} a ${formatDate(last)}`
            : 'sem fatos'}
        </span>
      </div>
      <div>
        <strong>{mainTerritory ? mainTerritory.complex : '—'}</strong>
        <span>
          {mainTerritory
            ? `${factionAbbreviation(mainTerritory.faction) || 'facção não informada'} · ${Math.round(mainTerritory.lift)}× a taxa das outras ${recorte.groups.items}`
            : 'nenhum território acima do comum'}
        </span>
      </div>
    </section>
  )
}
