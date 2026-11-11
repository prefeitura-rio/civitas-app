import { useCallback, useEffect, useMemo, useState } from 'react'

import { AuthorCitations } from '@/modules/vehicle-intelligence/components/plate/author-citations'
import {
  anchorTrackKey,
  detectionKey,
  matchKey,
} from '@/modules/vehicle-intelligence/components/timeline/correlation'
import { straightDistanceKm } from '@/modules/vehicle-intelligence/components/timeline/geo'
import {
  anchorPalettes,
  suspectDark,
  suspectLight,
  suspectTrailPalettes,
  unassignedSuspectPalette,
} from '@/modules/vehicle-intelligence/components/timeline/palette'
import type {
  CorrelationMatch,
  Detection,
  TimelineCase,
  TimelineDay,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { TimelineView } from '@/modules/vehicle-intelligence/components/timeline/timeline-view'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import { getCorrelatedPlateTimeline } from '@/modules/vehicle-intelligence/lib/api'
import { parseInstant } from '@/modules/vehicle-intelligence/lib/dates'
import { usePlateScopeQuery } from '@/modules/vehicle-intelligence/stores/event-scope'
import type { CorrelatedPlateTimelineData } from '@/modules/vehicle-intelligence/types/domain'

/** Leituras do lado oposto do par no mesmo ponto de coleta, dentro da janela de passagem. */
function passageMatches(
  item: TimelineCase,
  detection: Detection,
  passageWindowMinutes: number,
): CorrelationMatch[] {
  const opposite = item.detections.filter(
    (other) =>
      other.role !== detection.role &&
      other.point_id === detection.point_id &&
      Math.abs(
        parseInstant(other.detected_at).getTime() -
          parseInstant(detection.detected_at).getTime(),
      ) <=
        passageWindowMinutes * 60_000,
  )
  const hasFact =
    Number.isFinite(item.event_latitude) &&
    Number.isFinite(item.event_longitude)
  return opposite.map((other) => {
    const [victim, candidate] =
      detection.role === 'victim' ? [detection, other] : [other, detection]
    return {
      eventId: item.event_id,
      anchorKey: anchorTrackKey(item),
      candidateDetectedAt: candidate.detected_at,
      victimDetectedAt: victim.detected_at,
      eventTime: item.event_time,
      distanceMeters: hasFact
        ? straightDistanceKm(candidate, {
            latitude: item.event_latitude as number,
            longitude: item.event_longitude as number,
          }) * 1000
        : null,
    }
  })
}
function mergeDayDetections(
  cases: TimelineCase[],
  passageWindowMinutes: number,
): TimelineDetection[] {
  const merged = new Map<string, TimelineDetection>()
  cases.forEach((item) => {
    item.detections.forEach((detection) => {
      const plate =
        detection.role === 'victim'
          ? (item.victim_plate ?? '')
          : item.candidate_plate
      const key = detectionKey(detection.role, plate, detection)
      const correlationMatches: CorrelationMatch[] = !detection.correlated
        ? []
        : copassagem
          ? passageMatches(item, detection, passageWindowMinutes)
          : [
              {
                eventId: item.event_id,
                anchorKey: anchorTrackKey(item),
                candidateDetectedAt: detection.detected_at,
                eventTime: item.event_time,
                distanceMeters: detection.fact_distance_meters ?? null,
              },
            ]
      const current = merged.get(key)
      if (current) {
        current.correlated = current.correlated || detection.correlated
        current.within_fact_window =
          current.within_fact_window || detection.within_fact_window
        const knownMatches = new Set(current.correlationMatches.map(matchKey))
        current.correlationMatches.push(
          ...correlationMatches.filter(
            (match) => !knownMatches.has(matchKey(match)),
          ),
        )
        return
      }
      merged.set(key, {
        ...detection,
        key,
        plate,
        candidate_plate: item.candidate_plate,
        correlationMatches,
      })
    })
  })
  return [...merged.values()].sort(
    (a, b) =>
      parseInstant(a.detected_at).getTime() -
      parseInstant(b.detected_at).getTime(),
  )
}
/** Uma trilha-âncora por fato (entorno) ou por placa vítima (copassagem), seguida das trilhas da correlata. */
function anchorTracks(
  detections: TimelineDetection[],
  cases: TimelineCase[],
): TimelineTrack[] {
  if (!copassagem)
    return cases.map((item, index) => ({
      key: anchorTrackKey(item),
      role: 'fact' as const,
      plate: item.event_id,
      label: cases.length === 1 ? 'Fato' : `Fato ${index + 1}`,
      ...anchorPalettes[index % anchorPalettes.length],
      detections: [],
    }))
  const victimPlates = [
    ...new Set(cases.map((item) => item.victim_plate ?? '')),
  ]
  return victimPlates.map((plate, index) => ({
    key: `victim:${plate}`,
    role: 'victim' as const,
    plate,
    label: victimPlates.length === 1 ? 'Placa vítima' : `Vítima ${index + 1}`,
    ...anchorPalettes[index % anchorPalettes.length],
    detections: detections.filter(
      (item) => item.role === 'victim' && item.plate === plate,
    ),
  }))
}
function buildTimelineTracks(
  detections: TimelineDetection[],
  cases: TimelineCase[],
): TimelineTrack[] {
  const candidatePlates = [
    ...new Set(cases.map((item) => item.candidate_plate)),
  ]
  const candidateTracks = candidatePlates.flatMap((plate) => {
    const plateDetections = detections.filter(
      (item) => item.role === 'candidate' && item.plate === plate,
    )
    const separated = plateDetections.some(
      (item) => item.candidate_trail !== null,
    )
    if (!separated)
      return [
        {
          key: `candidate:${plate}`,
          role: 'candidate' as const,
          plate,
          label: 'Placa correlata',
          color: suspectDark,
          softColor: suspectLight,
          detections: plateDetections,
        },
      ]
    const separatedTracks = (['suspect_1', 'suspect_2'] as const).flatMap(
      (trail) => {
        const trailDetections = plateDetections.filter(
          (item) => item.candidate_trail === trail,
        )
        if (!trailDetections.length) return []
        return [
          {
            key: `candidate:${plate}:${trail}`,
            role: 'candidate' as const,
            plate,
            ...suspectTrailPalettes[trail],
            detections: trailDetections,
          },
        ]
      },
    )
    const unassigned = plateDetections.filter(
      (item) => item.candidate_trail === null,
    )
    return unassigned.length
      ? [
          ...separatedTracks,
          {
            key: `candidate:${plate}`,
            role: 'candidate' as const,
            plate,
            label: 'Correlata · sem atribuição',
            ...unassignedSuspectPalette,
            detections: unassigned,
          },
        ]
      : separatedTracks
  })
  return [...anchorTracks(detections, cases), ...candidateTracks]
}

export function CorrelationPlateTimeline({
  plate,
  initialDay,
  onBack,
}: {
  plate: string
  initialDay?: string | null
  onBack: () => void
}) {
  const [data, setData] = useState<CorrelatedPlateTimelineData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scopeQuery = usePlateScopeQuery()
  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    setError(null)
    getCorrelatedPlateTimeline(plate, scopeQuery, controller.signal)
      .then(setData)
      .catch((reason) => {
        if (reason.name !== 'AbortError')
          setError(
            reason instanceof Error
              ? reason.message
              : 'Falha ao consultar a placa',
          )
      })
    return () => controller.abort()
  }, [plate, scopeQuery])
  const days = useMemo(
    () => [...new Set(data?.cases.map((item) => item.day) || [])],
    [data],
  )
  const windowMinutes = data?.methodology?.fact_window_minutes || 30
  const radiusMeters = copassagem
    ? null
    : data?.methodology?.radius_meters || 1000
  const passageWindowMinutes = data?.methodology?.passage_window_minutes || 10
  const dayMarginMinutes =
    data?.methodology?.day_margin_minutes ??
    windowMinutes + (copassagem ? passageWindowMinutes : 0)
  const buildDay = useCallback(
    (day: string): TimelineDay => {
      const cases = data?.cases.filter((item) => item.day === day) || []
      const detections = mergeDayDetections(cases, passageWindowMinutes)
      return {
        facts: cases,
        detections,
        tracks: buildTimelineTracks(detections, cases),
      }
    },
    [data, passageWindowMinutes],
  )
  // O resumo de cada dia sai uma vez por resposta: a lista de dias (Select do Radix) monta todos os itens mesmo fechada,
  // e o cabeçalho é redesenhado a cada passo da reprodução; refazer as detecções de todos os dias a cada passo travava.
  const dayInfos = useMemo(() => {
    const byDay = new Map<string, CorrelatedPlateTimelineData['cases']>()
    for (const item of data?.cases ?? []) {
      const dayCases = byDay.get(item.day)
      if (dayCases) dayCases.push(item)
      else byDay.set(item.day, [item])
    }
    return new Map(
      [...byDay].map(([day, dayCases]) => [
        day,
        {
          count: mergeDayDetections(dayCases, passageWindowMinutes).length,
          modalities: [
            ...new Set(dayCases.map((item) => item.modality).filter(Boolean)),
          ].sort() as string[],
        },
      ]),
    )
  }, [data, passageWindowMinutes])
  const dayInfo = useCallback(
    (day: string) => dayInfos.get(day) ?? { count: 0, modalities: [] },
    [dayInfos],
  )
  return (
    <TimelineView
      eyebrow="Timeline de detecções"
      title={plate}
      summary={(day, margin) => (
        <>
          <b>{day.detections.length}</b> detecções · <b>{day.facts.length}</b>{' '}
          {day.facts.length === 1 ? 'ocorrência' : 'ocorrências'} · 00h–24h ±
          {margin} min
        </>
      )}
      headerAside={<AuthorCitations citations={data?.author_citations} />}
      backLabel="Voltar para o perfil da placa"
      onBack={onBack}
      error={error}
      loading={!data}
      loadingTitle="Montando a timeline de 24 horas"
      loadingText={
        copassagem
          ? 'Consultando todas as detecções do dia para a correlata e as vítimas…'
          : 'Consultando todas as detecções da placa nos dias dos fatos…'
      }
      empty={
        <>
          <strong>Nenhum fato desta placa no recorte global</strong>
          <span>
            A timeline segue o recorte do perfil: volte ao perfil e use “Ver
            todos os fatos” para ignorá-lo.
          </span>
        </>
      }
      days={days}
      initialDay={initialDay}
      dayInfo={dayInfo}
      buildDay={buildDay}
      windowMinutes={windowMinutes}
      radiusMeters={radiusMeters}
      dayMarginMinutes={dayMarginMinutes}
    />
  )
}
