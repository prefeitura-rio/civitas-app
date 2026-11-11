import 'react-leaflet-cluster/lib/assets/MarkerCluster.css'
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css'

import type { Marker as LeafletMarker } from 'leaflet'
import { Flame, MapPin, Radar, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import { formatCoords } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'
import { CirculationHeatmap } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-heatmap'
import { FitBounds } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/fit-bounds'
import { LocationPopup } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/location-popup'
import {
  occurrenceLegend,
  OccurrenceMarkers,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/occurrence-markers'
import {
  makeRadarClusterIcon,
  radarIcon,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/radar-icons'
import {
  magnitudeBands,
  type MagnitudeScale,
  magnitudeScale,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/radar-scale'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'
import type {
  PlateProfileLocation,
  PlateProfileOccurrence,
  PlateProfileTripLeg,
} from '@/modules/vehicle-intelligence/types/domain'

export interface CirclePoint {
  id: string
  label: string
  sublabel?: string
  detections: number
  latitude: number
  longitude: number
  daily?: Array<{ day: string; count: number }>
  weekday_hour_heatmap?: number[][]
}

export type CirculationLayer = 'detections' | 'heat'

/** Abaixo desse zoom o cluster se desfaz e os marcadores individuais aparecem. */
const CLUSTER_DISABLE_ZOOM = 17

/** Limiares reais da placa, para a cor não ficar sendo adivinhação. */
function RadarMagnitudeLegend({ scale }: { scale: MagnitudeScale }) {
  if (scale.max <= 0) return null
  return (
    <span className="legend-scale">
      {magnitudeBands(scale).map((band) => (
        <span className="legend-scale-step" key={band.label}>
          <i style={{ background: band.color }} />
          {band.label}
        </span>
      ))}
      detecções por ponto
    </span>
  )
}

/** `react-leaflet` repassa props desconhecidas para as options do Leaflet
 *  (`new LeafletMarker(position, options)`), e é assim que o cluster lê as
 *  detecções de cada filho ao montar o balão. */
const DetectionMarker = Marker as React.ComponentType<
  React.ComponentProps<typeof Marker> & { detections: number }
>

export type RadarMapHandle = {
  focus: (pointId: string | null) => void
}

export type RadarOpenRequest = {
  pointId: string
  sequence: number
}

function OpenRadarRequest({
  request,
  markerRefs,
}: {
  request: RadarOpenRequest | null
  markerRefs: { current: Map<string, LeafletMarker> }
}) {
  const map = useMap()
  useEffect(() => {
    if (!request) return
    const marker = markerRefs.current.get(request.pointId)
    if (!marker) return
    const target = marker.getLatLng()
    // Precisa passar do corte de clusterização: dentro de um cluster o
    // marcador não está no mapa e o popup não abriria.
    const targetZoom = Math.max(CLUSTER_DISABLE_ZOOM, map.getZoom())
    map.getContainer().scrollIntoView({ behavior: 'smooth', block: 'center' })
    let updateTimer: number | undefined
    const openPopup = () => {
      marker.openPopup()
      updateTimer = window.setTimeout(() => marker.getPopup()?.update(), 50)
    }
    if (map.getCenter().equals(target) && map.getZoom() === targetZoom) {
      openPopup()
    } else {
      map.once('moveend', openPopup)
      map.flyTo(target, targetZoom, { animate: true, duration: 0.45 })
    }
    return () => {
      map.off('moveend', openPopup)
      if (updateTimer !== undefined) window.clearTimeout(updateTimer)
    }
  }, [map, markerRefs, request])
  return null
}

export function CirculationMap({
  points,
  legs = [],
  occurrences = [],
  showOccurrences = false,
  layer = 'detections',
  onLayerChange,
  onToggleCorrelations,
  radarMapRef,
  openRequest,
  emptyHint,
  periodDays = [],
}: {
  points: CirclePoint[]
  legs?: PlateProfileTripLeg[]
  occurrences?: PlateProfileOccurrence[]
  showOccurrences?: boolean
  layer?: CirculationLayer
  onLayerChange?: (layer: CirculationLayer) => void
  onToggleCorrelations?: () => void
  radarMapRef?: { current: RadarMapHandle | null }
  openRequest?: RadarOpenRequest | null
  emptyHint: string
  periodDays?: string[]
}) {
  const markerRefs = useRef(new Map<string, LeafletMarker>())
  const focusedPointId = useRef<string | null>(null)
  useEffect(() => {
    if (!radarMapRef) return
    radarMapRef.current = {
      focus(pointId) {
        if (focusedPointId.current)
          markerRefs.current
            .get(focusedPointId.current)
            ?.getElement()
            ?.classList.remove('is-focused')
        focusedPointId.current = pointId
        if (pointId)
          markerRefs.current
            .get(pointId)
            ?.getElement()
            ?.classList.add('is-focused')
      },
    }
    return () => {
      radarMapRef.current = null
    }
  }, [radarMapRef])
  const boundsPoints = useMemo(() => {
    const collected: [number, number][] = []
    for (const point of points)
      if (Number.isFinite(point.latitude) && Number.isFinite(point.longitude))
        collected.push([point.latitude, point.longitude])
    for (const leg of legs) {
      if (
        Number.isFinite(leg.origin_latitude) &&
        Number.isFinite(leg.origin_longitude)
      )
        collected.push([leg.origin_latitude, leg.origin_longitude])
      if (
        Number.isFinite(leg.dest_latitude) &&
        Number.isFinite(leg.dest_longitude)
      )
        collected.push([leg.dest_latitude, leg.dest_longitude])
    }
    return collected
  }, [points, legs])
  const boundsSignature = useMemo(
    () =>
      boundsPoints
        .map(
          ([latitude, longitude]) =>
            `${latitude.toFixed(5)},${longitude.toFixed(5)}`,
        )
        .join('|'),
    [boundsPoints],
  )
  const scale = useMemo(() => magnitudeScale(points), [points])
  const totalDetections = useMemo(
    () => points.reduce((sum, point) => sum + point.detections, 0),
    [points],
  )
  const clusterIcon = useMemo(
    () => makeRadarClusterIcon(totalDetections),
    [totalDetections],
  )
  const icons = useMemo(
    () =>
      new Map(
        points.map((point, index) => [
          point.id,
          radarIcon(point, index + 1, scale),
        ]),
      ),
    [points, scale],
  )
  if (!boundsPoints.length) {
    return (
      <div className="profile-occurrences-empty">
        <Radar size={22} />
        <span>{emptyHint}</span>
      </div>
    )
  }
  const radarMarkers = points.map(
    (point, index) =>
      Number.isFinite(point.latitude) &&
      Number.isFinite(point.longitude) && (
        <DetectionMarker
          key={`${point.id}-${index}`}
          position={[point.latitude, point.longitude]}
          icon={icons.get(point.id)}
          detections={point.detections}
          ref={(marker) => {
            if (marker) markerRefs.current.set(point.id, marker)
            else markerRefs.current.delete(point.id)
          }}
        >
          {point.weekday_hour_heatmap ? (
            <Popup
              className="civitas-popup profile-radar-leaflet-popup"
              maxWidth={960}
            >
              <div className="profile-map-popup">
                <span className="profile-rank-index">#{index + 1}</span>
                <LocationPopup
                  point={
                    point as CirclePoint &
                      Pick<
                        PlateProfileLocation,
                        'daily' | 'weekday_hour_heatmap'
                      >
                  }
                  periodDays={periodDays}
                />
              </div>
            </Popup>
          ) : (
            <Popup className="civitas-popup">
              <div className="profile-map-popup">
                <span
                  className="profile-map-popup-kicker"
                  style={{ color: 'var(--cyan-bright)' }}
                >
                  PONTO DE COLETA {point.id}
                </span>
                <strong className="profile-map-popup-title">
                  {point.label}
                </strong>
                {point.sublabel && (
                  <span className="profile-map-popup-meta">
                    {point.sublabel}
                  </span>
                )}
                {formatCoords(point.latitude, point.longitude) && (
                  <span className="profile-map-popup-coords">
                    Lat/Lon {formatCoords(point.latitude, point.longitude)}
                  </span>
                )}
                <b>{pluralize(point.detections, 'detecção', 'detecções')}</b>
              </div>
            </Popup>
          )}
        </DetectionMarker>
      ),
  )
  return (
    <div className="profile-map">
      <MapContainer
        center={[-22.92, -43.4]}
        zoom={11}
        className="profile-map-canvas"
        zoomControl
        scrollWheelZoom
      >
        <BaseTiles />
        <FitBounds points={boundsPoints} signature={boundsSignature} />
        <CirculationHeatmap points={points} visible={layer === 'heat'} />
        {layer === 'detections' && (
          <MarkerClusterGroup
            chunkedLoading
            disableClusteringAtZoom={CLUSTER_DISABLE_ZOOM}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
            iconCreateFunction={clusterIcon}
          >
            {radarMarkers}
          </MarkerClusterGroup>
        )}
        {layer === 'detections' && (
          <OpenRadarRequest
            request={openRequest || null}
            markerRefs={markerRefs}
          />
        )}
        {showOccurrences && <OccurrenceMarkers occurrences={occurrences} />}
      </MapContainer>
      {points.length > 0 && (
        <div
          className="profile-map-layer-controls"
          role="group"
          aria-label="Camadas do mapa"
        >
          <button
            type="button"
            className={layer === 'detections' ? 'active' : ''}
            onClick={() => onLayerChange?.('detections')}
          >
            <MapPin size={13} />
            Detecções
          </button>
          <button
            type="button"
            className={layer === 'heat' ? 'active' : ''}
            onClick={() => onLayerChange?.('heat')}
          >
            <Flame size={13} />
            Heatmap
          </button>
          <button
            type="button"
            className={showOccurrences ? 'active' : ''}
            onClick={onToggleCorrelations}
            disabled={!occurrences.length}
          >
            <ShieldAlert size={13} />
            Correlações
          </button>
        </div>
      )}
      <span className="profile-map-note">
        {points.length > 0 && (
          <>
            <i className="legend-cluster" />
            Cluster: detecções somadas na área
          </>
        )}
        {points.length > 0 && <RadarMagnitudeLegend scale={scale} />}
        {legs.length > 0 && (
          <>
            <i className="legend-swatch arc" />
            Viagens O-D consecutivas (≤ 1 h)
          </>
        )}
        {showOccurrences && occurrences.length > 0 && occurrenceLegend}
      </span>
    </div>
  )
}
