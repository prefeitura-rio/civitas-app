import radarIconAtlas from '@/assets/radar-icon-atlas.png'
import type { CollectionPoint } from '@/models/entities'

export { radarIconAtlas }

export const RADAR_ICON_MAPPING = {
  default: { x: 0, y: 0, width: 48, height: 48, mask: false },
  highlighted: { x: 48, y: 0, width: 48, height: 48, mask: false },
  disabled: { x: 0, y: 48, width: 48, height: 48, mask: false },
  'disabled-highlighted': {
    x: 48,
    y: 48,
    width: 48,
    height: 48,
    mask: false,
  },
  'sentry-default': { x: 0, y: 96, width: 48, height: 48, mask: false },
  'sentry-highlighted': { x: 48, y: 96, width: 48, height: 48, mask: false },
  'sentry-disabled': { x: 0, y: 144, width: 48, height: 48, mask: false },
  'sentry-disabled-highlighted': {
    x: 48,
    y: 144,
    width: 48,
    height: 48,
    mask: false,
  },
  'gabriel-default': { x: 0, y: 192, width: 48, height: 48, mask: false },
  'gabriel-highlighted': { x: 48, y: 192, width: 48, height: 48, mask: false },
  'gabriel-disabled': { x: 0, y: 240, width: 48, height: 48, mask: false },
  'gabriel-disabled-highlighted': {
    x: 48,
    y: 240,
    width: 48,
    height: 48,
    mask: false,
  },
} as const

export function getCollectionPointIcon(
  point: Pick<CollectionPoint, 'company' | 'activeInLast24Hours'>,
  highlighted = false,
): keyof typeof RADAR_ICON_MAPPING {
  const company = point.company?.toUpperCase()
  const prefix =
    company === 'CIVITAS' ? 'sentry-' : company === 'GABRIEL' ? 'gabriel-' : ''
  const state = point.activeInLast24Hours
    ? highlighted
      ? 'highlighted'
      : 'default'
    : highlighted
      ? 'disabled-highlighted'
      : 'disabled'

  return `${prefix}${state}`
}
