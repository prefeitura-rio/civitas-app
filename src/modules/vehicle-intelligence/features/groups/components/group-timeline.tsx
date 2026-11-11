/**
 * Timeline do grupo: todas as placas do grupo em cada dia com RO, com as passagens juntas (mesmo equipamento, até
 * 3 min), as partidas e as desconexões, na tela de faixas por placa (`GroupTimelineView`, handoff 2b de 11/10).
 * As cores das placas são as do perfil do grupo.
 */
import '@/modules/vehicle-intelligence/components/groups/groups.css'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { plateColor } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { GroupTimelineView } from '@/modules/vehicle-intelligence/components/timeline/group-timeline-view'
import {
  groupFactPalette,
  lighten,
} from '@/modules/vehicle-intelligence/components/timeline/palette'
import type {
  TimelineCase,
  TimelineDay,
  TimelineDetection,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import {
  getGroupProfile,
  getGroupTimeline,
  groupLabel,
  platesFromGroupId,
  useGroupFilters,
} from '@/modules/vehicle-intelligence/features/groups/api'
import type { CrimeType } from '@/modules/vehicle-intelligence/types/domain'
import type {
  GroupProfileData,
  GroupTimelineData,
  GroupTimelineEvent,
} from '@/modules/vehicle-intelligence/types/groups'

function toTimelineCase(groupEvent: GroupTimelineEvent): TimelineCase {
  return {
    event_id: groupEvent.event_id,
    ro: groupEvent.ro,
    candidate_plate: '',
    event_time: groupEvent.occurred_at,
    correlations: 0,
    fact_window_start: '',
    fact_window_end: '',
    day: groupEvent.day,
    modality: (groupEvent.modality ?? '') as CrimeType,
    target_category: groupEvent.category ?? '',
    event_latitude: groupEvent.latitude,
    event_longitude: groupEvent.longitude,
    event_address: groupEvent.address,
    geocode_quality: groupEvent.geocode_quality,
    detections: [],
    event_cisp: groupEvent.cisp ?? undefined,
    offender_mode: groupEvent.offender_mode,
    crime_type: groupEvent.crime_type,
    event_neighborhood: groupEvent.neighborhood,
    group: {
      plates: groupEvent.plates,
      pairs: groupEvent.pairs,
      departures: groupEvent.departures,
      disconnections: groupEvent.disconnections,
    },
  }
}

export function GroupTimeline({
  id,
  label,
  initialDay,
  onBack,
}: {
  id: string
  label?: string | null
  initialDay?: string | null
  onBack: () => void
}) {
  const filters = useGroupFilters()
  const plates = useMemo(() => platesFromGroupId(id), [id])
  const [profile, setProfile] = useState<GroupProfileData | null>(null)
  const [data, setData] = useState<GroupTimelineData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(
    label ?? null,
  )
  useEffect(() => {
    // O perfil dá a ordem dos membros (e com ela as cores) e os papéis; quem vem do perfil já o tem guardado.
    const controller = new AbortController()
    setProfile(null)
    setData(null)
    setError(null)
    Promise.all([
      getGroupProfile(plates, filters, controller.signal),
      getGroupTimeline(plates, filters, controller.signal),
    ])
      .then(([profileResult, timelineResult]) => {
        if (!controller.signal.aborted) {
          setProfile(profileResult)
          setData(timelineResult)
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : 'Falha na consulta do grupo',
          )
      })
    return () => controller.abort()
  }, [plates, filters])
  useEffect(() => {
    if (label) {
      setResolvedLabel(label)
      return
    }
    const controller = new AbortController()
    groupLabel(id, filters, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setResolvedLabel(value)
      })
      .catch(() => null)
    return () => controller.abort()
  }, [id, label, filters])
  const ready = Boolean(profile?.ready && data?.ready)
  const members = useMemo(
    () => (ready ? (profile?.members ?? []) : []),
    [profile, ready],
  )
  const colors = useMemo(
    () =>
      Object.fromEntries(
        members.map((member, index) => [member.plate, plateColor(index)]),
      ),
    [members],
  )
  const dayStats = useMemo(
    () =>
      new Map((ready ? (data?.days ?? []) : []).map((day) => [day.day, day])),
    [data, ready],
  )
  const days = useMemo(() => [...dayStats.keys()], [dayStats])
  const eventsByDay = useMemo(() => {
    const byDay = new Map<string, GroupTimelineEvent[]>()
    ;(data?.events ?? []).forEach((groupEvent) =>
      byDay.set(groupEvent.day, [
        ...(byDay.get(groupEvent.day) ?? []),
        groupEvent,
      ]),
    )
    return byDay
  }, [data])
  const factTimeById = useMemo(
    () =>
      new Map(
        (data?.events ?? []).map((groupEvent) => [
          groupEvent.event_id,
          groupEvent.occurred_at,
        ]),
      ),
    [data],
  )
  const buildDay = useCallback(
    (day: string): TimelineDay => {
      const facts = (eventsByDay.get(day) ?? []).map(toTimelineCase)
      const detections: TimelineDetection[] = (data?.detections[day] ?? []).map(
        (detection) => ({
          event_id: '',
          role: 'candidate',
          detected_at: detection.detected_at,
          point_id: detection.point_id,
          camera: detection.camera,
          latitude: detection.latitude,
          longitude: detection.longitude,
          location: detection.location,
          neighborhood: detection.neighborhood,
          direction: detection.direction,
          within_fact_window: detection.within_fact_window,
          correlated: detection.correlated,
          fact_distance_meters: detection.matches.length
            ? Math.min(
                ...detection.matches.map(
                  (item) => item.distance_meters ?? Infinity,
                ),
              )
            : null,
          candidate_trail: null,
          candidate_trail_kind: null,
          key: `candidate|${detection.plate}|${detection.detected_at}|${detection.point_id}|${detection.camera}|${detection.direction}`,
          plate: detection.plate,
          candidate_plate: detection.plate,
          correlationMatches: detection.matches.map((item) => ({
            eventId: item.event_id,
            anchorKey: `fact:${item.event_id}`,
            candidateDetectedAt: detection.detected_at,
            eventTime: factTimeById.get(item.event_id) ?? detection.detected_at,
            distanceMeters: item.distance_meters,
          })),
          together: detection.together,
          marks: detection.marks,
          together_id: detection.together_id,
        }),
      )
      const tracks: TimelineTrack[] = [
        ...facts.map((item, index) => ({
          key: `fact:${item.event_id}`,
          role: 'fact' as const,
          plate: item.ro ?? item.event_id,
          label: facts.length === 1 ? 'Fato' : `Fato ${index + 1}`,
          ...groupFactPalette,
          detections: [],
        })),
        // Todas as placas do grupo lidas no dia, tenham ou não RO nele, na ordem do perfil.
        ...members.flatMap((member) => {
          const plateDetections = detections.filter(
            (item) => item.plate === member.plate,
          )
          if (!plateDetections.length) return []
          const color = colors[member.plate]
          return [
            {
              key: `candidate:${member.plate}`,
              role: 'candidate' as const,
              plate: member.plate,
              label: member.seed ? 'Semente' : 'Parceira',
              color,
              softColor: lighten(color),
              detections: plateDetections,
            },
          ]
        }),
      ]
      return { facts, detections, tracks }
    },
    [colors, data, eventsByDay, factTimeById, members],
  )
  const dayInfo = useCallback(
    (day: string) => ({
      events: dayStats.get(day)?.events ?? 0,
      detections: dayStats.get(day)?.detections ?? 0,
      modalities: [
        ...new Set(
          (eventsByDay.get(day) ?? [])
            .map((groupEvent) => groupEvent.modality)
            .filter((value): value is string => Boolean(value)),
        ),
      ].sort(),
      plates: (dayStats.get(day)?.plates_with_events ?? []).map((plate) => ({
        plate,
        color: colors[plate],
      })),
    }),
    [colors, dayStats, eventsByDay],
  )
  const dayFilter = useMemo(
    () => ({
      label: 'Só 2+ placas',
      title:
        'Mostrar só os dias em que duas ou mais placas do grupo estão em RO',
      test: (day: string) =>
        (dayStats.get(day)?.plates_with_events.length ?? 0) >= 2,
    }),
    [dayStats],
  )
  const notReady =
    profile && !profile.ready ? profile : data && !data.ready ? data : null
  const methodology = data?.methodology
  return (
    <GroupTimelineView
      title={resolvedLabel ? `Grupo ${resolvedLabel}` : 'Grupo'}
      memberCount={members.length || plates.length}
      backLabel="Voltar para o perfil do grupo"
      onBack={onBack}
      error={error}
      loading={!profile || !data}
      loadingTitle="Montando a timeline do grupo"
      loadingText="Consultando todas as leituras das placas do grupo nos dias dos fatos…"
      empty={
        notReady ? (
          <>
            <strong>{notReady.reason}</strong>
            {notReady.build_command && <code>{notReady.build_command}</code>}
          </>
        ) : (
          <>
            <strong>Nenhum fato do grupo com estes filtros</strong>
            <span>A timeline segue os filtros da página de grupos.</span>
          </>
        )
      }
      days={days}
      initialDay={initialDay}
      dayInfo={dayInfo}
      dayFilter={dayFilter}
      buildDay={buildDay}
      windowMinutes={methodology?.fact_window_minutes ?? 10}
      radiusMeters={methodology ? methodology.radius_meters : 1000}
      dayMarginMinutes={methodology?.day_margin_minutes ?? 60}
    />
  )
}
