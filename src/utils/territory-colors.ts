import type { Color } from '@deck.gl/core'

const AISP_COLORS: Partial<Record<number, Color>> = {
  27: [173, 216, 230, 200],
  40: [152, 251, 152, 200],
  31: [255, 250, 150, 200],
  14: [255, 165, 90, 200],
  18: [230, 230, 250, 200],
  41: [255, 209, 220, 200],
  9: [211, 211, 211, 200],
  3: [240, 230, 190, 200],
  6: [64, 224, 208, 200],
  16: [255, 200, 150, 200],
  17: [95, 158, 160, 200],
  22: [144, 238, 144, 200],
  4: [216, 191, 216, 200],
  5: [255, 215, 100, 200],
  2: [240, 128, 128, 200],
  19: [175, 238, 238, 200],
  23: [255, 240, 210, 200],
  1: [176, 196, 222, 200],
  7: [150, 190, 210, 200],
}
const UNKNOWN_AISP_COLOR: Color = [47, 47, 47, 200]

/** Returns the shared RGBA color for an AISP identifier, or the default for unknown identifiers. */
export function getAispColor(aisp: number): Color {
  return AISP_COLORS[aisp] ?? UNKNOWN_AISP_COLOR
}
