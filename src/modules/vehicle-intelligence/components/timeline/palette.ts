/** Cores da timeline (âncoras, correlatas e fatos do grupo), o clareamento das leituras fora da janela e o pino do fato. */

export const anchorPalettes = [
  { color: '#075ea8', softColor: '#73aee8' },
  { color: '#0f817b', softColor: '#65d1c7' },
  { color: '#6957c8', softColor: '#aa9df2' },
  { color: '#b86116', softColor: '#f1a45f' },
  { color: '#2f7d4c', softColor: '#83cf9d' },
]
/** Grupo: os fatos ficam neutros, porque as cores são das placas (as mesmas do perfil do grupo). */
export const groupFactPalette = { color: '#6f8189', softColor: '#a9b6bc' }
export const suspectLight = '#c6495c'
export const suspectDark = '#c92f48'
export const suspectTrailPalettes = {
  suspect_1: {
    color: suspectDark,
    softColor: suspectLight,
    label: 'Correlata · trilha 1',
  },
  suspect_2: {
    color: '#a83b58',
    softColor: '#a65b70',
    label: 'Correlata · trilha 2',
  },
} as const
export const unassignedSuspectPalette = {
  color: '#6f7680',
  softColor: '#6f7680',
}
/** A cor da placa misturada com branco: leituras fora da janela do fato. */
export function lighten(color: string, fraction = 0.45) {
  const value = parseInt(color.slice(1), 16)
  return `#${[16, 8, 0]
    .map((shift) => {
      const channel = (value >> shift) & 255
      return Math.round(channel + (255 - channel) * fraction)
        .toString(16)
        .padStart(2, '0')
    })
    .join('')}`
}
/** O contorno do pino do fato (viewBox 0 0 32 40), no mapa, na legenda e nas listas. */
export const PIN_PATH =
  'M16 1.5C8.55 1.5 2.5 7.3 2.5 14.45c0 9.02 8.4 15.3 13.5 23.3 5.1-8 13.5-14.28 13.5-23.3C29.5 7.3 23.45 1.5 16 1.5Z'
