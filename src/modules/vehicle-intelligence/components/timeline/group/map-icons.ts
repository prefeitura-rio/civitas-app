/** Os ícones do mapa do grupo: o pino do fato e o disco da passagem junta (HTML do Leaflet). */
import { divIcon } from 'leaflet'

import {
  COLORS,
  conic,
} from '@/modules/vehicle-intelligence/components/timeline/group/style'
import { PIN_PATH } from '@/modules/vehicle-intelligence/components/timeline/palette'

export function pinIcon(active: boolean) {
  return divIcon({
    className: 'gt-icon',
    iconSize: [26, 33],
    iconAnchor: [13, 32],
    html: `<svg width="26" height="33" viewBox="0 0 32 40" aria-hidden="true"><path d="${PIN_PATH}" fill="${active ? COLORS.activeFact : COLORS.fact}" stroke="#fff" stroke-width="2.5"/><circle cx="16" cy="14" r="5.5" fill="#fff"/></svg>`,
  })
}

export function togetherIcon(
  colors: string[],
  inFact: boolean,
  active: boolean,
) {
  const ring = inFact
    ? `box-shadow:0 0 0 3px ${COLORS.passage},0 1px 4px rgba(0,0,0,.35)`
    : `outline:2px dashed ${COLORS.passage};outline-offset:2px;box-shadow:0 1px 4px rgba(0,0,0,.3)`
  return divIcon({
    className: 'gt-icon',
    iconSize: [0, 0],
    html: `<span style="position:absolute;left:-11px;top:-11px;width:22px;height:22px;box-sizing:border-box;border-radius:50%;background:${conic(colors)};border:2.5px solid #fff;${ring}${active ? ';transform:scale(1.2)' : ''}"></span>`,
  })
}
