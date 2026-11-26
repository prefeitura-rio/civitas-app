import type { PickingInfo } from 'deck.gl'

import { POINT_LAYER_IDS } from '@/utils/point-layer-config'

const TOOLTIP_HORIZONTAL_MARGIN = 10
const TOOLTIP_VERTICAL_MARGIN = 10
const TOOLTIP_HORIZONTAL_OFFSET = 20
const TOOLTIP_VERTICAL_OFFSET = 20
const TOOLTIP_DEFAULT_WIDTH = 400
const TOOLTIP_DEFAULT_HEIGHT = 575

export function calculateTooltipAbsolutePosition(
  pickingInfo: PickingInfo,
  cardWidth: number | undefined,
  cardHeight: number | undefined,
  mapOffset: { left: number; top: number },
) {
  const width = cardWidth || TOOLTIP_DEFAULT_WIDTH
  const height = cardHeight || TOOLTIP_DEFAULT_HEIGHT

  // Se for um radar, posicionar no canto superior esquerdo (igual ao popup da câmera)
  if (pickingInfo.layer?.id === POINT_LAYER_IDS.radars) {
    return {
      top: 8 + mapOffset.top,
      left: 8 + mapOffset.left,
    }
  }

  const x = pickingInfo.x
  const y = pickingInfo.y
  const viewportWidth = pickingInfo.viewport!.width
  const viewportHeight = pickingInfo.viewport!.height

  let left: number | undefined
  let top: number | undefined

  if (x < viewportWidth / 2) {
    left = x + TOOLTIP_HORIZONTAL_OFFSET
  } else {
    left = x - width - TOOLTIP_HORIZONTAL_OFFSET
  }

  if (y < viewportHeight / 2) {
    top = y - TOOLTIP_VERTICAL_OFFSET
  } else {
    top = y - height - TOOLTIP_VERTICAL_OFFSET
  }

  if (left < TOOLTIP_HORIZONTAL_MARGIN) {
    left = TOOLTIP_HORIZONTAL_MARGIN
  }
  if (left + width + TOOLTIP_HORIZONTAL_MARGIN > viewportWidth) {
    left = viewportWidth - width - TOOLTIP_HORIZONTAL_MARGIN
  }
  if (top < 50) {
    top = TOOLTIP_VERTICAL_MARGIN + 50
  }
  if (top + height + TOOLTIP_VERTICAL_MARGIN > viewportHeight) {
    top = viewportHeight - height - TOOLTIP_VERTICAL_MARGIN
  }

  return {
    top: top + mapOffset.top,
    left: left + mapOffset.left,
  }
}
