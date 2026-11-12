import type { Color, MapViewState, PickingInfo } from '@deck.gl/core'
import { TileLayer } from '@deck.gl/geo-layers'
import { ArcLayer, BitmapLayer, ScatterplotLayer } from '@deck.gl/layers'
import { DeckGL } from '@deck.gl/react'
import { type RefObject, useEffect, useMemo, useRef } from 'react'

import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import {
  candidateRgba,
  victimRgba,
} from '@/modules/vehicle-intelligence/features/plate-profile/profile-colors'
import { tileUrl } from '@/modules/vehicle-intelligence/lib/api'
import {
  escapeHtml,
  formatNumber,
} from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type {
  PlateProfileOccurrence,
  PlateProfileTripLeg,
} from '@/modules/vehicle-intelligence/types/domain'

// Par de alto contraste entre si e contra o basemap claro do Voyager. Azul e
// magenta também se distinguem nas formas comuns de daltonismo, ao contrário
// do laranja/azul anterior, que empatava em luminosidade sobre fundo claro.
const sourceColor: Color = [21, 94, 217, 225]
const targetColor: Color = [214, 25, 106, 235]

type Endpoint = {
  id: string
  label: string
  position: [number, number]
  count: number
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`
}

function legHeight(leg: PlateProfileTripLeg, maxCount: number): number {
  return 0.55 + 0.85 * Math.sqrt(leg.count / maxCount)
}

function initialViewState(legs: PlateProfileTripLeg[]): MapViewState {
  const coordinates = legs
    .flatMap((leg) => [
      [leg.origin_longitude, leg.origin_latitude] as [number, number],
      [leg.dest_longitude, leg.dest_latitude] as [number, number],
    ])
    .filter(
      ([longitude, latitude]) =>
        Number.isFinite(longitude) && Number.isFinite(latitude),
    )
  if (!coordinates.length) {
    return {
      longitude: -43.4,
      latitude: -22.92,
      zoom: 9.8,
      pitch: 42,
      bearing: -12,
    }
  }
  const longitudes = coordinates.map(([longitude]) => longitude)
  const latitudes = coordinates.map(([, latitude]) => latitude)
  const minLongitude = Math.min(...longitudes)
  const maxLongitude = Math.max(...longitudes)
  const minLatitude = Math.min(...latitudes)
  const maxLatitude = Math.max(...latitudes)
  const span = Math.max(
    maxLongitude - minLongitude,
    (maxLatitude - minLatitude) * 1.35,
    0.008,
  )
  const zoom = Math.max(8.2, Math.min(13.5, Math.log2(360 / span) - 2.2))
  return {
    longitude: (minLongitude + maxLongitude) / 2,
    latitude: (minLatitude + maxLatitude) / 2,
    zoom,
    pitch: 48,
    bearing: -12,
  }
}

function endpoints(legs: PlateProfileTripLeg[]): Endpoint[] {
  const byId = new Map<string, Endpoint>()
  for (const leg of legs) {
    const origin = byId.get(leg.origin_point_id)
    if (origin) origin.count += leg.count
    else
      byId.set(leg.origin_point_id, {
        id: leg.origin_point_id,
        label: leg.origin_location || leg.origin_point_id,
        position: [leg.origin_longitude, leg.origin_latitude],
        count: leg.count,
      })
    const destination = byId.get(leg.dest_point_id)
    if (destination) destination.count += leg.count
    else
      byId.set(leg.dest_point_id, {
        id: leg.dest_point_id,
        label: leg.dest_location || leg.dest_point_id,
        position: [leg.dest_longitude, leg.dest_latitude],
        count: leg.count,
      })
  }
  return [...byId.values()].filter((point) =>
    point.position.every(Number.isFinite),
  )
}

/**
 * Solta o contexto WebGL do mapa ao desmontar: o luma.gl não o libera, e cada volta à vista "Viagens" deixava um
 * contexto com os tiles na memória (o Chrome guarda até 16). Espera um instante: no StrictMode o efeito é desmontado e
 * montado de novo na hora, e aí o contexto continua em uso.
 */
function useWebGLRelease() {
  // O contexto chega depois da montagem (`onDeviceInitialized`): a limpeza lê o da hora.
  const gl = useRef<WebGL2RenderingContext | null>(null)
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      releaseLater(gl, mounted)
    }
  }, [])
  return gl
}

function releaseLater(
  gl: RefObject<WebGL2RenderingContext | null>,
  mounted: RefObject<boolean>,
) {
  const context = gl.current
  window.setTimeout(() => {
    if (!mounted.current)
      context?.getExtension('WEBGL_lose_context')?.loseContext()
  }, 0)
}

export default function ProfileTrips3DMap({
  legs,
  occurrences,
  showCorrelations,
  onToggleCorrelations,
}: {
  legs: PlateProfileTripLeg[]
  occurrences: PlateProfileOccurrence[]
  showCorrelations: boolean
  onToggleCorrelations: () => void
}) {
  const viewState = useMemo(() => initialViewState(legs), [legs])
  const endpointData = useMemo(() => endpoints(legs), [legs])
  const gl = useWebGLRelease()
  const maxLegCount = Math.max(1, ...legs.map((leg) => leg.count))
  const maxEndpointCount = Math.max(
    1,
    ...endpointData.map((point) => point.count),
  )
  const correlationData = useMemo(
    () =>
      occurrences.filter(
        (item) =>
          Number.isFinite(item.event_longitude) &&
          Number.isFinite(item.event_latitude),
      ),
    [occurrences],
  )
  const layers = useMemo(
    () => [
      new TileLayer({
        id: 'profile-trips-basemap',
        // Mesmo Voyager dos demais mapas do perfil.
        data: [tileUrl('voyager')],
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        renderSubLayers: (props) => {
          const { boundingBox } = props.tile
          return new BitmapLayer(props, {
            data: null as never,
            image: props.data,
            bounds: [
              boundingBox[0][0],
              boundingBox[0][1],
              boundingBox[1][0],
              boundingBox[1][1],
            ],
          })
        },
      }),
      new ArcLayer<PlateProfileTripLeg>({
        id: 'profile-trip-arcs',
        data: legs,
        getSourcePosition: (leg) => [leg.origin_longitude, leg.origin_latitude],
        getTargetPosition: (leg) => [leg.dest_longitude, leg.dest_latitude],
        getSourceColor: sourceColor,
        getTargetColor: targetColor,
        getWidth: (leg) => 1.8 + 4.2 * Math.sqrt(leg.count / maxLegCount),
        getHeight: (leg) => legHeight(leg, maxLegCount),
        widthMinPixels: 2,
        widthMaxPixels: 8,
        pickable: true,
        autoHighlight: true,
        highlightColor: [32, 214, 255, 210],
        greatCircle: true,
        parameters: { cullMode: 'none' },
      }),
      new ScatterplotLayer<Endpoint>({
        id: 'profile-trip-endpoints',
        data: endpointData,
        getPosition: (point) => point.position,
        getRadius: (point) =>
          45 + 120 * Math.sqrt(point.count / maxEndpointCount),
        radiusMinPixels: 3,
        radiusMaxPixels: 10,
        // Preenchimento claro com contorno escuro: o basemap Voyager é claro e o
        // círculo quase preto de antes sumia sobre o traçado das vias.
        getFillColor: [255, 255, 255, 240],
        getLineColor: [15, 23, 42, 235],
        lineWidthMinPixels: 2,
        stroked: true,
        pickable: true,
      }),
      showCorrelations
        ? new ScatterplotLayer<PlateProfileOccurrence>({
            id: 'profile-trip-correlations',
            data: correlationData,
            getPosition: (item) => [
              item.event_longitude as number,
              item.event_latitude as number,
            ],
            getRadius: 170,
            radiusMinPixels: 7,
            radiusMaxPixels: 14,
            getFillColor: (item) =>
              copassagem && item.role === 'victim' ? victimRgba : candidateRgba,
            getLineColor: [15, 17, 17, 240],
            lineWidthMinPixels: 2,
            stroked: true,
            pickable: true,
          })
        : null,
    ],
    [
      correlationData,
      endpointData,
      legs,
      maxEndpointCount,
      maxLegCount,
      showCorrelations,
    ],
  )

  const tooltip = ({
    object,
    layer,
  }: PickingInfo<PlateProfileTripLeg | Endpoint | PlateProfileOccurrence>) => {
    if (!object) return null
    if (layer?.id === 'profile-trip-arcs') {
      const leg = object as PlateProfileTripLeg
      return {
        html: `<strong>${escapeHtml(leg.origin_location || leg.origin_point_id)} → ${escapeHtml(leg.dest_location || leg.dest_point_id)}</strong><br/>${formatNumber(leg.count)} viagens consecutivas<br/>Mediana: ${formatDuration(leg.median_gap_seconds)}`,
        className: 'profile-deck-tooltip',
      }
    }
    if (layer?.id === 'profile-trip-correlations') {
      const occurrence = object as PlateProfileOccurrence
      return {
        html: `<strong>${copassagem ? (occurrence.role === 'victim' ? 'Placa vítima' : 'Placa correlata') : `RO ${escapeHtml(occurrence.event_id)}`}</strong><br/>${escapeHtml(occurrence.crime_type || categoryLabel(occurrence.modality))}<br/>${escapeHtml(occurrence.event_address || 'Endereço não informado')}`,
        className: 'profile-deck-tooltip',
      }
    }
    const endpoint = object as Endpoint
    return {
      html: `<strong>${escapeHtml(endpoint.label)}</strong><br/>${formatNumber(endpoint.count)} viagens conectadas`,
      className: 'profile-deck-tooltip',
    }
  }

  return (
    <div className="profile-map profile-trips-3d">
      <div
        className="profile-deck-map"
        aria-label="Mapa 3D das viagens consecutivas"
      >
        <DeckGL
          initialViewState={viewState}
          controller
          layers={layers}
          getTooltip={tooltip}
          onDeviceInitialized={(device) => {
            gl.current =
              'gl' in device ? (device.gl as WebGL2RenderingContext) : null
          }}
        />
      </div>
      <div
        className="profile-map-layer-controls profile-deck-controls"
        role="group"
        aria-label="Camadas do mapa de viagens"
      >
        <span>Arcos 3D</span>
        <button
          type="button"
          className={showCorrelations ? 'active' : ''}
          onClick={onToggleCorrelations}
          disabled={!occurrences.length}
        >
          Correlações
        </button>
      </div>
      <span className="profile-map-note">
        <i className="legend-swatch flow" />
        Origem (azul) → destino (magenta) · espessura e altura representam
        recorrência
        {showCorrelations &&
          occurrences.length > 0 &&
          (copassagem ? (
            <>
              <i className="legend-dot victim" />
              Vítima
              <i className="legend-dot candidate" />
              Correlata
            </>
          ) : (
            <>
              <i className="legend-dot candidate" />
              Fato ligado à placa
            </>
          ))}
      </span>
    </div>
  )
}
