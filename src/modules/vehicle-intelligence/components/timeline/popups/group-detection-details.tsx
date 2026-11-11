import { Users } from 'lucide-react'
import type { CSSProperties } from 'react'

import { plateTrackColor } from '@/modules/vehicle-intelligence/components/timeline/correlation'
import {
  disconnectionText,
  territoryLabel,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type {
  TimelineCase,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { formatTimeSeconds } from '@/modules/vehicle-intelligence/lib/dates'
import { formatDuration } from '@/modules/vehicle-intelligence/lib/format'
import type { GroupTogetherPassage } from '@/modules/vehicle-intelligence/types/domain'

/** Grupo: passagens juntas e marcas (partida, desconexão) da leitura, no popup. */
export function GroupDetectionDetails({
  detection,
  track,
  tracks,
  together,
  facts,
}: {
  detection: TimelineDetection
  track: TimelineTrack
  tracks: TimelineTrack[]
  together: GroupTogetherPassage[]
  facts: TimelineCase[]
}) {
  const factLabel = (eventId: string) =>
    tracks.find((item) => item.key === `fact:${eventId}`)?.label ??
    `RO ${eventId}`
  const ro = (eventId: string) =>
    facts.find((item) => item.event_id === eventId)?.ro ?? eventId
  return (
    <>
      {together.length > 0 && (
        <div className="analysis-correlation-details">
          <header>
            <Users size={14} />
            <strong>Passagem junta</strong>
            <span>mesmo equipamento · até 3 min</span>
          </header>
          {together.map((item) => (
            <section
              key={`${item.plate}|${item.detected_at}`}
              style={
                {
                  '--correlation-victim': track.color,
                  '--correlation-candidate': plateTrackColor(
                    tracks,
                    item.plate,
                  ),
                } as CSSProperties
              }
            >
              <div className="correlation-pair-title">
                <i />
                <strong>
                  {track.plate} + {item.plate}
                </strong>
              </div>
              <dl>
                <dt>{item.plate}</dt>
                <dd>
                  {formatTimeSeconds(item.detected_at)} ·{' '}
                  {item.seconds === 0
                    ? 'no mesmo instante'
                    : `${formatDuration(Math.abs(item.seconds))} ${item.seconds < 0 ? 'antes' : 'depois'}`}
                </dd>
                <dt>No fato</dt>
                <dd>
                  {item.evidence_events.length
                    ? `conta como juntas no fato · ${item.evidence_events.map(factLabel).join(', ')}`
                    : item.near_fact
                      ? 'perto da hora de um fato, mas as duas placas não estão no mesmo RO'
                      : 'fora da hora dos fatos'}
                </dd>
              </dl>
            </section>
          ))}
        </div>
      )}
      {(detection.marks ?? []).map((mark) => (
        <div
          key={`${mark.kind}|${mark.event_id}`}
          className={`timeline-group-mark ${mark.kind}`}
        >
          <strong>
            {mark.kind === 'departure' ? 'Partida' : 'Desconexão'} ·{' '}
            {factLabel(mark.event_id)} · RO {ro(mark.event_id)}
          </strong>
          <span>
            {mark.kind === 'departure'
              ? 'Primeira leitura da placa no dia do fato.'
              : disconnectionText(mark)}
          </span>
          {territoryLabel(mark) && (
            <span>Território mais próximo: {territoryLabel(mark)}</span>
          )}
        </div>
      ))}
    </>
  )
}
