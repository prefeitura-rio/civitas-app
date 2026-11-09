import collectionPointIconAtlas from '@/assets/collection-point-icon-atlas.svg'
import type { CollectionPoint } from '@/models/entities'

export { collectionPointIconAtlas }

const ICON_SIZE = 48
type IconActivity = 'active' | 'inactive'
type IconEmphasis = 'normal' | 'highlighted'
type IconKey = `${IconActivity}-${IconEmphasis}`

/** Uses only the first (orange) atlas row; the other rows are unused legacy colors. */
export const COLLECTION_POINT_ICON_MAPPING = {
  'active-normal': {
    x: 0,
    y: 0,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'active-highlighted': {
    x: ICON_SIZE,
    y: 0,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'inactive-normal': {
    x: ICON_SIZE * 2,
    y: 0,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
  'inactive-highlighted': {
    x: ICON_SIZE * 3,
    y: 0,
    width: ICON_SIZE,
    height: ICON_SIZE,
    mask: false,
  },
} as const satisfies Record<
  IconKey,
  { x: number; y: number; width: number; height: number; mask: boolean }
>

/**
 * Selects the atlas variant for recent activity and highlight.
 * All companies share one color; origin is shown by the layer filter and cards.
 */
export function getCollectionPointIcon(
  point: Pick<CollectionPoint, 'activeInLast24Hours'>,
  highlighted = false,
): IconKey {
  const state = point.activeInLast24Hours ? 'active' : 'inactive'
  const focus = highlighted ? 'highlighted' : 'normal'

  return `${state}-${focus}`
}
