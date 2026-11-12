/** Cores das ocorrências no perfil da placa (pinos, legendas e o mapa 3D das viagens). */

/** Vítima: em copassagem a placa também aparece como vítima. */
export const victimColor = '#0b74c4'
/** Correlata, ou o fato em cujo entorno a placa foi lida. */
export const candidateColor = '#c0334a'
// Âmbar "citada no RO" (handoff de 09/10), no cartão, na legenda e no pino do mapa.
export const citedColor = '#d9a55b'

type Rgba = [number, number, number, number]

/** A cor `#rrggbb` com opacidade, como o deck.gl pede: [r, g, b, a] de 0 a 255. */
export function hexToRgba(hex: string, alpha: number): Rgba {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
    alpha,
  ]
}

/** As mesmas cores no mapa 3D das viagens (deck.gl). */
export const victimRgba = hexToRgba(victimColor, 235)
export const candidateRgba = hexToRgba(candidateColor, 235)
