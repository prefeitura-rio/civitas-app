import { divIcon } from 'leaflet'

import {
  POINT_KINDS,
  type Pole,
} from '@/modules/vehicle-intelligence/components/groups/pole-map/poles'

/** O marcador do polo: tamanho pelas leituras, forma e cor do tipo; o selecionado com anel, os outros apagados. */
export function poleIcon(pole: Pole, selected: boolean, dimmed: boolean) {
  const color = POINT_KINDS[pole.kind].mapColor
  const d = Math.min(18 + Math.sqrt(pole.count) * 7, 46)
  const side = pole.kind === 'passage' ? d * 0.86 : d
  const shape =
    pole.kind === 'departure'
      ? `background:${color};border:2px solid #fff;color:#fff;border-radius:50%;`
      : pole.kind === 'disconnection'
        ? `background:#fff;border:4px solid ${color};color:${color};border-radius:50%;`
        : `background:${color};border:2px solid #fff;color:#fff;border-radius:6px;`
  const ring = selected
    ? 'box-shadow:0 0 0 3px #fff,0 0 0 5px #1d2328;'
    : 'box-shadow:0 1px 4px rgba(0,0,0,.35);'
  return divIcon({
    className: 'group-pole-icon',
    iconSize: [side, side],
    iconAnchor: [side / 2, side / 2],
    html: `<div class="group-pole" style="width:${side}px;height:${side}px;${shape}${ring}opacity:${dimmed ? 0.28 : 1};font-size:${d > 30 ? 13 : 11}px">${pole.count}</div>`,
  })
}
