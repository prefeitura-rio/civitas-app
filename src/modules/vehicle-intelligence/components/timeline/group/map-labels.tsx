import { divIcon } from 'leaflet'
import { useState } from 'react'
import { Marker, useMapEvents } from 'react-leaflet'

import type {
  MapLabel,
  Obstacle,
} from '@/modules/vehicle-intelligence/components/timeline/group/map-label-items'
import { measureText } from '@/modules/vehicle-intelligence/components/timeline/group/text-width'

const collides = (taken: number[][], box: number[]) =>
  taken.some(
    ([x1, y1, x2, y2]) =>
      box[0] < x2 && box[2] > x1 && box[1] < y2 && box[3] > y1,
  )

/** Rótulos fixos: fato, junta no fato, junta, desconexão e partida, nessa ordem; à direita, à esquerda, acima ou abaixo do símbolo. */
export function MapLabels({
  labels,
  obstacles,
}: {
  labels: MapLabel[]
  obstacles: Obstacle[]
}) {
  const [, setVersion] = useState(0)
  const map = useMapEvents({
    zoomend: () => setVersion((v) => v + 1),
    moveend: () => setVersion((v) => v + 1),
  })
  const size = map.getSize()
  const taken = obstacles.map((o) => {
    const p = map.latLngToContainerPoint([o.lat, o.lng])
    return [p.x + o.box[0], p.y + o.box[1], p.x + o.box[2], p.y + o.box[3]]
  })
  const placed: Array<{ key: string; lat: number; lng: number; html: string }> =
    []
  for (const r of [...labels].sort((a, b) => a.priority - b.priority)) {
    const w =
      measureText(r.text) +
      18 +
      (r.color ? 13 : 0) +
      (r.colors ? r.colors.length * 9 + 4 : 0)
    const h = 22
    const p = map.latLngToContainerPoint([r.lat, r.lng])
    const cy = p.y + (r.dy ?? 0)
    const position = [
      [r.r + 5, cy - h / 2],
      [-r.r - 5 - w, cy - h / 2],
      [-w / 2, cy - r.r - 6 - h + (r.dy ? -8 : 0)],
      [-w / 2, p.y + r.r + 6],
    ]
      .map(([dx, y]) => [p.x + dx, y])
      .find(
        ([x, y]) =>
          x > 4 &&
          x + w < size.x - 4 &&
          y > 4 &&
          y + h < size.y - 20 &&
          !collides(taken, [x - 2, y - 2, x + w + 2, y + h + 2]),
      )
    if (!position) continue
    taken.push([position[0], position[1], position[0] + w, position[1] + h])
    const dots = r.color
      ? `<i style="width:8px;height:8px;border-radius:50%;background:${r.color};flex:none"></i>`
      : r.colors
        ? `<span style="display:inline-flex;gap:2px">${r.colors.map((c) => `<i style="width:7px;height:7px;border-radius:50%;background:${c}"></i>`).join('')}</span>`
        : ''
    const labelStyle = r.dark
      ? 'color:#fff;background:#1d2328;box-shadow:0 1px 4px rgba(0,0,0,.3)'
      : 'color:#1d262c;background:rgba(255,255,255,.95);box-shadow:0 0 0 1px rgba(20,30,35,.14),0 1px 3px rgba(20,30,35,.2)'
    placed.push({
      key: `${r.lat},${r.lng},${r.text}`,
      lat: r.lat,
      lng: r.lng,
      html: `<span style="position:absolute;left:${position[0] - p.x}px;top:${position[1] - p.y}px;height:${h}px;box-sizing:border-box;display:inline-flex;align-items:center;gap:5px;padding:0 8px;white-space:nowrap;border-radius:6px;font:600 11.5px/1 Inter,system-ui,sans-serif;${labelStyle}">${dots}${r.html}</span>`,
    })
  }
  return (
    <>
      {placed.map((label) => (
        <Marker
          key={label.key}
          pane="gtRotulos"
          position={[label.lat, label.lng]}
          interactive={false}
          keyboard={false}
          icon={divIcon({
            className: 'gt-icon',
            iconSize: [0, 0],
            html: label.html,
          })}
        />
      ))}
    </>
  )
}
