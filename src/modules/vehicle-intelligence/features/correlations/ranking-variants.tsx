/**
 * O ranking de placas correlatas em cada estratégia: abas, ordenações, colunas, base do cálculo e CSV. O que muda por
 * recorte fica em ranking-variants/entorno.tsx e copassagem.tsx; as colunas comuns, em common-columns.tsx.
 */
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import { copassagemVariant } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants/copassagem'
import { entornoVariant } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants/entorno'
import type { RankingVariant } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants/types'

export type {
  ColumnKit,
  ExportColumn,
  RankingVariant,
} from '@/modules/vehicle-intelligence/features/correlations/ranking-variants/types'

export const RANKING: RankingVariant = copassagem
  ? copassagemVariant
  : entornoVariant
