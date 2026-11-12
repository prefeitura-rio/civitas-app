/** Textos curtos da lista de grupos (cartão e tabela). */
import { factionAbbreviation } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type { TerritoryItem } from '@/modules/vehicle-intelligence/types/groups'

/** "Roubo 5 · Furto 2": os ROs do grupo por tipo do fato, do mais comum ao menos. */
export const modalitiesText = (modalities?: Record<string, number>) =>
  Object.entries(modalities ?? {})
    .map(([value, n]) => `${categoryLabel(value)} ${formatNumber(n)}`)
    .join(' · ')

/** "Rocinha (CV) 19×", para a tabela. */
export const shortTerritory = (items: TerritoryItem[]) =>
  items
    .map(
      (item) =>
        `${item.complex}${item.faction ? ` (${factionAbbreviation(item.faction)})` : ''} ${Math.round(item.lift)}×`,
    )
    .join(', ') || '—'
