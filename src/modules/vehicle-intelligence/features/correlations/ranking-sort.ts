import { RANKING } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants'
import type {
  CorrelationRankingSort,
  CorrelationRankingSortTerm,
} from '@/modules/vehicle-intelligence/types/domain'

/**
 * A ordenação depois de um clique na coluna `key`: inverte a direção de uma coluna já usada ou começa pela direção
 * padrão dela (crescente para tempos e distâncias). Com `additive` (Shift), soma a coluna às anteriores.
 */
export function nextSortTerms(
  current: CorrelationRankingSortTerm[],
  key: CorrelationRankingSort,
  additive: boolean,
): CorrelationRankingSortTerm[] {
  const position = current.findIndex((term) => term.key === key)
  const term: CorrelationRankingSortTerm = {
    key,
    direction:
      position >= 0
        ? current[position].direction === 'desc'
          ? 'asc'
          : 'desc'
        : RANKING.ascending.includes(key)
          ? 'asc'
          : 'desc',
  }
  if (!additive) return [term]
  return position < 0
    ? [...current, term]
    : current.map((item, index) => (index === position ? term : item))
}
