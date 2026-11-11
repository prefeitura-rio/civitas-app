import { divIcon } from 'leaflet'
import { MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { Circle, Marker, Popup } from 'react-leaflet'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { FitBounds } from '@/modules/vehicle-intelligence/components/map/fit-bounds'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import {
  type MergedPoint,
  mergePoints,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type { OccurrenceProfileData } from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import {
  escapeHtml,
  formatDistance,
  formatNumber,
} from '@/modules/vehicle-intelligence/lib/format'
import { titleCaseText } from '@/modules/vehicle-intelligence/lib/labels'

type Found = Extract<OccurrenceProfileData, { found: true }>

/** O enquadramento: o raio inteiro e os pontos até 2× o raio (ou 2 km); a leitura de uma citada do outro lado da
 * cidade fica no mapa, mas não afasta o zoom. */
const FIT_DISTANCE_M = 2000

/** Os quatro cantos do círculo do raio, para o enquadramento mostrar o raio inteiro. */
function radiusCorners(
  [lat, lon]: [number, number],
  meters: number,
): Array<[number, number]> {
  const dLat = meters / 110540
  const dLon = meters / (111320 * Math.cos((lat * Math.PI) / 180))
  return [
    [lat - dLat, lon - dLon],
    [lat + dLat, lon + dLon],
  ]
}

const FACT_ICON = divIcon({
  className: 'occurrence-map-fact',
  iconSize: [26, 32],
  iconAnchor: [13, 30],
  html: `<svg viewBox="0 0 26 32" xmlns="http://www.w3.org/2000/svg"><path d="M13 1C6.9 1 2 5.7 2 11.6 2 19 13 31 13 31s11-12 11-19.4C24 5.7 19.1 1 13 1Z" fill="#f3f7f8" stroke="#0f1111" stroke-width="2"/><circle cx="13" cy="11.4" r="4.2" fill="#0f1111"/></svg>`,
})

function pointIcon(point: MergedPoint) {
  const plates = new Set([...point.together, ...point.nearby]).size
  const classes = [
    'occurrence-map-point',
    point.marked.length ? 'marked' : '',
    point.cited.length ? 'cited' : '',
    point.victim ? 'victim' : '',
  ].filter(Boolean)
  const size = plates
    ? Math.min(34, 18 + Math.round(Math.log2(plates + 1) * 2.4))
    : 14
  return divIcon({
    className: 'occurrence-map-point-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="${classes.join(' ')}" style="width:${size}px;height:${size}px">${plates ? escapeHtml(formatNumber(plates)) : ''}</span>`,
  })
}

function PlateList({
  plates,
  onOpenPlate,
}: {
  plates: string[]
  onOpenPlate: (plate: string) => void
}) {
  return (
    <span className="occurrence-map-plates">
      {plates.map((plate) => (
        <button
          key={plate}
          type="button"
          className="group-plate underlined"
          onClick={() => onOpenPlate(plate)}
        >
          {plate}
        </button>
      ))}
    </span>
  )
}

export function OccurrenceMap({
  data,
  expanded = false,
  onOpenPlate,
}: {
  data: Found
  /** Ampliado, o mapa ocupa quase a altura da janela; o enquadramento é refeito no tamanho novo. */
  expanded?: boolean
  onOpenPlate: (plate: string) => void
}) {
  const { occurrence, parameters } = data
  const { latitude, longitude } = occurrence
  const fact = useMemo(
    () =>
      latitude != null && longitude != null
        ? ([latitude, longitude] as [number, number])
        : null,
    [latitude, longitude],
  )
  const points = useMemo(() => mergePoints(data.points), [data.points])
  const fitPoints = useMemo(() => {
    const limit = Math.max(2 * parameters.radius_meters, FIT_DISTANCE_M)
    const near = points.filter(
      (point) =>
        point.distance_meters == null || point.distance_meters <= limit,
    )
    return [
      ...(fact ? [fact, ...radiusCorners(fact, parameters.radius_meters)] : []),
      ...near.map(
        (point) => [point.latitude, point.longitude] as [number, number],
      ),
    ]
  }, [fact, points, parameters.radius_meters])

  if (!fitPoints.length)
    return (
      <div className="occurrence-map-empty">
        <MapPin size={22} />
        <span>
          O RO não tem local geocodificado e nenhuma placa das listas foi lida
          num ponto conhecido.
        </span>
      </div>
    )
  return (
    <div className={`occurrence-map${expanded ? ' expanded' : ''}`}>
      <MapContainer
        center={fitPoints[0]}
        zoom={15}
        className="occurrence-map-canvas"
        scrollWheelZoom
      >
        <BaseTiles />
        <FitBounds
          points={fitPoints}
          fitKey={`${data.ro}:${parameters.radius_meters}:${expanded ? 'ampliado' : 'normal'}`}
          padding={28}
          maxZoom={17}
          retryMs={[120, 360]}
        />
        {fact && (
          <>
            <Circle
              center={fact}
              radius={parameters.radius_meters}
              pathOptions={{
                color: '#20d6ff',
                weight: 1.5,
                dashArray: '5 6',
                fillOpacity: 0.04,
              }}
            />
            <Marker position={fact} icon={FACT_ICON} zIndexOffset={2000}>
              <Popup className="civitas-popup">
                <div className="occurrence-map-popup">
                  <strong>Local do fato</strong>
                  <span>{occurrence.address ?? 'endereço não informado'}</span>
                </div>
              </Popup>
            </Marker>
          </>
        )}
        {points.map((point) => (
          <Marker
            key={point.points.join('-')}
            position={[point.latitude, point.longitude]}
            icon={pointIcon(point)}
            zIndexOffset={
              point.marked.length
                ? 1000
                : point.cited.length || point.victim
                  ? 500
                  : 0
            }
          >
            <Popup className="civitas-popup">
              <div className="occurrence-map-popup">
                <strong>
                  {point.place ? titleCaseText(point.place) : 'Ponto de coleta'}
                </strong>
                <span className="dim">
                  {[
                    point.neighborhood && titleCaseText(point.neighborhood),
                    point.distance_meters != null &&
                      `a ${formatDistance(point.distance_meters)} do fato`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                {point.together.length > 0 && (
                  <span>
                    {formatNumber(point.together.length)} junto da vítima
                  </span>
                )}
                {point.nearby.length > 0 && (
                  <span>
                    {formatNumber(point.nearby.length)} perto do local
                  </span>
                )}
                {point.victim && (
                  <span className="occurrence-map-victim">
                    A vítima passou aqui perto do horário
                  </span>
                )}
                {point.marked.length > 0 && (
                  <>
                    <span className="occurrence-map-marked">
                      Citada, no Cerco, no Disque Denúncia ou compatível com
                      trecho citado
                    </span>
                    <PlateList
                      plates={point.marked}
                      onOpenPlate={onOpenPlate}
                    />
                  </>
                )}
                {point.cited.length > 0 && (
                  <>
                    <span className="occurrence-map-cited">
                      Citada neste RO: a leitura mais próxima no dia
                    </span>
                    <PlateList plates={point.cited} onOpenPlate={onOpenPlate} />
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="occurrence-map-legend">
        <span>
          <i className="occurrence-map-fact-key" aria-hidden="true" /> local do
          fato e o raio
        </span>
        <span>
          <i className="occurrence-map-point" aria-hidden="true">
            3
          </i>{' '}
          ponto de coleta: o número é de placas das listas lidas ali
        </span>
        <span>
          <i className="occurrence-map-point marked" aria-hidden="true" /> com
          placa citada, no Cerco, no Disque Denúncia ou compatível com trecho
          citado
        </span>
        <span>
          <i className="occurrence-map-point victim" aria-hidden="true" /> a
          vítima passou perto do horário
        </span>
        <span>
          <i className="occurrence-map-point cited" aria-hidden="true" />{' '}
          leitura de placa citada neste RO
        </span>
      </div>
    </div>
  )
}
