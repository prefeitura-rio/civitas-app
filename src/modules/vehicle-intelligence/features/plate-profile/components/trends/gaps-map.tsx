import { divIcon } from 'leaflet'
import { useMemo } from 'react'
import { Marker, Popup, ZoomControl } from 'react-leaflet'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import {
  durationLabel,
  formatCoords,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'
import { FitBounds } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/fit-bounds'
import { pinSvg } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/occurrence-markers'
import {
  typicalHourBadge,
  TypicalHourLabel,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/typical-hour-label'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type {
  PlateProfileData,
  TypicalHour,
} from '@/modules/vehicle-intelligence/types/domain'

/** Mesmo pino da camada de ocorrências; o distintivo combina hora típica e contagem. */
function gapIcon(color: string, count: number, value?: TypicalHour) {
  return divIcon({
    className: 'profile-occurrence-icon',
    iconSize: [30, 37],
    iconAnchor: [15, 35],
    popupAnchor: [0, -32],
    html: `<div class="profile-occurrence-pin profile-gap-pin" style="--pin:${color}">${pinSvg(color, 30, 37)}<span>${typicalHourBadge(value)} · ${formatNumber(count)}</span></div>`,
  })
}

export function GapsMap({ gaps }: { gaps: PlateProfileData['hiatos'] }) {
  const entries = useMemo(
    () =>
      [
        ...gaps.before
          .slice(0, 2)
          .map((item) => ({ item, kind: 'before' as const })),
        ...gaps.after
          .slice(0, 2)
          .map((item) => ({ item, kind: 'after' as const })),
      ].filter(
        (entry) =>
          Number.isFinite(entry.item.latitude) &&
          Number.isFinite(entry.item.longitude),
      ),
    [gaps],
  )
  const points = useMemo(
    () =>
      entries.map(
        (entry) =>
          [entry.item.latitude, entry.item.longitude] as [number, number],
      ),
    [entries],
  )
  if (!entries.length) return null
  return (
    <div className="profile-map">
      <MapContainer
        center={[-22.92, -43.4]}
        zoom={11}
        className="profile-map-canvas short"
        zoomControl={false}
        scrollWheelZoom
      >
        <BaseTiles />
        <ZoomControl position="bottomright" />
        <FitBounds points={points} />
        {entries.map((entry, index) => {
          const color = entry.kind === 'before' ? '#e0562d' : '#1fb6a6'
          const typicalHour =
            entry.kind === 'before'
              ? entry.item.stop_hour
              : entry.item.resume_hour
          const coords = formatCoords(entry.item.latitude, entry.item.longitude)
          return (
            <Marker
              key={`${entry.kind}-${entry.item.point_id}-${index}`}
              position={[entry.item.latitude, entry.item.longitude]}
              icon={gapIcon(color, entry.item.hiatos, typicalHour)}
            >
              <Popup className="civitas-popup">
                <div className="profile-map-popup">
                  <span className="profile-map-popup-kicker" style={{ color }}>
                    {entry.kind === 'before'
                      ? 'ÚLTIMO PONTO ANTES DA PARADA'
                      : 'PRIMEIRO PONTO NA RETOMADA'}
                  </span>
                  <strong className="profile-map-popup-title">
                    {entry.item.location || entry.item.point_id}
                  </strong>
                  <span className="profile-map-popup-meta">
                    Ponto de coleta {entry.item.point_id}
                  </span>
                  {coords && (
                    <span className="profile-map-popup-coords">
                      Lat/Lon {coords}
                    </span>
                  )}
                  <TypicalHourLabel
                    value={typicalHour}
                    verb={entry.kind === 'before' ? 'Para' : 'Retoma'}
                  />
                  <b>
                    {formatNumber(entry.item.hiatos)} hiatos · mediana{' '}
                    {durationLabel(entry.item.median_gap_seconds)}
                  </b>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      <div
        className="profile-gap-map-legend"
        aria-label="Legenda do mapa de paradas e retomadas"
      >
        <strong>Legenda</strong>
        <span>
          <i className="legend-dot before" />
          Último local antes da parada
        </span>
        <span>
          <i className="legend-dot after" />
          Primeiro local na retomada
        </span>
      </div>
    </div>
  )
}
