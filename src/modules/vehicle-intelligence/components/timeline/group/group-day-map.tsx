import { useMemo } from 'react'
import {
  Circle,
  CircleMarker,
  Marker,
  Pane,
  Polyline,
  Popup,
} from 'react-leaflet'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { FitBounds } from '@/modules/vehicle-intelligence/components/map/fit-bounds'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import type { GroupEvent } from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { GroupMapLegend } from '@/modules/vehicle-intelligence/components/timeline/group/group-map-legend'
import {
  pinIcon,
  togetherIcon,
} from '@/modules/vehicle-intelligence/components/timeline/group/map-icons'
import { mapLabelItems } from '@/modules/vehicle-intelligence/components/timeline/group/map-label-items'
import { MapLabels } from '@/modules/vehicle-intelligence/components/timeline/group/map-labels'
import { COLORS } from '@/modules/vehicle-intelligence/components/timeline/group/style'
import { toMs } from '@/modules/vehicle-intelligence/components/timeline/group/time'
import { TogetherPopup } from '@/modules/vehicle-intelligence/components/timeline/group/together-popup'
import { lighten } from '@/modules/vehicle-intelligence/components/timeline/palette'
import { CrimeSitePopup } from '@/modules/vehicle-intelligence/components/timeline/popups/crime-site-popup'
import { DetectionPopup } from '@/modules/vehicle-intelligence/components/timeline/popups/detection-popup'
import type {
  TimelineDay,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'

/**
 * O mapa do dia do grupo: a passagem junta como um marcador só, partida e desconexão com símbolo próprio, os fatos com
 * o raio, as trilhas até o momento e os rótulos fixos.
 */
export function GroupDayMap({
  day,
  events,
  revealed,
  activeKey,
  colors,
  enabledPlates,
  moment,
  windowMinutes,
  radiusMeters,
  dayKey,
}: {
  day: TimelineDay
  events: GroupEvent[]
  revealed: GroupEvent[]
  activeKey: string | null
  colors: Map<string, string>
  enabledPlates: Set<string>
  moment: number
  windowMinutes: number
  radiusMeters: number | null
  dayKey: string
}) {
  const points = useMemo<Array<[number, number]>>(
    () => [
      ...day.detections
        .filter((detection) => Number.isFinite(detection.latitude))
        .map(
          (detection) =>
            [detection.latitude, detection.longitude] as [number, number],
        ),
      ...day.facts
        .filter((f) => f.event_latitude != null)
        .map(
          (f) => [f.event_latitude!, f.event_longitude!] as [number, number],
        ),
    ],
    [day],
  )
  const trackByPlate = useMemo(
    () => new Map(day.tracks.map((t) => [t.plate, t])),
    [day],
  )
  const orderInTrack = useMemo(
    () =>
      new Map(
        day.tracks.flatMap((t) =>
          t.detections.map((detection, i) => [detection.key, i + 1] as const),
        ),
      ),
    [day],
  )
  const factTrackByKey = useMemo(
    () =>
      new Map(
        day.tracks.filter((t) => t.role === 'fact').map((t) => [t.key, t]),
      ),
    [day],
  )
  const trails = useMemo(
    () =>
      day.tracks
        .filter((t) => t.role === 'candidate' && enabledPlates.has(t.plate))
        .map((t) => ({
          track: t,
          points: t.detections
            .filter((detection) => toMs(detection.detected_at) <= moment + 1e-6)
            .map(
              (detection) =>
                [detection.latitude, detection.longitude] as [number, number],
            ),
        })),
    [day, enabledPlates, moment],
  )
  const detectionPopup = (detection: TimelineDetection) => {
    const track = trackByPlate.get(detection.plate) as TimelineTrack
    const matches = detection.correlationMatches.filter(
      (m) => Math.max(toMs(m.eventTime), toMs(m.candidateDetectedAt)) <= moment,
    )
    const passages = (detection.together ?? []).filter(
      (j) =>
        Math.max(toMs(j.detected_at), toMs(detection.detected_at)) <= moment,
    )
    return (
      <Popup className="civitas-popup" maxWidth={390} autoPanPadding={[18, 18]}>
        <DetectionPopup
          detection={detection}
          order={orderInTrack.get(detection.key) ?? 0}
          track={track}
          tracks={day.tracks}
          facts={day.facts}
          correlationMatches={matches}
          together={passages}
          windowMinutes={windowMinutes}
          variant="group"
        />
      </Popup>
    )
  }
  const { labels, obstacles } = useMemo(
    () => mapLabelItems(revealed, colors),
    [revealed, colors],
  )
  return (
    <div className="gt-map-area timeline-map-stage">
      <MapContainer
        className="gt-map"
        center={[-22.91, -43.3]}
        zoom={12}
        zoomControl
      >
        <BaseTiles />
        <Pane name="gtRotulos" style={{ zIndex: 640, pointerEvents: 'none' }} />
        {/* Enquadra todas as leituras e fatos do dia ao trocar de dia; não segue a leitura ativa. */}
        <FitBounds
          points={points}
          fitKey={dayKey}
          padding={44}
          maxZoom={16}
          retryMs={[200]}
        />
        {radiusMeters != null &&
          revealed
            .filter((e) => e.kind === 'fact' && e.fact?.event_latitude != null)
            .map((e) => (
              <Circle
                key={`raio-${e.key}`}
                center={[e.fact!.event_latitude!, e.fact!.event_longitude!]}
                radius={radiusMeters}
                interactive={false}
                pathOptions={{
                  color: COLORS.fact,
                  weight: 1.3,
                  opacity: 0.8,
                  dashArray: '5 6',
                  fillColor: COLORS.fact,
                  fillOpacity: 0.05,
                }}
              />
            ))}
        {trails
          .filter((t) => t.points.length > 1)
          .map((t) => (
            <Polyline
              key={`trilha-${t.track.key}`}
              positions={t.points}
              interactive={false}
              pathOptions={{
                color: t.track.color,
                weight: 3,
                opacity: 0.72,
                lineJoin: 'round',
                lineCap: 'round',
              }}
            />
          ))}
        {revealed
          .filter((e) => e.kind === 'reading')
          .map((e) => {
            const detection = e.detections[0]
            const color = colors.get(detection.plate)!
            const isActive = activeKey === e.key
            return (
              <CircleMarker
                key={e.key}
                center={[detection.latitude, detection.longitude]}
                radius={isActive ? 7 : 5}
                pathOptions={{
                  color: '#fff',
                  weight: 1.5,
                  fillColor: detection.within_fact_window
                    ? color
                    : lighten(color),
                  fillOpacity: 1,
                }}
              >
                {detectionPopup(detection)}
              </CircleMarker>
            )
          })}
        {revealed
          .filter((e) => e.kind === 'departure' || e.kind === 'disconnection')
          .map((e) => {
            const detection = e.detections[0]
            const isDeparture = e.kind === 'departure'
            return (
              <CircleMarker
                key={e.key}
                center={[detection.latitude, detection.longitude]}
                radius={isDeparture ? 8 : 7.5}
                pathOptions={
                  isDeparture
                    ? {
                        color: '#fff',
                        weight: 2.5,
                        fillColor: COLORS.departure,
                        fillOpacity: 1,
                      }
                    : {
                        color: COLORS.disconnection,
                        weight: 4,
                        fillColor: '#fff',
                        fillOpacity: 1,
                      }
                }
              >
                {detectionPopup(detection)}
              </CircleMarker>
            )
          })}
        {revealed
          .filter(
            (e) =>
              e.key === activeKey && e.kind !== 'fact' && e.kind !== 'together',
          )
          .map((e) => (
            <CircleMarker
              key={`anel-${e.key}`}
              center={[e.detections[0].latitude, e.detections[0].longitude]}
              radius={15}
              interactive={false}
              pathOptions={{ color: COLORS.ring, weight: 3, fill: false }}
            />
          ))}
        {revealed
          .filter((e) => e.kind === 'together')
          .map((e) => {
            const detection = e.detections[0]
            return (
              <Marker
                key={e.key}
                position={[detection.latitude, detection.longitude]}
                zIndexOffset={1200}
                icon={togetherIcon(
                  [...new Set(e.detections.map((x) => colors.get(x.plate)!))],
                  Boolean(e.inFact),
                  activeKey === e.key,
                )}
              >
                <Popup className="civitas-popup" maxWidth={360}>
                  <TogetherPopup item={e} colors={colors} />
                </Popup>
              </Marker>
            )
          })}
        {revealed
          .filter((e) => e.kind === 'together' && e.key === activeKey)
          .map((e) => (
            <CircleMarker
              key={`anel-${e.key}`}
              center={[e.detections[0].latitude, e.detections[0].longitude]}
              radius={19}
              interactive={false}
              pathOptions={{ color: COLORS.ring, weight: 3, fill: false }}
            />
          ))}
        {revealed
          .filter((e) => e.kind === 'fact' && e.fact?.event_latitude != null)
          .map((e) => {
            const f = e.fact!
            const track = factTrackByKey.get(`fact:${f.event_id}`)
            return (
              <Marker
                key={e.key}
                position={[f.event_latitude!, f.event_longitude!]}
                icon={pinIcon(activeKey === e.key)}
                zIndexOffset={900}
              >
                {track && (
                  <Popup
                    className="civitas-popup crime-popup"
                    maxWidth={420}
                    maxHeight={540}
                    autoPanPadding={[18, 18]}
                  >
                    <CrimeSitePopup
                      site={{
                        case: f,
                        track,
                        position: [f.event_latitude!, f.event_longitude!],
                      }}
                      tracks={day.tracks}
                    />
                  </Popup>
                )}
              </Marker>
            )
          })}
        <MapLabels labels={labels} obstacles={obstacles} />
      </MapContainer>
      <GroupMapLegend
        windowMinutes={windowMinutes}
        radiusMeters={radiusMeters}
      />
      {events.length === 0 && (
        <span className="gt-map-empty">
          Nenhum evento com as placas ligadas.
        </span>
      )}
    </div>
  )
}
