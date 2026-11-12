import type { CirclePoint } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-map'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

/** Escala verde → vermelho por volume de detecções no ponto.
 *
 * Mesma linguagem que o cluster já usa ao agregar: a cor carrega a
 * intensidade e o número dá o valor exato. Ao passar do cluster para o
 * ícone do equipamento, a leitura continua sendo a mesma — só muda a
 * unidade contada. O marcador não muda de tamanho.
 */
const RADAR_TIERS = [
  { key: 'low', color: '#35c26a', label: 'Baixo' },
  { key: 'medium', color: '#e8c33c', label: 'Médio' },
  { key: 'high', color: '#ef8b3a', label: 'Alto' },
  { key: 'critical', color: '#e04b3f', label: 'Concentração' },
] as const

export type MagnitudeScale = {
  thresholds: [number, number, number]
  max: number
}

/** Quartis das detecções por ponto da própria placa.
 *
 * Escalar por fração do máximo não serve: a distribuição tem cauda longa e um
 * único radar dominante empurra quase tudo para a faixa mais baixa. Numa placa
 * com máximo de 96 leituras, o corte por fração do máximo deixava 108 dos 110
 * pontos em verde; por quartis a leitura se distribui.
 */
export function magnitudeScale(points: CirclePoint[]): MagnitudeScale {
  const sorted = points.map((point) => point.detections).sort((a, b) => a - b)
  if (!sorted.length) return { thresholds: [0, 0, 0], max: 0 }
  const at = (fraction: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))]
  return {
    thresholds: [at(0.25), at(0.5), at(0.75)],
    max: sorted[sorted.length - 1],
  }
}

/** A faixa (0 a 3) de um ponto: acima de cada quartil sobe uma. */
function radarTier(count: number, scale: MagnitudeScale): number {
  const [first, second, third] = scale.thresholds
  if (count > third) return 3
  if (count > second) return 2
  if (count > first) return 1
  return 0
}

/** A cor da faixa como variável CSS do marcador (`--tone`). */
export function tierStyle(count: number, scale: MagnitudeScale): string {
  return `--tone:${RADAR_TIERS[radarTier(count, scale)].color}`
}

/** Faixas com os limites reais da placa; bandas vazias por empate são omitidas. */
export function magnitudeBands(
  scale: MagnitudeScale,
): Array<{ color: string; label: string }> {
  const bands: Array<{ color: string; label: string }> = []
  let lower = 1
  scale.thresholds.forEach((upper, index) => {
    if (upper < lower) return
    bands.push({
      color: RADAR_TIERS[index].color,
      label:
        upper === lower
          ? formatNumber(upper)
          : `${formatNumber(lower)}–${formatNumber(upper)}`,
    })
    lower = upper + 1
  })
  bands.push({ color: RADAR_TIERS[3].color, label: `${formatNumber(lower)}+` })
  return bands
}
