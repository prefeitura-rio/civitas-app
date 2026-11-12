import { divIcon } from 'leaflet'

import type { ComplexRow } from '@/modules/vehicle-intelligence/features/territories/components/list/complex-rows'

/** O marcador do complexo: tamanho e número pelas placas em destaque; cinza na região do recorte, ciano fora. */
export function complexIcon(row: ComplexRow, focused: boolean) {
  const d = Math.min(16 + Math.sqrt(row.highlighted.length) * 6, 44)
  const color = row.in_region ? '#82979d' : '#0f8fa3'
  return divIcon({
    className: 'territory-icon',
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2],
    html: `<div class="territory-marker" style="width:${d}px;height:${d}px;background:${color};font-size:${d > 28 ? 12 : 10.5}px;${
      focused
        ? 'box-shadow:0 0 0 3px #fff,0 0 0 5px #1d2328'
        : 'box-shadow:0 1px 4px rgba(0,0,0,.35)'
    }">${row.highlighted.length}</div>`,
  })
}
