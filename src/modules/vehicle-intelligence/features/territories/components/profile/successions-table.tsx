import { formatSimilarity } from '@/modules/vehicle-intelligence/components/groups/group-text'
import {
  PlateButton,
  PlateTags,
} from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { rankingNote } from '@/modules/vehicle-intelligence/features/territories/components/profile/base-plates'
import type { TerritoryMember } from '@/modules/vehicle-intelligence/features/territories/types'
import { SWAP_ITEM } from '@/modules/vehicle-intelligence/features/territories/vocabulary'
import { formatDayMonthYear } from '@/modules/vehicle-intelligence/lib/dates'
import type { Succession } from '@/modules/vehicle-intelligence/types/groups'

/** As possíveis trocas: quem parou, quem começou, o intervalo e a semelhança de rotina. */
export function SuccessionsTable({
  successions,
  membersByPlate,
  onOpenPlate,
}: {
  successions: Succession[]
  membersByPlate: Map<string, TerritoryMember>
  onOpenPlate: (plate: string) => void
}) {
  return (
    <div
      className="list territory-list-switches"
      role="table"
      aria-label={`Possíveis trocas de ${SWAP_ITEM}`}
    >
      <div className="list-head" role="row">
        <span role="columnheader">Parou de ser lida</span>
        <span role="columnheader">Começou a ser lida</span>
        <span role="columnheader" className="num">
          Intervalo
        </span>
        <span role="columnheader" className="num">
          Rotina
        </span>
      </div>
      {successions.map((t, i) => (
        <div
          key={`${t.from}-${t.to}`}
          role="row"
          className={`list-row${i % 2 ? ' pair' : ''}`}
        >
          {(
            [
              [t.from, `última leitura ${formatDayMonthYear(t.last_read)}`],
              [t.to, `primeira leitura ${formatDayMonthYear(t.first_read)}`],
            ] as const
          ).map(([plate, text]) => (
            <span key={plate} role="cell">
              <span className="list-plate-tags">
                <PlateButton plate={plate} onOpen={onOpenPlate} />
                <PlateTags
                  plate={plate}
                  cited={Boolean(membersByPlate.get(plate)?.cited)}
                />
              </span>
              <small>
                {[text, rankingNote(membersByPlate.get(plate))]
                  .filter(Boolean)
                  .join(' · ')}
              </small>
            </span>
          ))}
          <span role="cell" className="num">
            {t.gap_days < 0 ? `${-t.gap_days} d antes` : `${t.gap_days} d`}
          </span>
          <span role="cell" className={`num${t.similar ? ' light' : ' dim'}`}>
            {t.routine_similarity == null
              ? '—'
              : formatSimilarity(t.routine_similarity)}
          </span>
        </div>
      ))}
    </div>
  )
}
