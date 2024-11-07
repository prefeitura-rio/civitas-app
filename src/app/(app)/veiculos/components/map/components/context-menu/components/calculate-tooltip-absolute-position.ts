import type { PickingInfo } from 'deck.gl'

const TOOLTIP_HORIZONTAL_MARGIN = 10 // Margin from the cursor
const TOOLTIP_VERTICAL_MARGIN = 10 // Margin from the cursor
const TOOLTIP_HORIZONTAL_OFFSET = 20 // Offset from the cursor
const TOOLTIP_VERTICAL_OFFSET = 20 // Offset from the cursor
const TOOLTIP_DEFAULT_WIDTH = 400 // Assuming a fixed width for the tooltip
const TOOLTIP_DEFAULT_HEIGHT = 575 // Approximate height of the tooltip, adjust as needed
const SIDEBAR_WIDTH = 56 // Approximate height of the tooltip, adjust as needed

export function calculateTooltipAbsolutePosition(
  pickingInfo: PickingInfo,
  cardWidth: number | undefined,
  cardHeight: number | undefined,
) {
  const width = cardWidth || TOOLTIP_DEFAULT_WIDTH
  const height = cardHeight || TOOLTIP_DEFAULT_HEIGHT

  const x = pickingInfo.x
  const y = pickingInfo.y
  const viewportWidth = pickingInfo.viewport!.width
  const viewportHeight = pickingInfo.viewport!.height

  let left: number | undefined
  let top: number | undefined

  // Determine horizontal position
  if (x < viewportWidth / 2) {
    // Cursor is on the left half of the screen
    left = x + TOOLTIP_HORIZONTAL_OFFSET + SIDEBAR_WIDTH
  } else {
    // Cursor is on the right half of the screen
    left = x - width - TOOLTIP_HORIZONTAL_OFFSET + SIDEBAR_WIDTH
  }

  // Determine vertical position
  if (y < viewportHeight / 2) {
    // Cursor is on the top half of the screen
    top = y - TOOLTIP_VERTICAL_OFFSET
  } else {
    // Cursor is on the bottom half of the screen
    top = y - height - TOOLTIP_VERTICAL_OFFSET
  }

  // Adjust for edge cases
  if (left < SIDEBAR_WIDTH + TOOLTIP_HORIZONTAL_MARGIN) {
    left = SIDEBAR_WIDTH + TOOLTIP_HORIZONTAL_MARGIN
  }
  if (
    left + width + TOOLTIP_HORIZONTAL_MARGIN >
    viewportWidth + SIDEBAR_WIDTH
  ) {
    left = viewportWidth + SIDEBAR_WIDTH - width - TOOLTIP_HORIZONTAL_MARGIN
  }
  if (top < 50) {
    top = TOOLTIP_VERTICAL_MARGIN + 50
  }
  if (top + height + TOOLTIP_VERTICAL_MARGIN > viewportHeight) {
    top = viewportHeight - height - TOOLTIP_VERTICAL_MARGIN
  }

  return {
    top,
    left,
  }
}
