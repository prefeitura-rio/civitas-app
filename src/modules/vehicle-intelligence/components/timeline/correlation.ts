/**
 * Chaves das leituras, trilhas e fatos, e as ligações da leitura com o fato (entorno) ou com a placa vítima
 * (copassagem): quais já foram reveladas pela reprodução e as cores e rótulos de cada par.
 */
import {
  suspectDark,
  unassignedSuspectPalette,
} from '@/modules/vehicle-intelligence/components/timeline/palette'
import type {
  CorrelationMatch,
  Detection,
  TimelineCase,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import { parseInstant } from '@/modules/vehicle-intelligence/lib/dates'

export function matchKey(match: CorrelationMatch) {
  return `${match.eventId}|${match.victimDetectedAt ?? ''}|${match.candidateDetectedAt}`
}
export function detectionKey(
  role: Detection['role'],
  plate: string,
  detection: Detection,
) {
  return `${role}|${plate}|${detection.detected_at}|${detection.point_id}|${detection.camera}|${detection.direction}`
}
export function trackKey(
  detection: Pick<TimelineDetection, 'role' | 'plate' | 'candidate_trail'>,
) {
  if (detection.role === 'victim') return `victim:${detection.plate}`
  if (detection.candidate_trail)
    return `candidate:${detection.plate}:${detection.candidate_trail}`
  return `candidate:${detection.plate}`
}
export function anchorTrackKey(item: TimelineCase) {
  return copassagem ? `victim:${item.victim_plate}` : `fact:${item.event_id}`
}
export function factKey(item: TimelineCase) {
  return `fact-moment:${item.event_id}`
}
/** O vínculo só aparece quando a reprodução já passou pelos dois lados: leitura e fato, ou as duas passagens. */
export function revealedCorrelationMatches(
  detection: TimelineDetection,
  moment: number,
) {
  return detection.correlationMatches.filter(
    (match) =>
      Math.max(
        parseInstant(match.victimDetectedAt ?? match.eventTime).getTime(),
        parseInstant(match.candidateDetectedAt).getTime(),
      ) <= moment,
  )
}
export function correlationAnchorTracks(
  matches: CorrelationMatch[],
  tracks: TimelineTrack[],
) {
  const anchorKeys = [...new Set(matches.map((match) => match.anchorKey))]
  return anchorKeys
    .map((key) => tracks.find((track) => track.key === key))
    .filter((track): track is TimelineTrack => Boolean(track))
}
/** A correlata pinta sua metade com a própria cor; a vítima usa o vermelho das correlatas. */
export function pairColor(
  track: Pick<TimelineTrack, 'role' | 'color'> | undefined,
) {
  return track?.role === 'candidate' ? track.color : suspectDark
}
export function correlationGradient(
  matches: CorrelationMatch[],
  tracks: TimelineTrack[],
  fallbackColor: string,
  candidateColor = suspectDark,
) {
  const colors = correlationAnchorTracks(matches, tracks).map(
    (track) => track.color,
  )
  const factColors = colors.length ? colors : [fallbackColor]
  const segmentSize = 50 / factColors.length
  const factStops = factColors.flatMap((color, index) => {
    const start = index * segmentSize
    const end = (index + 1) * segmentSize
    return [`${color} ${start}%`, `${color} ${end}%`]
  })
  return `linear-gradient(90deg,${factStops.join(',')},${candidateColor} 50%,${candidateColor} 100%)`
}
export function plateTrackColor(tracks: TimelineTrack[], plate: string) {
  return (
    tracks.find((track) => track.role === 'candidate' && track.plate === plate)
      ?.color ?? unassignedSuspectPalette.color
  )
}
export function correlationTrackLabel(
  matches: CorrelationMatch[],
  tracks: TimelineTrack[],
) {
  const anchors = correlationAnchorTracks(matches, tracks)
  if (!anchors.length)
    return copassagem ? 'Passagem correlata' : 'Leitura no entorno'
  if (anchors.length > 1)
    return `↔ ${anchors.length} ${copassagem ? 'vítimas' : 'fatos'}`
  return `↔ ${anchors[0].label}`
}
