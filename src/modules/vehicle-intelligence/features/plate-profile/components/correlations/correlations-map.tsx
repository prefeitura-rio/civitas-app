import { divIcon, latLngBounds } from 'leaflet'
import { CalendarClock, MapPin } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useEffect, useMemo } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import { OccurrenceDynamics } from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { cispUnitLabel } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-format'
import {
  candidateColor,
  citedColor,
  victimColor,
} from '@/modules/vehicle-intelligence/features/plate-profile/profile-colors'
import { PROFILE } from '@/modules/vehicle-intelligence/features/plate-profile/profile-variants'
import { formatDateTime } from '@/modules/vehicle-intelligence/lib/dates'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type { PlateProfileOccurrence } from '@/modules/vehicle-intelligence/types/domain'

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    if (points.length === 1) map.setView(points[0], 13)
    else
      map.fitBounds(latLngBounds(points), {
        padding: [42, 42],
        maxZoom: 14,
        animate: false,
      })
    const timer = window.setTimeout(() => map.invalidateSize(), 0)
    return () => window.clearTimeout(timer)
  }, [map, points])
  return null
}

const pinColor = (item: PlateProfileOccurrence, cited: boolean) =>
  cited ? citedColor : item.role === 'victim' ? victimColor : candidateColor

function occurrenceIcon(color: string) {
  return divIcon({
    className: 'profile-occurrence-icon',
    iconSize: [26, 32],
    iconAnchor: [13, 30],
    html: `<div class="profile-occurrence-pin" style="--pin:${color}"><svg viewBox="0 0 26 32" xmlns="http://www.w3.org/2000/svg"><path d="M13 1C6.9 1 2 5.7 2 11.6 2 19 13 31 13 31s11-12 11-19.4C24 5.7 19.1 1 13 1Z" fill="${color}" stroke="#0f1111" stroke-width="2"/><circle cx="13" cy="11.4" r="4.2" fill="#0f1111"/></svg></div>`,
  })
}

export function CorrelationsMap({
  occurrences,
  cispNames,
  onOpenDay,
  citedIds,
}: {
  occurrences: PlateProfileOccurrence[]
  cispNames: Record<string, string>
  onOpenDay: (day: string) => void
  citedIds: Set<string>
}) {
  const geocoded = useMemo(
    () =>
      occurrences.filter(
        (item) =>
          Number.isFinite(item.event_latitude) &&
          Number.isFinite(item.event_longitude),
      ),
    [occurrences],
  )
  const points = useMemo(
    () =>
      geocoded.map(
        (item) =>
          [item.event_latitude as number, item.event_longitude as number] as [
            number,
            number,
          ],
      ),
    [geocoded],
  )
  if (!geocoded.length)
    return (
      <div className="profile-occurrences-empty">
        <MapPin size={22} />
        <span>Nenhuma ocorrência vinculada está geocodificada.</span>
      </div>
    )
  return (
    <div className="profile-map">
      <MapContainer
        center={[-22.92, -43.4]}
        zoom={11}
        className="profile-map-canvas short"
        zoomControl
        scrollWheelZoom
      >
        <BaseTiles />
        <FitBounds points={points} />
        {geocoded.map((item) => (
          <Marker
            key={item.event_id}
            position={[
              item.event_latitude as number,
              item.event_longitude as number,
            ]}
            icon={occurrenceIcon(pinColor(item, citedIds.has(item.event_id)))}
            zIndexOffset={citedIds.has(item.event_id) ? 1000 : 0}
          >
            <Popup className="civitas-popup">
              <div
                className="profile-occurrence-popup"
                style={{ '--role': pinColor(item, false) } as CSSProperties}
              >
                <span className={`profile-occurrence-role ${item.role}`}>
                  {PROFILE.mapRole(item)}
                  {citedIds.has(item.event_id)
                    ? ' · placa citada no relato'
                    : ''}
                </span>
                <strong>
                  {item.crime_type || categoryLabel(item.modality)} ·{' '}
                  {formatDateTime(item.event_time)}
                </strong>
                <span className="profile-occurrence-place">
                  {item.event_address || 'Endereço não informado'}
                </span>
                <small>
                  {cispUnitLabel(item.cisp, cispNames)} ·{' '}
                  {PROFILE.mapDetail(item)}
                </small>
                {recorte.hasDynamics && (
                  <OccurrenceDynamics eventIds={[item.event_id]} />
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="profile-occurrence-cta"
                  onClick={() => onOpenDay(item.day)}
                >
                  <CalendarClock size={14} />
                  Ver dia na timeline
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <span className="profile-map-note">
        <i className="legend-dot" style={{ background: candidateColor }} />
        {PROFILE.mapLegend}
        {citedIds.size > 0 && (
          <>
            <i className="legend-dot" style={{ background: citedColor }} />
            RO que cita a placa
          </>
        )}
      </span>
    </div>
  )
}
