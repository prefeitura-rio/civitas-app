/** Vocabulário do recorte nas telas de territórios: motos em transeuntes, placas em veículos e carga (`config/recortes.ts`). */
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'

export const { item: ITEM, items: ITEMS, swapItem: SWAP_ITEM } = recorte.groups
/** "Motos", "Placas": o plural com maiúscula, para títulos. */
export const ITEMS_TITLE = ITEMS[0].toUpperCase() + ITEMS.slice(1)
