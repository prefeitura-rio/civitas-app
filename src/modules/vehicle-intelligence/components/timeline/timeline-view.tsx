/**
 * Timeline de 24 horas: mapa, player e sequência do dia. Uma tela para a placa (perfil de placa) e para o grupo
 * (perfil do grupo): quem usa monta os fatos, as leituras e as trilhas de cada dia; o grupo acrescenta, pelos dados,
 * as passagens juntas, as partidas e as desconexões.
 */
import { LoaderCircle, Radar } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ReadError } from '@/modules/vehicle-intelligence/components/error-banner'
import {
  anchorTrackKey,
  factKey,
  trackKey,
} from '@/modules/vehicle-intelligence/components/timeline/correlation'
import { CaseMap } from '@/modules/vehicle-intelligence/components/timeline/day/case-map'
import {
  compareEvents,
  type FactEvent,
  type TimelineEvent,
} from '@/modules/vehicle-intelligence/components/timeline/day/events'
import { stepMotionMs } from '@/modules/vehicle-intelligence/components/timeline/day/map-motion'
import { SequencePanel } from '@/modules/vehicle-intelligence/components/timeline/day/sequence-panel'
import { TimelineHeader } from '@/modules/vehicle-intelligence/components/timeline/day/timeline-header'
import { TimelinePlayer } from '@/modules/vehicle-intelligence/components/timeline/day/timeline-player'
import { detectionPoint } from '@/modules/vehicle-intelligence/components/timeline/geo'
import {
  anchorPalettes,
  suspectDark,
  suspectLight,
} from '@/modules/vehicle-intelligence/components/timeline/palette'
import type {
  CrimeSite,
  TimelineDay,
  TimelineDayInfo,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { parseInstant } from '@/modules/vehicle-intelligence/lib/dates'

const timelineColorVariables = {
  '--timeline-victim-primary': anchorPalettes[0].color,
  '--timeline-victim-primary-soft': anchorPalettes[0].softColor,
  '--timeline-candidate': suspectDark,
  '--timeline-candidate-soft': suspectLight,
} as CSSProperties

export interface TimelineViewProps {
  eyebrow: string
  title: ReactNode
  /** Resumo do dia em foco, ao lado do título. */
  summary?: (day: TimelineDay, dayMarginMinutes: number) => ReactNode
  /** Abaixo do cabeçalho (os ROs que citam a placa). */
  headerAside?: ReactNode
  backLabel: string
  onBack: () => void
  error: string | null
  loading: boolean
  loadingTitle: string
  loadingText: string
  empty: ReactNode
  days: string[]
  initialDay?: string | null
  dayInfo: (day: string) => TimelineDayInfo
  /** Fatos, leituras e trilhas do dia; precisa ser estável (useCallback) entre renderizações. */
  buildDay: (day: string) => TimelineDay
  windowMinutes: number
  radiusMeters: number | null
  dayMarginMinutes: number
}

const EMPTY_DAY: TimelineDay = { facts: [], detections: [], tracks: [] }

export function TimelineView({
  eyebrow,
  title,
  summary,
  headerAside,
  backLabel,
  onBack,
  error,
  loading,
  loadingTitle,
  loadingText,
  empty,
  days,
  initialDay,
  dayInfo,
  buildDay,
  windowMinutes,
  radiusMeters,
  dayMarginMinutes,
}: TimelineViewProps) {
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set())
  const [cursorMoment, setCursorMoment] = useState(0)
  const [cursorEventKey, setCursorEventKey] = useState<string | null>(null)
  const [scrubbing, setScrubbing] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(850)
  const activeRowRef = useRef<HTMLButtonElement>(null)
  const sequenceListRef = useRef<HTMLDivElement>(null)
  const initializedDayRef = useRef('')
  // Dados novos: o dia pedido na rota, se existir; senão o primeiro.
  useEffect(() => {
    setSelectedDay(
      initialDay && days.includes(initialDay) ? initialDay : days[0] || '',
    )
  }, [days, initialDay])
  const day = useMemo(
    () => (selectedDay ? buildDay(selectedDay) : EMPTY_DAY),
    [buildDay, selectedDay],
  )
  const { facts: cases, detections: dayDetections, tracks } = day
  const trackByKey = useMemo(
    () => new Map(tracks.map((track) => [track.key, track])),
    [tracks],
  )
  const orderedDetections = useMemo(
    () =>
      dayDetections.filter((detection) =>
        selectedTracks.has(trackKey(detection)),
      ),
    [dayDetections, selectedTracks],
  )
  const factEvents = useMemo<FactEvent[]>(
    () =>
      cases.flatMap((item) => {
        const track = trackByKey.get(anchorTrackKey(item))
        if (!track || !selectedTracks.has(track.key)) return []
        return [
          {
            kind: 'fact',
            key: factKey(item),
            occurredAt: item.event_time,
            case: item,
            track,
          },
        ]
      }),
    [cases, selectedTracks, trackByKey],
  )
  const orderedEvents = useMemo<TimelineEvent[]>(
    () =>
      [
        ...orderedDetections.map(
          (detection): TimelineEvent => ({
            kind: 'detection',
            key: detection.key,
            occurredAt: detection.detected_at,
            detection,
          }),
        ),
        ...factEvents,
      ].sort(compareEvents),
    [factEvents, orderedDetections],
  )
  // A janela do fato (e, em copassagem, a da passagem) atravessa a meia-noite,
  // então o dia em foco começa antes de 00h e termina depois de 24h.
  const dayMarginMs = dayMarginMinutes * 60 * 1000
  const civilDayStart = selectedDay
    ? new Date(`${selectedDay}T00:00:00-03:00`).getTime()
    : 0
  const dayStart = civilDayStart - dayMarginMs
  const dayEnd = civilDayStart + 24 * 60 * 60 * 1000 + dayMarginMs
  const currentMoment = Math.max(
    dayStart,
    Math.min(dayEnd, cursorMoment || dayStart),
  )
  const keyedEventIndex = cursorEventKey
    ? orderedEvents.findIndex((item) => item.key === cursorEventKey)
    : -1
  const revealedEventIndex =
    keyedEventIndex >= 0 &&
    parseInstant(orderedEvents[keyedEventIndex].occurredAt).getTime() ===
      currentMoment
      ? keyedEventIndex
      : orderedEvents.reduce(
          (latest, item, index) =>
            parseInstant(item.occurredAt).getTime() <= currentMoment
              ? index
              : latest,
          -1,
        )
  const revealedEvents = useMemo(
    () => orderedEvents.slice(0, revealedEventIndex + 1),
    [orderedEvents, revealedEventIndex],
  )
  const visibleKeys = useMemo(
    () =>
      new Set(
        revealedEvents
          .filter(
            (item): item is Extract<TimelineEvent, { kind: 'detection' }> =>
              item.kind === 'detection',
          )
          .map((item) => item.detection.key),
      ),
    [revealedEvents],
  )
  const revealedFactEvents = useMemo(
    () =>
      revealedEvents.filter((item): item is FactEvent => item.kind === 'fact'),
    [revealedEvents],
  )
  const visibleFactKeys = useMemo(
    () => new Set(revealedFactEvents.map((item) => item.key)),
    [revealedFactEvents],
  )
  const crimeSites = useMemo<CrimeSite[]>(
    () =>
      revealedFactEvents.flatMap((event) => {
        const item = event.case
        if (
          !Number.isFinite(item.event_latitude) ||
          !Number.isFinite(item.event_longitude)
        )
          return []
        return [
          {
            case: item,
            track: event.track,
            position: [
              item.event_latitude as number,
              item.event_longitude as number,
            ],
          },
        ]
      }),
    [revealedFactEvents],
  )
  const viewportPositions = useMemo<[number, number][]>(
    () => [
      ...crimeSites.map((site) => site.position),
      ...dayDetections
        .filter(
          (item) =>
            visibleKeys.has(item.key) &&
            Number.isFinite(item.latitude) &&
            Number.isFinite(item.longitude),
        )
        .slice(-10)
        .map(detectionPoint),
    ],
    [crimeSites, dayDetections, visibleKeys],
  )
  const activeEvent =
    revealedEventIndex >= 0 ? orderedEvents[revealedEventIndex] : null
  const activeDetection =
    activeEvent?.kind === 'detection' ? activeEvent.detection : null
  const activeFactKey = activeEvent?.kind === 'fact' ? activeEvent.key : null
  useEffect(() => {
    setSelectedTracks(new Set(tracks.map((track) => track.key)))
  }, [tracks])
  useEffect(() => {
    initializedDayRef.current = ''
    setCursorMoment(dayStart)
    setCursorEventKey(null)
    setPlaying(false)
  }, [dayStart, selectedDay])
  useEffect(() => {
    const first = orderedEvents[0]
    if (!first || !selectedDay || initializedDayRef.current === selectedDay)
      return
    initializedDayRef.current = selectedDay
    setCursorMoment(parseInstant(first.occurredAt).getTime())
    setCursorEventKey(first.key)
  }, [orderedEvents, selectedDay])
  useEffect(() => {
    if (!playing || !orderedEvents.length) return
    const delay =
      orderedEvents[revealedEventIndex]?.kind === 'fact'
        ? Math.max(1500, speed * 2)
        : speed
    const timer = window.setTimeout(() => {
      const next = orderedEvents[revealedEventIndex + 1]
      if (!next) {
        setPlaying(false)
        setCursorMoment(dayEnd)
        setCursorEventKey(null)
        return
      }
      setCursorMoment(parseInstant(next.occurredAt).getTime())
      setCursorEventKey(next.key)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [dayEnd, orderedEvents, playing, revealedEventIndex, speed])
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName.toLowerCase()
      if (
        ['input', 'select', 'textarea', 'button'].includes(tag || '') ||
        target?.isContentEditable ||
        target?.closest('[role="slider"]') ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        move(revealedEventIndex + (event.key === 'ArrowLeft' ? -1 : 1))
      } else if (event.code === 'Space' && orderedEvents.length) {
        event.preventDefault()
        if (
          !playing &&
          currentMoment >=
            parseInstant(orderedEvents.at(-1)?.occurredAt || '').getTime()
        ) {
          setCursorMoment(parseInstant(orderedEvents[0].occurredAt).getTime())
          setCursorEventKey(orderedEvents[0].key)
        }
        setPlaying((value) => !value)
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  })
  useEffect(() => {
    const row = activeRowRef.current
    const list = sequenceListRef.current
    if (!row || !list) return
    const rowTop = row.offsetTop
    const rowBottom = rowTop + row.offsetHeight
    const visibleTop = list.scrollTop
    const visibleBottom = visibleTop + list.clientHeight
    if (rowTop < visibleTop)
      list.scrollTo({
        top: Math.max(0, rowTop - 8),
        behavior: playing ? 'smooth' : 'auto',
      })
    else if (rowBottom > visibleBottom)
      list.scrollTo({
        top: rowBottom - list.clientHeight + 8,
        behavior: playing ? 'smooth' : 'auto',
      })
  }, [revealedEventIndex, playing])
  const move = (next: number) => {
    setPlaying(false)
    if (next < 0) {
      const first = orderedEvents[0]
      setCursorMoment(
        first ? parseInstant(first.occurredAt).getTime() : dayStart,
      )
      setCursorEventKey(first?.key || null)
      return
    }
    const item = orderedEvents[Math.min(orderedEvents.length - 1, next)]
    if (item) {
      setCursorMoment(parseInstant(item.occurredAt).getTime())
      setCursorEventKey(item.key)
    }
  }
  /** Liga ou desliga trilhas (o cartão dos fatos do grupo mexe em todas de uma vez); ao menos uma trilha fica ativa. */
  const toggleTracks = (keys: string[]) => {
    setSelectedTracks((current) => {
      const next = new Set(current)
      const active = keys.some((key) => next.has(key))
      if (active) keys.forEach((key) => next.delete(key))
      else keys.forEach((key) => next.add(key))
      return next.size ? next : current
    })
    setPlaying(false)
  }
  return (
    <section
      className="timeline-analysis-shell correlation-timeline-shell"
      style={timelineColorVariables}
    >
      <TimelineHeader
        eyebrow={eyebrow}
        title={title}
        summary={summary}
        headerAside={headerAside}
        backLabel={backLabel}
        onBack={onBack}
        loading={loading}
        days={days}
        dayInfo={dayInfo}
        dayMarginMinutes={dayMarginMinutes}
        day={day}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />
      {error && <ReadError message={error} />}
      {loading && !error && (
        <div className="timeline-loading" role="status">
          <LoaderCircle className="animate-spin" size={25} />
          <strong>{loadingTitle}</strong>
          <span>{loadingText}</span>
        </div>
      )}
      {!loading &&
        !error &&
        (days.length === 0 ? (
          <div className="timeline-no-data">
            <Radar />
            {empty}
          </div>
        ) : (
          selectedDay && (
            <div className="timeline-analysis-grid">
              <main className="timeline-map-stage-wrap">
                <CaseMap
                  crimeSites={crimeSites}
                  tracks={tracks}
                  facts={cases}
                  visibleKeys={visibleKeys}
                  viewportPositions={viewportPositions}
                  activeKey={activeDetection?.key || null}
                  activeFactKey={activeFactKey}
                  selectedTracks={selectedTracks}
                  followView={!scrubbing}
                  onToggleTracks={toggleTracks}
                  moment={currentMoment}
                  windowMinutes={windowMinutes}
                  radiusMeters={radiusMeters}
                  motionMs={stepMotionMs({ playing, speed, scrubbing })}
                  dayKey={selectedDay}
                />
                <TimelinePlayer
                  orderedEvents={orderedEvents}
                  orderedDetections={orderedDetections}
                  factEvents={factEvents}
                  tracks={tracks}
                  trackByKey={trackByKey}
                  visibleKeys={visibleKeys}
                  visibleFactKeys={visibleFactKeys}
                  activeFactKey={activeFactKey}
                  revealedEventIndex={revealedEventIndex}
                  currentMoment={currentMoment}
                  dayStart={dayStart}
                  dayEnd={dayEnd}
                  dayMarginMinutes={dayMarginMinutes}
                  playing={playing}
                  speed={speed}
                  setSpeed={setSpeed}
                  setPlaying={setPlaying}
                  setScrubbing={setScrubbing}
                  setCursorMoment={setCursorMoment}
                  setCursorEventKey={setCursorEventKey}
                  move={move}
                />
              </main>
              <SequencePanel
                selectedDay={selectedDay}
                orderedEvents={orderedEvents}
                revealedEventIndex={revealedEventIndex}
                tracks={tracks}
                trackByKey={trackByKey}
                currentMoment={currentMoment}
                windowMinutes={windowMinutes}
                dayMarginMinutes={dayMarginMinutes}
                move={move}
                activeRowRef={activeRowRef}
                sequenceListRef={sequenceListRef}
              />
            </div>
          )
        ))}
    </section>
  )
}
