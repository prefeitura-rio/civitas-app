/**
 * Territórios dominados no mapa, iguais nos três recortes (pedido de 10/10).
 *
 * A camada vem uma vez por página de `/api/camadas/territorios` (polígono, nome, facção e um
 * ponto de rótulo dentro do polígono). Polígonos e nomes ficam abaixo dos polos e das conexões
 * (panes 350 e 390). Até o zoom de comunidade, um nome por complexo; depois, um por comunidade.
 * O nome vai sobre uma placa branca, com a facção num quadrado colorido, e desvia dos polos
 * (handoff "nomes de território", 11/10).
 */
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson'
import {
  divIcon,
  type LatLngBounds,
  type LatLngTuple,
  type PathOptions,
} from 'leaflet'
import { useMemo, useState } from 'react'
import { GeoJSON, Marker, Pane, useMapEvents } from 'react-leaflet'

import { request } from '@/modules/vehicle-intelligence/lib/api'
import { escapeHtml } from '@/modules/vehicle-intelligence/lib/format'
import { createLazyStore } from '@/modules/vehicle-intelligence/lib/store'

type TerritoryProperties = {
  nome: string | null
  grupo: string | null
  rotulo: [number, number]
  area_km2: number
}
type TerritoryCollection = FeatureCollection<Geometry, TerritoryProperties>
/** Polo desenhado no mapa: o nome não pode cobri-lo. `radius` em px, o mesmo do marcador. */
export type MapObstacle = { lat: number; lng: number; radius: number }

export const FACTION_COLORS: Record<string, string> = {
  'Comando Vermelho': '#ef3340',
  'Terceiro Comando Puro': '#16a34a',
  'Amigos dos Amigos': '#facc15',
  'Liga da Justiça': '#2563eb',
  Milícia: '#2563eb',
  'Milícia de Nova Iguaçu': '#2563eb',
  Neutra: '#8b8f98',
}
const FACTION_ABBREVIATIONS: Record<string, string> = {
  'Comando Vermelho': 'CV',
  'Terceiro Comando Puro': 'TCP',
  'Amigos dos Amigos': 'ADA',
  'Liga da Justiça': 'LJ',
  Milícia: 'Milícia',
  'Milícia de Nova Iguaçu': 'Milícia NI',
  Neutra: 'Neutra',
}
const DEFAULT_COLOR = '#7b68a6'
const MAX_LABELS = 30
/** Lado maior do território na tela para ganhar nome quando não há polo perto. */
const MIN_LABEL_PX = 32
/** Polo a até 700 m mais o raio equivalente do território conta como "em cima". */
const NEAR_METERS = 700
/** Com um polo aberto, nomes a mais de 1,5 km dele e dos ligados ficam apagados. */
const FOCUS_METERS = 1500
const COMMUNITY_ZOOM = 14
const NAME_PREFIX = /^((?:Complexo|Morro) d[aeo]s?)\s+(.+)$/
const LABEL_PLATE_STYLE =
  'padding:3px 7px 4px;border-radius:5px;background:rgba(255,255,255,.92);box-shadow:0 0 0 1px rgba(20,30,35,.14),0 1px 3px rgba(20,30,35,.18)'

// Sem a camada, o mapa segue normal, só sem os territórios.
const layerStore = createLazyStore<TerritoryCollection | null>(null, () =>
  request<TerritoryCollection>('/api/camadas/territorios'),
)
export const useTerritoriesLayer = layerStore.use

/** O complexo entre parênteses no nome ("Zinco (Complexo do São Carlos)" → "Complexo do São Carlos"), como em `analise.geo.complexo`. */
export function complexOf(
  territoryName: string | null | undefined,
): string | null {
  if (!territoryName) return null
  const openParen = territoryName.indexOf('(')
  const closeParen = territoryName.lastIndexOf(')')
  return openParen >= 0 && closeParen > openParen
    ? territoryName.slice(openParen + 1, closeParen).trim() || territoryName
    : territoryName
}

export const factionColor = (faction: string | null | undefined) =>
  (faction && FACTION_COLORS[faction]) || DEFAULT_COLOR
export const factionAbbreviation = (faction: string | null | undefined) =>
  faction ? (FACTION_ABBREVIATIONS[faction] ?? faction) : ''

const measureContext =
  typeof document !== 'undefined'
    ? document.createElement('canvas').getContext('2d')
    : null
/** Largura do texto na fonte da placa; `letterSpacing` soma o espaçamento por letra. */
function measureText(text: string, font: string, letterSpacing = 0): number {
  if (!measureContext) return text.length * 7
  measureContext.font = font
  return measureContext.measureText(text).width + letterSpacing * text.length
}
const collides = (taken: number[][], box: number[]) =>
  taken.some(
    ([x1, y1, x2, y2]) =>
      box[0] < x2 && box[2] > x1 && box[1] < y2 && box[3] > y1,
  )

/** Limites do polígono ou multipolígono: [sudoeste, nordeste] em [lat, lng]. */
function box(geometry: Geometry): [LatLngTuple, LatLngTuple] {
  let minLat = 90
  let minLng = 180
  let maxLat = -90
  let maxLng = -180
  const visit = (positions: Position[]) => {
    for (const [lng, lat] of positions) {
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
    }
  }
  if (geometry.type === 'Polygon') geometry.coordinates.forEach(visit)
  else if (geometry.type === 'MultiPolygon')
    geometry.coordinates.forEach((polygon) => polygon.forEach(visit))
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ]
}

type TerritoryShape = {
  name: string
  complex: string
  color: string
  center: LatLngTuple
  sw: LatLngTuple
  ne: LatLngTuple
  area: number
}
type LabelUnit = {
  name: string
  colors: string[]
  center: LatLngTuple
  sw: LatLngTuple
  ne: LatLngTuple
  area: number
}

/** Nível complexo: junta os polígonos pelo complexo, com centro ponderado pela área e facções da maior área para a menor. */
function labelUnits(
  shapes: TerritoryShape[],
  level: 'complexo' | 'comunidade',
): LabelUnit[] {
  if (level === 'comunidade')
    return shapes.map((b) => ({
      name: b.name,
      colors: [b.color],
      center: b.center,
      sw: b.sw,
      ne: b.ne,
      area: b.area,
    }))
  const byComplex = new Map<
    string,
    {
      areaByColor: Map<string, number>
      lat: number
      lng: number
      area: number
      sw: LatLngTuple
      ne: LatLngTuple
    }
  >()
  for (const b of shapes) {
    const a = Math.max(b.area, 1e-6)
    const g = byComplex.get(b.complex) ?? {
      areaByColor: new Map(),
      lat: 0,
      lng: 0,
      area: 0,
      sw: [90, 180],
      ne: [-90, -180],
    }
    g.areaByColor.set(b.color, (g.areaByColor.get(b.color) ?? 0) + a)
    g.lat += b.center[0] * a
    g.lng += b.center[1] * a
    g.area += a
    g.sw = [Math.min(g.sw[0], b.sw[0]), Math.min(g.sw[1], b.sw[1])]
    g.ne = [Math.max(g.ne[0], b.ne[0]), Math.max(g.ne[1], b.ne[1])]
    byComplex.set(b.complex, g)
  }
  return [...byComplex].map(([territoryName, g]) => ({
    name: territoryName,
    colors: [...g.areaByColor]
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color),
    center: [g.lat / g.area, g.lng / g.area],
    sw: g.sw,
    ne: g.ne,
    area: g.area,
  }))
}

function TerritoryLabels({
  shapes,
  obstacles,
  communityZoom,
  focus,
}: {
  shapes: TerritoryShape[]
  obstacles: MapObstacle[]
  communityZoom: number
  focus: LatLngTuple[] | null
}) {
  const [view, setView] = useState<{
    zoom: number
    bounds: LatLngBounds
  } | null>(null)
  const map = useMapEvents({
    moveend: () => setView({ zoom: map.getZoom(), bounds: map.getBounds() }),
    zoomend: () => setView({ zoom: map.getZoom(), bounds: map.getBounds() }),
  })
  const current = view ?? { zoom: map.getZoom(), bounds: map.getBounds() }
  const labels = useMemo(() => {
    const level = current.zoom >= communityZoom ? 'comunidade' : 'complexo'
    const mapSize = map.getSize()
    const taken = obstacles.map((o) => {
      const q = map.latLngToContainerPoint([o.lat, o.lng])
      const r = o.radius + 3
      return [q.x - r, q.y - r, q.x + r, q.y + r]
    })
    // Territórios com polo em cima ou por perto escrevem primeiro; depois os maiores.
    const ranked = labelUnits(shapes, level)
      .filter((u) => current.bounds.contains(u.center))
      .map((u) => ({
        ...u,
        nearby: obstacles.filter(
          (o) =>
            map.distance(u.center, [o.lat, o.lng]) <=
            NEAR_METERS + Math.sqrt(u.area / Math.PI) * 1000,
        ),
      }))
      .sort(
        (a, b) =>
          Number(b.nearby.length > 0) - Number(a.nearby.length > 0) ||
          b.area - a.area,
      )
    const placed: Array<{ key: string; position: LatLngTuple; html: string }> =
      []
    for (const u of ranked) {
      if (placed.length >= MAX_LABELS) break
      const p1 = map.latLngToContainerPoint(u.sw)
      const p2 = map.latLngToContainerPoint(u.ne)
      const important = u.nearby.length > 0
      if (
        !important &&
        Math.max(Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y)) < MIN_LABEL_PX
      )
        continue
      const parts = level === 'complexo' ? u.name.match(NAME_PREFIX) : null
      const prefix = parts?.[1] ?? ''
      const territoryName = parts?.[2] ?? u.name
      const fontSize = level === 'complexo' ? 13 : 12
      const swatch = level === 'complexo' ? 8 : 7
      const w =
        Math.max(
          prefix
            ? measureText(prefix.toUpperCase(), '600 9.5px Inter', 0.86)
            : 0,
          measureText(
            territoryName,
            `${level === 'complexo' ? 700 : 600} ${fontSize}px Inter`,
          ) +
            u.colors.length * (swatch + 5),
        ) + 18
      const h = prefix ? 36 : 23
      const c = map.latLngToContainerPoint(u.center)
      // Candidatos: centro; logo acima e abaixo de cada polo perto; quatro anéis em volta do centro.
      const spots: Array<[number, number]> = [[c.x, c.y]]
      for (const o of u.nearby) {
        const q = map.latLngToContainerPoint([o.lat, o.lng])
        const d = o.radius + h / 2 + 5
        spots.push([q.x, q.y - d], [q.x, q.y + d])
      }
      for (let k = 1; k <= 4; k += 1) {
        const sy = k * (h * 0.55 + 6)
        const sx = k * (w * 0.3 + 8)
        spots.push(
          [c.x, c.y - sy],
          [c.x, c.y + sy],
          [c.x + sx, c.y],
          [c.x - sx, c.y],
          [c.x + sx, c.y - sy],
          [c.x - sx, c.y - sy],
          [c.x + sx, c.y + sy],
          [c.x - sx, c.y + sy],
        )
      }
      // O nome pode sair um pouco do território; a placa cabe na tela, com 22 px livres embaixo para os créditos.
      const mx = important ? w : w / 2
      const my = important ? h * 2 : h
      const area = [
        Math.min(p1.x, p2.x) - mx,
        Math.min(p1.y, p2.y) - my,
        Math.max(p1.x, p2.x) + mx,
        Math.max(p1.y, p2.y) + my,
      ]
      const spot = spots
        .filter(
          ([x, y]) =>
            x >= area[0] &&
            x <= area[2] &&
            y >= area[1] &&
            y <= area[3] &&
            x - w / 2 > 4 &&
            x + w / 2 < mapSize.x - 4 &&
            y - h / 2 > 4 &&
            y + h / 2 < mapSize.y - 22,
        )
        .find(
          ([x, y]) =>
            !collides(taken, [
              x - w / 2 - 3,
              y - h / 2 - 3,
              x + w / 2 + 3,
              y + h / 2 + 3,
            ]),
        )
      if (!spot) continue
      taken.push([
        spot[0] - w / 2,
        spot[1] - h / 2,
        spot[0] + w / 2,
        spot[1] + h / 2,
      ])
      const ll = map.containerPointToLatLng(spot)
      const opacity =
        focus?.length &&
        Math.min(...focus.map((point) => map.distance(ll, point))) >
          FOCUS_METERS
          ? 0.3
          : 1
      const q = (color: string) =>
        `<i style="display:inline-block;flex:none;width:${swatch}px;height:${swatch}px;border-radius:2px;background:${color}"></i>`
      const html =
        level === 'complexo'
          ? `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:2px;transform:translate(-50%,-50%);white-space:nowrap;opacity:${opacity};${LABEL_PLATE_STYLE}">${prefix ? `<span style="font:600 9.5px/1 Inter,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#4a575d">${escapeHtml(prefix)}</span>` : ''}<span style="display:inline-flex;align-items:center;gap:5px;font:700 13px/1.15 Inter,system-ui,sans-serif;color:#141b20">${u.colors.map(q).join('')}${escapeHtml(territoryName)}</span></span>`
          : `<span style="display:inline-flex;align-items:center;gap:5px;transform:translate(-50%,-50%);white-space:nowrap;opacity:${opacity};font:600 12px/1.15 Inter,system-ui,sans-serif;color:#1d262c;${LABEL_PLATE_STYLE}">${q(u.colors[0])}${escapeHtml(territoryName)}</span>`
      placed.push({
        key: `${level}-${u.name}-${u.center.join(',')}`,
        position: [ll.lat, ll.lng],
        html,
      })
    }
    return placed
  }, [
    shapes,
    obstacles,
    communityZoom,
    focus,
    current.zoom,
    current.bounds,
    map,
  ])
  return (
    <>
      {labels.map((label) => (
        <Marker
          key={label.key}
          pane="territoriosRotulos"
          position={label.position}
          interactive={false}
          keyboard={false}
          icon={divIcon({
            className: 'territory-plate',
            iconSize: undefined,
            html: label.html,
          })}
        />
      ))}
    </>
  )
}

const NO_OBSTACLES: MapObstacle[] = []

/**
 * Polígonos e nomes dos territórios dominados; usar dentro de um `MapContainer`. Com `highlighted`, só os
 * complexos pedidos aparecem, preenchidos e com contorno forte na cor da facção, com um nome por complexo em qualquer zoom.
 * `obstacles` são os polos desenhados (os nomes desviam deles) e `focus`, o polo aberto e os ligados a ele.
 * Memorize os dois arrays na tela (`useMemo`) para não recalcular os nomes a cada render.
 */
export function TerritoriesLayer({
  highlighted,
  obstacles = NO_OBSTACLES,
  focus = null,
  communityZoom = COMMUNITY_ZOOM,
}: {
  highlighted?: ReadonlySet<string>
  obstacles?: MapObstacle[]
  focus?: LatLngTuple[] | null
  communityZoom?: number
} = {}) {
  const data = useTerritoriesLayer()
  const key = highlighted ? [...highlighted].sort().join('|') : 'todos'
  const features = useMemo(() => {
    if (!data || !highlighted) return data
    return {
      ...data,
      features: data.features.filter((feature) =>
        highlighted.has(complexOf(feature.properties.nome) ?? ''),
      ),
    }
    // A chave resume o conjunto destacado.
    // Dependências incompletas de propósito.
  }, [data, key])
  const style = useMemo(
    () => (feature?: Feature<Geometry, TerritoryProperties>) => {
      const color = factionColor(feature?.properties?.grupo)
      return highlighted
        ? ({
            color,
            fillColor: color,
            fillOpacity: 0.22,
            weight: 2.2,
            opacity: 0.95,
          } as PathOptions)
        : ({
            color,
            fillColor: color,
            fillOpacity: 0.06,
            weight: 0.9,
            opacity: 0.6,
          } as PathOptions)
    },
    // A chave resume o conjunto destacado (um Set novo a cada render).
    // Dependências incompletas de propósito.
    [key],
  )
  // A caixa de cada polígono sai da geometria uma vez; os nomes só reposicionam.
  const shapes = useMemo<TerritoryShape[]>(
    () =>
      (features?.features ?? []).map((feature) => {
        const [sw, ne] = box(feature.geometry)
        const territoryName = feature.properties.nome ?? ''
        return {
          name: territoryName.replace(/\s*\(.*\)\s*$/, ''),
          complex: complexOf(territoryName) ?? territoryName,
          color: factionColor(feature.properties.grupo),
          center: feature.properties.rotulo,
          sw,
          ne,
          area: feature.properties.area_km2,
        }
      }),
    [features],
  )
  if (!features) return null
  return (
    <>
      {/* Abaixo do overlayPane (400), onde ficam conexões e polos. A chave remonta a camada quando o destaque muda. */}
      <Pane name="territorios" style={{ zIndex: 350 }}>
        <GeoJSON key={key} data={features} style={style} interactive={false} />
      </Pane>
      <Pane
        name="territoriosRotulos"
        style={{ zIndex: 390, pointerEvents: 'none' }}
      >
        <TerritoryLabels
          shapes={shapes}
          obstacles={obstacles}
          communityZoom={highlighted ? 99 : communityZoom}
          focus={focus}
        />
      </Pane>
    </>
  )
}

/** Item da legenda do mapa: o que a camada mostra e as cores por facção. */
export function TerritoriesLegend() {
  const factions = [
    ['CV', 'Comando Vermelho'],
    ['TCP', 'Terceiro Comando Puro'],
    ['ADA', 'Amigos dos Amigos'],
    ['Milícia / LJ', 'Milícia'],
  ] as const
  return (
    <div className="territory-legend">
      <i className="territory-boundary" />
      <span>
        <b>Território dominado</b>
        <small>
          Um nome por complexo; comunidades ao aproximar. Camada de contexto,
          sem confirmar vínculo.
        </small>
        <small className="territory-legend-colors">
          {factions.map(([abbreviation, faction]) => (
            <em key={abbreviation} style={{ color: FACTION_COLORS[faction] }}>
              ■ {abbreviation}
            </em>
          ))}
        </small>
      </span>
    </div>
  )
}
