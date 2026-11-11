import { LoaderCircle, TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import { normalizeNeighborhood } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'
import type { CirclePoint } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-map'
import { FitBounds } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/fit-bounds'
import {
  occurrenceLegend,
  OccurrenceMarkers,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/occurrence-markers'
import {
  escapeHtml,
  formatNumber,
  formatPercent,
} from '@/modules/vehicle-intelligence/lib/format'
import type {
  PlateProfileNeighborhood,
  PlateProfileOccurrence,
  RioNeighborhoodGeometry,
} from '@/modules/vehicle-intelligence/types/domain'

export function NeighborhoodChoropleth({
  geometry,
  geometryError,
  neighborhoods,
  points,
  occurrences,
  showOccurrences,
}: {
  geometry: RioNeighborhoodGeometry | null
  geometryError: string | null
  neighborhoods: PlateProfileNeighborhood[]
  points: CirclePoint[]
  occurrences: PlateProfileOccurrence[]
  showOccurrences: boolean
}) {
  const statsByName = useMemo(
    () =>
      new Map(
        neighborhoods.map((item) => [normalizeNeighborhood(item.name), item]),
      ),
    [neighborhoods],
  )
  const max = Math.max(1, ...neighborhoods.map((item) => item.detections))
  if (geometryError) {
    return (
      <div className="profile-occurrences-empty">
        <TriangleAlert size={22} />
        <span>{geometryError}</span>
      </div>
    )
  }
  if (!geometry) {
    return (
      <div className="profile-occurrences-empty">
        <LoaderCircle className="animate-spin" size={22} />
        <span>Carregando limites oficiais dos bairros…</span>
      </div>
    )
  }
  const boundsPoints = points.map(
    (point) => [point.latitude, point.longitude] as [number, number],
  )
  return (
    <div className="profile-map">
      <MapContainer
        center={[-22.92, -43.4]}
        zoom={10}
        className="profile-map-canvas profile-choropleth-map"
        zoomControl
        scrollWheelZoom
      >
        <BaseTiles />
        <FitBounds points={boundsPoints} />
        <GeoJSON
          data={geometry}
          style={(feature) => {
            const name = String(feature?.properties?.nome || '')
            const stat = statsByName.get(normalizeNeighborhood(name))
            const intensity = stat ? stat.detections / max : 0
            return {
              color: stat ? '#20D6FF' : 'rgba(232,246,250,.13)',
              opacity: 1,
              weight: stat ? 1.3 : 0.6,
              fillColor: stat ? '#20D6FF' : '#0F1111',
              fillOpacity: stat ? 0.14 + intensity * 0.6 : 0.16,
            }
          }}
          onEachFeature={(feature, layer) => {
            const name = String(
              feature.properties?.nome || 'Bairro não identificado',
            )
            const stat = statsByName.get(normalizeNeighborhood(name))
            layer.bindPopup(
              `<div class="profile-map-popup"><strong>${escapeHtml(name)}</strong>` +
                (stat
                  ? `<b>${formatNumber(stat.detections)} detecções</b><small>${formatNumber(stat.points)} pontos · ${formatPercent(stat.share)} do total</small>`
                  : '<small>Sem detecções atribuídas a este bairro</small>') +
                '</div>',
              { className: 'civitas-popup' },
            )
          }}
        />
        {showOccurrences && <OccurrenceMarkers occurrences={occurrences} />}
      </MapContainer>
      <span className="profile-map-note">
        <i className="profile-choropleth-scale" />
        Menor frequência&nbsp;→&nbsp;maior frequência
        {showOccurrences && occurrences.length > 0 && occurrenceLegend}
      </span>
    </div>
  )
}
