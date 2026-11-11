/** As placas de base do complexo: filtros, ordens, a força da base e a nota do ranking. */
import type {
  BaseEvidence,
  TerritoryMember,
} from '@/modules/vehicle-intelligence/features/territories/types'

export type PlateFilter = 'priority' | 'unmarked' | 'all'
export type PlateSort = 'ranking' | 'base'
export const SORT_LABELS: Record<PlateSort, string> = {
  ranking: 'ranking Dias de circulação',
  base: 'força da base no complexo',
}

/** Força da base: a maior entre partida e desconexão de (ROs aqui / ROs da moto) × quantas vezes a taxa das outras. */
export const evidenceStrength = (e: BaseEvidence | null) =>
  e ? (e.count / e.total) * e.lift : -1
export const baseStrength = (m: TerritoryMember) =>
  Math.max(evidenceStrength(m.departure), evidenceStrength(m.disconnection))

/** "4ª no ranking · G1" (sem posição: `withoutRank`, ou nada). */
export const rankingNote = (
  m: TerritoryMember | undefined,
  withoutRank: string | null = null,
) =>
  [m?.rank ? `${m.rank}ª no ranking` : withoutRank, m?.group]
    .filter(Boolean)
    .join(' · ')
