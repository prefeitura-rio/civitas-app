import { divIcon } from 'leaflet'

import type { CirclePoint } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-map'
import {
  type MagnitudeScale,
  tierStyle,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/radar-scale'
import {
  escapeHtml,
  formatNumber,
} from '@/modules/vehicle-intelligence/lib/format'

export function radarIcon(
  point: CirclePoint,
  rank: number,
  scale: MagnitudeScale,
) {
  // O distintivo passa a mostrar as detecções, não a posição no ranking: era
  // o número de ranking que dava a falsa impressão de quantidade. A posição
  // continua no popup e na tabela.
  return divIcon({
    className: 'profile-radar-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -14],
    html: `<div class="profile-radar-marker" style="${tierStyle(point.detections, scale)}" title="#${rank} ${escapeHtml(point.label)} · ${formatNumber(point.detections)} detecções"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 6.5 10 4.8h4l1.5 1.7H18a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h2.5Z"/><circle cx="12" cy="12.4" r="3.2"/></svg><span>${formatNumber(point.detections)}</span></div>`,
  })
}

/** Círculo padrão do MarkerCluster, com a faixa relativa à placa.
 *
 * O `_defaultIconCreateFunction` do Leaflet.markercluster usa cortes absolutos
 * (`<10` verde, `<100` amarelo, `>=100` laranja). Numa placa com ~110 pontos
 * quase todo cluster cairia em "small" e a cor não diria nada. Mantemos o
 * mesmo markup e as mesmas classes — logo, o mesmo círculo do MarkerCluster.Default.css
 * — e trocamos só o critério: participação no total da própria placa.
 *
 * O balão soma as DETECÇÕES dos marcadores agrupados, não a quantidade de
 * marcadores. `getChildCount()` daria pontos de coleta, que não é a grandeza
 * que interessa; cada marcador carrega seu total em `options.detections`.
 */
export function makeRadarClusterIcon(totalDetections: number) {
  return (cluster: {
    getAllChildMarkers: () => Array<{ options: { detections?: number } }>
  }) => {
    const detections = cluster
      .getAllChildMarkers()
      .reduce((sum, marker) => sum + (marker.options.detections ?? 0), 0)
    const share = totalDetections > 0 ? detections / totalDetections : 0
    const tier = share >= 0.25 ? 'large' : share >= 0.1 ? 'medium' : 'small'
    // O círculo padrão tem 30px internos: 5 dígitos não cabem. Abrevia no
    // balão e mantém o valor exato no tooltip.
    const label =
      detections >= 1000
        ? `${(detections / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
        : formatNumber(detections)
    return divIcon({
      className: `marker-cluster marker-cluster-${tier}`,
      iconSize: [40, 40],
      html: `<div title="${formatNumber(detections)} detecções"><span>${label}</span></div>`,
    })
  }
}
