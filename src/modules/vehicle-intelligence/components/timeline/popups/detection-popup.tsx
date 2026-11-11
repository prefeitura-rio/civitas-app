import { Link2 } from 'lucide-react'
import type { CSSProperties } from 'react'

import {
  correlationAnchorTracks,
  correlationGradient,
  matchKey,
  pairColor,
} from '@/modules/vehicle-intelligence/components/timeline/correlation'
import { GroupDetectionDetails } from '@/modules/vehicle-intelligence/components/timeline/popups/group-detection-details'
import { relativeTimeLabel } from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type {
  CorrelationMatch,
  TimelineCase,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import { formatTimeSeconds } from '@/modules/vehicle-intelligence/lib/dates'
import { formatDistance } from '@/modules/vehicle-intelligence/lib/format'
import type { GroupTogetherPassage } from '@/modules/vehicle-intelligence/types/domain'

export function DetectionPopup({
  detection,
  order,
  track,
  tracks,
  facts,
  correlationMatches,
  together,
  windowMinutes,
  variant,
}: {
  detection: TimelineDetection
  order: number
  track: TimelineTrack
  tracks: TimelineTrack[]
  facts: TimelineCase[]
  correlationMatches: CorrelationMatch[]
  together: GroupTogetherPassage[]
  windowMinutes: number
  variant?: 'plate' | 'group'
}) {
  const correlationRevealed = correlationMatches.length > 0
  const matchedAnchors = correlationAnchorTracks(correlationMatches, tracks)
  const matchedAnchor = matchedAnchors[0]
  const status = correlationRevealed
    ? copassagem
      ? matchedAnchors.length > 1
        ? `Com ${matchedAnchors.length} vítimas`
        : matchedAnchor
          ? `Com ${matchedAnchor.label}`
          : 'Passagem correlata'
      : matchedAnchors.length > 1
        ? `No entorno de ${matchedAnchors.length} fatos`
        : matchedAnchor
          ? `No entorno do ${matchedAnchor.label.toLowerCase()}`
          : 'Leitura no entorno'
    : detection.within_fact_window
      ? `Dentro de ±${windowMinutes} min`
      : `Fora de ±${windowMinutes} min`
  const candidateColor = pairColor(track)
  const role =
    variant === 'group' ? (
      <span className="analysis-popup-role member">
        {track.label.toUpperCase()}
      </span>
    ) : (
      <span
        className={`analysis-popup-role ${track.role === 'candidate' ? 'candidate' : 'victim'}`}
      >
        {track.role === 'candidate' ? 'CORRELATA' : 'VÍTIMA'}
      </span>
    )
  return (
    <div
      className="analysis-map-popup"
      style={
        {
          '--popup-accent': track.color,
          '--correlation-victim': matchedAnchor?.color || track.color,
          '--correlation-candidate': candidateColor,
          '--correlation-fill': correlationGradient(
            correlationMatches,
            tracks,
            track.color,
            candidateColor,
          ),
          '--popup-role': track.color,
        } as CSSProperties
      }
    >
      <div className="analysis-popup-top">
        {role}
        <span
          className={`analysis-popup-status${correlationRevealed ? ' correlated' : ''}`}
        >
          {status}
        </span>
      </div>
      <div className="analysis-popup-identity">
        <strong className="analysis-popup-plate analysis-popup-plate-primary">
          {track.plate}
        </strong>
        <span className="analysis-popup-track">
          <i />
          {track.label} · #{order}
        </span>
      </div>
      <b className="analysis-popup-time">
        {formatTimeSeconds(detection.detected_at)}
      </b>
      <span className="analysis-popup-place">
        {detection.location || 'Local não informado'}
      </span>
      <dl className="analysis-popup-grid">
        <dt>Equipamento</dt>
        <dd>{detection.camera || '—'}</dd>
        <dt>Bairro</dt>
        <dd>{detection.neighborhood || '—'}</dd>
        <dt>Sentido</dt>
        <dd>{detection.direction || '—'}</dd>
        <dt>Ponto de coleta</dt>
        <dd>{detection.point_id || '—'}</dd>
      </dl>
      {variant === 'group' && (
        <GroupDetectionDetails
          detection={detection}
          track={track}
          tracks={tracks}
          together={together}
          facts={facts}
        />
      )}
      {correlationRevealed && (
        <div className="analysis-correlation-details">
          {copassagem ? (
            <header>
              <Link2 size={14} />
              <strong>Pareamento confirmado</strong>
              <span>vítima + correlata</span>
            </header>
          ) : (
            <header>
              <Link2 size={14} />
              <strong>Leitura no entorno do fato</strong>
              <span>raio e janela</span>
            </header>
          )}
          {correlationMatches.map((match) => {
            const anchor = tracks.find(
              (candidate) => candidate.key === match.anchorKey,
            )
            return (
              <section
                key={matchKey(match)}
                style={
                  {
                    '--correlation-victim': anchor?.color || track.color,
                    '--correlation-candidate': candidateColor,
                  } as CSSProperties
                }
              >
                <div className="correlation-pair-title">
                  <i />
                  <strong>
                    {anchor?.label || 'Fato'} ·{' '}
                    {copassagem ? anchor?.plate : `RO ${match.eventId}`}
                  </strong>
                </div>
                <dl>
                  {match.victimDetectedAt && (
                    <>
                      <dt>Em relação à vítima</dt>
                      <dd>
                        {relativeTimeLabel(
                          match.candidateDetectedAt,
                          match.victimDetectedAt,
                          'da vítima',
                        )}
                      </dd>
                    </>
                  )}
                  <dt>Em relação ao fato</dt>
                  <dd>
                    {relativeTimeLabel(
                      match.candidateDetectedAt,
                      match.eventTime,
                      'do fato',
                    )}
                  </dd>
                  <dt>Distância do fato</dt>
                  <dd>
                    {match.distanceMeters == null
                      ? '—'
                      : `${formatDistance(match.distanceMeters, { fixedKm: true })} do local`}
                  </dd>
                </dl>
                <small>
                  Correlata {formatTimeSeconds(match.candidateDetectedAt)}
                  {match.victimDetectedAt
                    ? ` · vítima ${formatTimeSeconds(match.victimDetectedAt)}`
                    : ''}{' '}
                  · fato {formatTimeSeconds(match.eventTime)}
                </small>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
