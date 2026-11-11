import { ArrowDown, ArrowUp } from 'lucide-react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { Label } from '@/modules/vehicle-intelligence/components/ui/label'
import { RANKING } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants'
import type {
  CorrelationRankingSort,
  CorrelationRankingSortTerm,
} from '@/modules/vehicle-intelligence/types/domain'

/** A ordenação aplicada: uma etiqueta por coluna (clique inverte a direção) e "Manter só a primeira". */
export function RankingSortSummary({
  sortTerms,
  onSort,
  onKeepFirst,
}: {
  sortTerms: CorrelationRankingSortTerm[]
  onSort: (key: CorrelationRankingSort, additive: boolean) => void
  onKeepFirst: () => void
}) {
  return (
    <div className="ranking-sort">
      <Label htmlFor="ranking-sort-summary">Ordenação aplicada</Label>
      <div id="ranking-sort-summary" className="ranking-sort-terms">
        {sortTerms.map((term, index) => (
          <button
            key={term.key}
            type="button"
            className="ranking-sort-chip"
            onClick={() => onSort(term.key, sortTerms.length > 1)}
            title={`${RANKING.sortLabels[term.key] ?? term.key} — clique para inverter a direção`}
          >
            {sortTerms.length > 1 && <b>{index + 1}</b>}
            <span>{RANKING.sortLabels[term.key] ?? term.key}</span>
            {term.direction === 'desc' ? (
              <ArrowDown size={13} />
            ) : (
              <ArrowUp size={13} />
            )}
          </button>
        ))}
        {sortTerms.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onKeepFirst}
          >
            Manter só a primeira
          </Button>
        )}
      </div>
    </div>
  )
}
