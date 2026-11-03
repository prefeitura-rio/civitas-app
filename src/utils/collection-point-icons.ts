import collectionPointIconAtlas from '@/assets/collection-point-icon-atlas.svg'
import type { CollectionPoint } from '@/models/entities'

import { getCollectionPointOrigin } from './collection-point-origin'

export { collectionPointIconAtlas }

const ICON_SIZE = 48
export const COLLECTION_POINT_ICON_MAPPING = {
  'cetrio-active-normal': {
    x: 0,
    y: 0,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'cetrio-active-highlighted': {
    x: ICON_SIZE,
    y: 0,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'cetrio-inactive-normal': {
    x: ICON_SIZE * 2,
    y: 0,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'cetrio-inactive-highlighted': {
    x: ICON_SIZE * 3,
    y: 0,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'civitas-active-normal': {
    x: 0,
    y: ICON_SIZE,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'civitas-active-highlighted': {
    x: ICON_SIZE,
    y: ICON_SIZE,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'civitas-inactive-normal': {
    x: ICON_SIZE * 2,
    y: ICON_SIZE,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'civitas-inactive-highlighted': {
    x: ICON_SIZE * 3,
    y: ICON_SIZE,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'gabriel-active-normal': {
    x: 0,
    y: ICON_SIZE * 2,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'gabriel-active-highlighted': {
    x: ICON_SIZE,
    y: ICON_SIZE * 2,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'gabriel-inactive-normal': {
    x: ICON_SIZE * 2,
    y: ICON_SIZE * 2,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'gabriel-inactive-highlighted': {
    x: ICON_SIZE * 3,
    y: ICON_SIZE * 2,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
} as const

type IconKey = keyof typeof COLLECTION_POINT_ICON_MAPPING

/**
 * Selects the atlas variant for canonical origin, recent activity and highlight.
 * Known origin aliases share normalization with cluster counts; unknown origins
 * retain the existing CET-Rio icon fallback. Atlas colors are preserved.
 */
export function getCollectionPointIcon(
  point: Pick<CollectionPoint, 'company' | 'activeInLast24Hours'>,
  highlighted = false,
): IconKey {
  const company = getCollectionPointOrigin(point.company)
  const source =
    company === 'CIVITAS'
      ? 'civitas'
      : company === 'GABRIEL'
        ? 'gabriel'
        : 'cetrio'
  const state = point.activeInLast24Hours ? 'active' : 'inactive'
  const focus = highlighted ? 'highlighted' : 'normal'

  return `${source}-${state}-${focus}` as IconKey
}
