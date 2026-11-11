import { PlateMarks } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import {
  formatNumber,
  formatPercent,
} from '@/modules/vehicle-intelligence/lib/format'
import { titleCaseText } from '@/modules/vehicle-intelligence/lib/labels'
import type { GroupMember } from '@/modules/vehicle-intelligence/types/groups'

/** Os membros: papel, veículo (PRF) e os números do ranking Dias de circulação; a placa abre o perfil dela. */
export function MembersTable({
  members,
  colors,
  onOpenPlate,
}: {
  members: GroupMember[]
  colors: Record<string, string>
  onOpenPlate: (plate: string) => void
}) {
  const isInCerco = useIsInCerco()
  return (
    <div
      className="group-table group-table-members"
      role="table"
      aria-label="Membros"
    >
      <div className="group-table-head top" role="row">
        {[
          'Placa',
          'Papel',
          'Veículo (PRF)',
          'Ocorrências',
          'Cobertura',
          'Dias ativos',
          'Máx. no dia',
        ].map((title, i) => (
          <span
            key={title}
            role="columnheader"
            className={i >= 3 ? 'num' : undefined}
          >
            {title}
          </span>
        ))}
      </div>
      {members.map((m) => {
        const cerco = isInCerco(m.plate)
        return (
          <div key={m.plate} role="row" className="group-table-row">
            <span role="cell" className="group-member-plate">
              <i style={{ background: colors[m.plate] }} aria-hidden="true" />
              <button
                type="button"
                className="group-plate underlined"
                onClick={() => onOpenPlate(m.plate)}
              >
                {m.plate}
              </button>
              {(cerco || m.cited) && (
                <PlateMarks
                  cerco={cerco}
                  cited={m.cited}
                  cercoLabel="No Cerco"
                  cercoRing
                />
              )}
            </span>
            <span role="cell">
              {m.seed ? 'Semente' : 'Parceira'}
              <small>
                {m.seed ? `${m.coverage_rank}ª no ranking` : 'ligada a semente'}
              </small>
            </span>
            <span role="cell">
              {m.vehicle_model ??
                (m.vehicle_type
                  ? titleCaseText(m.vehicle_type)
                  : 'sem cadastro PRF')}
              <small>
                {[
                  m.vehicle_color?.toLocaleLowerCase('pt-BR'),
                  m.manufacture_year && m.model_year
                    ? `${m.manufacture_year}/${m.model_year}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </small>
            </span>
            <span role="cell" className="num light">
              {formatNumber(m.linked_events)}
            </span>
            <span role="cell" className="num">
              {m.coverage != null ? formatPercent(m.coverage, 3) : '—'}
            </span>
            <span role="cell" className="num">
              {formatNumber(m.circulation_days)}
            </span>
            <span role="cell" className="num">
              {formatNumber(m.max_same_day_correlations)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
