import { ArrowDown, ArrowUp, ArrowUpDown, CircleHelp } from 'lucide-react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/modules/vehicle-intelligence/components/ui/tooltip'
import type { Column } from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'
import type {
  CorrelationRankingSort,
  CorrelationRankingSortTerm,
} from '@/modules/vehicle-intelligence/types/domain'

export function ariaSort(
  column: Column,
  sortTerms: CorrelationRankingSortTerm[],
): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortKey) return undefined
  const active = sortTerms.find((term) => term.key === column.sortKey)
  return !active
    ? 'none'
    : active.direction === 'desc'
      ? 'descending'
      : 'ascending'
}

export function ColumnHeader({
  column,
  sortTerms,
  onSort,
  onSortIntent,
}: {
  column: Column
  sortTerms: CorrelationRankingSortTerm[]
  onSort: (key: CorrelationRankingSort, additive: boolean) => void
  onSortIntent: (key: CorrelationRankingSort, additive: boolean) => void
}) {
  const position = column.sortKey
    ? sortTerms.findIndex((term) => term.key === column.sortKey)
    : -1
  const active = position >= 0 ? sortTerms[position] : null
  const sortLabel = column.sortKey
    ? active
      ? `Ordenar ${column.label} em ordem ${active.direction === 'desc' ? 'crescente' : 'decrescente'}. Shift e clique acrescenta esta coluna à ordenação.`
      : `Ordenar por ${column.label}. Shift e clique acrescenta esta coluna à ordenação.`
    : undefined
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={
            column.sortKey
              ? `column-help sortable${active ? ' active' : ''}`
              : 'column-help'
          }
          aria-label={sortLabel}
          onClick={
            column.sortKey
              ? (event) => onSort(column.sortKey!, event.shiftKey)
              : undefined
          }
          onPointerEnter={
            column.sortKey
              ? (event) => onSortIntent(column.sortKey!, event.shiftKey)
              : undefined
          }
          onFocus={
            column.sortKey
              ? () => onSortIntent(column.sortKey!, false)
              : undefined
          }
        >
          <span>{column.label}</span>
          {column.sortKey ? (
            active ? (
              <>
                {active.direction === 'desc' ? (
                  <ArrowDown size={14} />
                ) : (
                  <ArrowUp size={14} />
                )}
                {sortTerms.length > 1 && (
                  <b className="sort-rank" aria-hidden="true">
                    {position + 1}
                  </b>
                )}
              </>
            ) : (
              <ArrowUpDown size={14} />
            )
          ) : (
            <CircleHelp size={13} aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{column.help}</TooltipContent>
    </Tooltip>
  )
}
