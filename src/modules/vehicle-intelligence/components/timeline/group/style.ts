/** Cores dos símbolos da timeline do grupo, as alturas das faixas e o disco com as cores das placas. */

export const COLORS = {
  departure: '#3987e5',
  passage: '#e0702f',
  disconnection: '#d14d96',
  fact: '#6f8189',
  activeFact: '#141b20',
  ring: '#0aa5c8',
  cursor: '#20d6ff',
}
export const AXIS_HEIGHT = 22
export const FACTS_LANE_HEIGHT = 30
export const LANE_HEIGHT = 34
export const conic = (colors: string[]) =>
  colors.length === 1
    ? colors[0]
    : `conic-gradient(${colors.map((color, i) => `${color} ${(i * 100) / colors.length}% ${((i + 1) * 100) / colors.length}%`).join(',')})`
