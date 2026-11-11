import { type CSSProperties, useMemo } from 'react'
import { Circle, Marker, Popup, ZoomControl } from 'react-leaflet'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import {
  correlationAnchorTracks,
  correlationGradient,
  correlationTrackLabel,
  factKey,
  pairColor,
  revealedCorrelationMatches,
} from '@/modules/vehicle-intelligence/components/timeline/correlation'
import { GlidingCallout } from '@/modules/vehicle-intelligence/components/timeline/day/gliding-callout'
import {
  crimeMarker,
  mapCallout,
  mapMarker,
} from '@/modules/vehicle-intelligence/components/timeline/day/map-icons'
import { MapLegend } from '@/modules/vehicle-intelligence/components/timeline/day/map-legend'
import { MapViewport } from '@/modules/vehicle-intelligence/components/timeline/day/map-viewport'
import { PopupReset } from '@/modules/vehicle-intelligence/components/timeline/day/popup-reset'
import { TrailCards } from '@/modules/vehicle-intelligence/components/timeline/day/trail-card'
import { TransitionSegment } from '@/modules/vehicle-intelligence/components/timeline/day/transition-segment'
import { detectionPoint } from '@/modules/vehicle-intelligence/components/timeline/geo'
import { CrimeSitePopup } from '@/modules/vehicle-intelligence/components/timeline/popups/crime-site-popup'
import { DetectionPopup } from '@/modules/vehicle-intelligence/components/timeline/popups/detection-popup'
import type {
  CrimeSite,
  TimelineCase,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'

/** O mapa do dia: o raio e o pino de cada fato revelado, as trilhas até o momento e, numa coluna à esquerda, os cartões
 * das trilhas e a legenda (como no Painel de Clonagem, sobre o mapa-base neutro). Entre um passo e outro (`motionMs`), o
 * trecho novo se desenha, o balão desliza, o marcador pousa e o fato pulsa. */
export function CaseMap({
  crimeSites,
  tracks,
  facts,
  visibleKeys,
  viewportPositions,
  activeKey,
  activeFactKey,
  selectedTracks,
  followView,
  onToggleTracks,
  moment,
  windowMinutes,
  radiusMeters,
  motionMs,
  dayKey,
}: {
  crimeSites: CrimeSite[]
  tracks: TimelineTrack[]
  facts: TimelineCase[]
  visibleKeys: Set<string>
  viewportPositions: [number, number][]
  activeKey: string | null
  activeFactKey: string | null
  selectedTracks: Set<string>
  followView: boolean
  onToggleTracks: (trackKeys: string[]) => void
  moment: number
  windowMinutes: number
  radiusMeters: number | null
  /** Duração do movimento de um passo (0: sem movimento). */
  motionMs: number
  dayKey: string
}) {
  const sequences = useMemo(
    () =>
      tracks
        .filter(
          (track) => track.role !== 'fact' && selectedTracks.has(track.key),
        )
        .map((track) => ({
          ...track,
          detections: track.detections.filter(
            (detection) =>
              visibleKeys.has(detection.key) &&
              Number.isFinite(detection.latitude) &&
              Number.isFinite(detection.longitude),
          ),
        })),
    [selectedTracks, tracks, visibleKeys],
  )
  // A leitura ativa (o balão vai até ela) e o que a câmera mantém na área útil.
  const activeSequence = sequences.find(
    (sequence) => sequence.detections.at(-1)?.key === activeKey,
  )
  const activeDetection = activeSequence?.detections.at(-1)
  const activeSite = crimeSites.find(
    (site) => factKey(site.case) === activeFactKey,
  )
  const focus = useMemo<[number, number] | null>(
    () =>
      activeDetection
        ? detectionPoint(activeDetection)
        : (activeSite?.position ?? null),
    [activeDetection, activeSite],
  )
  const motion = {
    '--timeline-motion': `${motionMs}ms`,
    '--timeline-land-delay': `${Math.round(motionMs * 0.72)}ms`,
  } as CSSProperties
  return (
    <div
      className={`timeline-map-stage${activeFactKey ? ' fact-active' : ''}${motionMs ? '' : ' no-motion'}`}
      style={motion}
    >
      <MapContainer
        center={[-22.91, -43.37]}
        zoom={11}
        className="analysis-map"
        zoomControl={false}
      >
        <BaseTiles style="light_all" />
        <ZoomControl position="bottomright" />
        <MapViewport
          positions={viewportPositions}
          focus={focus}
          followView={followView}
          dayKey={dayKey}
        />
        <PopupReset eventKey={activeFactKey || activeKey || 'start'} />
        {radiusMeters != null &&
          crimeSites.map((site) => (
            <Circle
              key={`radius-${site.case.event_id}`}
              center={site.position}
              radius={radiusMeters}
              interactive={false}
              pathOptions={{
                color: site.track.color,
                weight: 1.4,
                opacity: 0.7,
                dashArray: '6 6',
                fillColor: site.track.color,
                fillOpacity: 0.06,
              }}
            />
          ))}
        {crimeSites.map((site, index) => (
          <Marker
            key={`crime-${site.case.event_id}`}
            position={site.position}
            icon={crimeMarker(
              site.track,
              activeFactKey === factKey(site.case),
              site.case.event_time,
            )}
            title={`Momento do fato · ${site.track.label} · ${copassagem ? site.case.victim_plate : `RO ${site.case.ro ?? site.case.event_id}`}`}
            zIndexOffset={
              (activeFactKey === factKey(site.case) ? 4000 : 1600) + index
            }
          >
            <Popup
              className="civitas-popup crime-popup"
              maxWidth={420}
              maxHeight={540}
              autoPanPadding={[18, 18]}
            >
              <CrimeSitePopup site={site} tracks={tracks} />
            </Popup>
          </Marker>
        ))}
        {sequences.flatMap((sequence) =>
          sequence.detections.slice(1).map((to, index) => {
            const from = sequence.detections[index]
            const segmentKey = `${sequence.key}-segment-${from.key}-${to.key}`
            return (
              <TransitionSegment
                key={segmentKey}
                from={from}
                to={to}
                order={index + 1}
                track={sequence}
                growMs={to.key === activeKey ? motionMs : 0}
              />
            )
          }),
        )}
        {sequences.flatMap((sequence) =>
          sequence.detections.map((detection, index) => {
            const isActive = activeKey === detection.key
            const correlationMatches = revealedCorrelationMatches(
              detection,
              moment,
            )
            const correlationRevealed = correlationMatches.length > 0
            return (
              <Marker
                key={detection.key}
                position={detectionPoint(detection)}
                icon={mapMarker(
                  sequence,
                  index + 1,
                  isActive,
                  detection.within_fact_window,
                  correlationRevealed,
                  correlationGradient(
                    correlationMatches,
                    tracks,
                    sequence.color,
                    pairColor(sequence),
                  ),
                )}
                zIndexOffset={
                  isActive ? 2500 : correlationRevealed ? 1000 : 500
                }
              >
                <Popup
                  className="civitas-popup"
                  maxWidth={390}
                  autoPanPadding={[18, 18]}
                >
                  <DetectionPopup
                    detection={detection}
                    order={index + 1}
                    track={sequence}
                    tracks={tracks}
                    facts={facts}
                    correlationMatches={correlationMatches}
                    together={[]}
                    windowMinutes={windowMinutes}
                  />
                </Popup>
              </Marker>
            )
          }),
        )}
        {activeSequence && activeDetection && (
          <ActiveCallout
            detection={activeDetection}
            sequence={activeSequence}
            tracks={tracks}
            moment={moment}
            motionMs={motionMs}
          />
        )}
      </MapContainer>
      <div className="timeline-map-overlay">
        <TrailCards
          tracks={tracks}
          facts={facts}
          selectedTracks={selectedTracks}
          onToggleTracks={onToggleTracks}
          windowMinutes={windowMinutes}
          radiusMeters={radiusMeters}
        />
        <MapLegend
          tracks={tracks}
          windowMinutes={windowMinutes}
          radiusMeters={radiusMeters}
        />
      </div>
      <span className="timeline-map-note">
        Linhas retas ligam observações sucessivas e não representam rota
        percorrida
      </span>
    </div>
  )
}

/** O balão da leitura ativa (um só, de qualquer trilha: desliza de uma leitura para a outra). */
function ActiveCallout({
  detection,
  sequence,
  tracks,
  moment,
  motionMs,
}: {
  detection: TimelineDetection
  sequence: TimelineTrack
  tracks: TimelineTrack[]
  moment: number
  motionMs: number
}) {
  // O selo do balão: a trilha da leitura ou, ligada a um fato, o fato (na cor clara dele, legível no balão escuro).
  const correlationMatches = revealedCorrelationMatches(detection, moment)
  const anchor = correlationAnchorTracks(correlationMatches, tracks)[0]
  const chip = anchor
    ? {
        label: correlationTrackLabel(correlationMatches, tracks),
        color: anchor.softColor,
      }
    : { label: sequence.label, color: sequence.softColor }
  const icon = mapCallout(detection, chip)
  return (
    <GlidingCallout
      position={detectionPoint(detection)}
      icon={icon}
      motionMs={motionMs}
    />
  )
}
