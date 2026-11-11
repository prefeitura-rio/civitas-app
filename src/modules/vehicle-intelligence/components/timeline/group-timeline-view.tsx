/**
 * Timeline do grupo, direção 2b do handoff de 11/10 ("faixas por placa"): o mapa do dia com a passagem junta como um
 * marcador só, partida e desconexão com símbolo próprio e rótulos fixos; embaixo, o player e uma faixa de tempo por placa
 * (que liga e desliga a placa); à direita, a sequência enxuta, com uma linha por passagem junta.
 *
 * Os popups de clique, os rótulos de dia e os tipos vêm das peças comuns da timeline (`popups/`, `timeline-format.ts`,
 * `timeline-types.ts`); as peças desta tela ficam em `group/`.
 */
import '@/modules/vehicle-intelligence/components/timeline/group-timeline.css'

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  buildEvents,
  type GroupEvent,
} from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { GroupDayMap } from '@/modules/vehicle-intelligence/components/timeline/group/group-day-map'
import { GroupTimelineHeader } from '@/modules/vehicle-intelligence/components/timeline/group/group-header'
import { PlateLanes } from '@/modules/vehicle-intelligence/components/timeline/group/plate-lanes'
import { PlayerControls } from '@/modules/vehicle-intelligence/components/timeline/group/player-controls'
import { GroupSequencePanel } from '@/modules/vehicle-intelligence/components/timeline/group/sequence-panel'
import { timeRange } from '@/modules/vehicle-intelligence/components/timeline/group/time'
import type { TimelineDay } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { dayStartMs } from '@/modules/vehicle-intelligence/lib/dates'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

export type GroupDayInfo = {
  events: number
  detections: number
  modalities: string[]
  plates: Array<{ plate: string; color: string }>
}

export interface GroupTimelineViewProps {
  title: string
  memberCount: number
  backLabel: string
  onBack: () => void
  error: string | null
  loading: boolean
  loadingTitle: string
  loadingText: string
  empty: ReactNode
  days: string[]
  initialDay?: string | null
  dayInfo: (day: string) => GroupDayInfo
  dayFilter: { label: string; title: string; test: (day: string) => boolean }
  /** Fatos, leituras e trilhas do dia; precisa ser estável (useCallback). */
  buildDay: (day: string) => TimelineDay
  windowMinutes: number
  /** Raio do entorno do fato (transeuntes); nulo na copassagem (veículos e carga), sem círculo no mapa. */
  radiusMeters: number | null
  dayMarginMinutes: number
}

export function GroupTimelineView({
  title,
  memberCount,
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
  dayFilter,
  buildDay,
  windowMinutes,
  radiusMeters,
  dayMarginMinutes,
}: GroupTimelineViewProps) {
  const [selectedDay, setSelectedDay] = useState('')
  const [onlyMultiPlateDays, setOnlyMultiPlateDays] = useState(false)
  const [disabledPlates, setDisabledPlates] = useState<Set<string>>(new Set())
  const [moment, setMoment] = useState(0)
  const [cursorKey, setCursorKey] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(850)
  const [range, setRange] = useState<'period' | 'day'>('period')
  const [listFilter, setListFilter] = useState<'all' | 'marks'>('all')
  const listRef = useRef<HTMLDivElement>(null)
  const timeAreaRef = useRef<HTMLDivElement>(null)
  const [timeAreaWidth, setTimeAreaWidth] = useState(0)
  const visibleDays = useMemo(
    () => (onlyMultiPlateDays ? days.filter(dayFilter.test) : days),
    [dayFilter, days, onlyMultiPlateDays],
  )
  useEffect(() => {
    setSelectedDay(
      initialDay && days.includes(initialDay) ? initialDay : days[0] || '',
    )
  }, [days, initialDay])
  // Com o filtro de dias ligado, um dia que saiu da lista dá lugar ao primeiro que ficou.
  useEffect(() => {
    if (selectedDay && visibleDays.length && !visibleDays.includes(selectedDay))
      setSelectedDay(visibleDays[0])
  }, [selectedDay, visibleDays])
  const day = useMemo<TimelineDay>(
    () =>
      selectedDay
        ? buildDay(selectedDay)
        : { facts: [], detections: [], tracks: [] },
    [buildDay, selectedDay],
  )
  const plateTracks = useMemo(
    () => day.tracks.filter((t) => t.role === 'candidate'),
    [day],
  )
  const colors = useMemo(
    () => new Map(plateTracks.map((t) => [t.plate, t.color])),
    [plateTracks],
  )
  const enabledPlates = useMemo(
    () =>
      new Set(
        plateTracks.map((t) => t.plate).filter((p) => !disabledPlates.has(p)),
      ),
    [plateTracks, disabledPlates],
  )
  const factLabels = useMemo(
    () =>
      new Map(
        day.tracks
          .filter((t) => t.role === 'fact')
          .map((t) => [t.key.slice('fact:'.length), t.label]),
      ),
    [day],
  )
  const events = useMemo(
    () => buildEvents(day, enabledPlates, factLabels),
    [day, enabledPlates, factLabels],
  )
  const eventByDetection = useMemo(
    () =>
      new Map(
        events.flatMap((e) =>
          e.detections.map((detection) => [detection.key, e] as const),
        ),
      ),
    [events],
  )
  // Faixa de tempo: o período com leituras (20 min de folga, horas cheias) ou o dia inteiro com a margem.
  const civilDayStart = selectedDay ? dayStartMs(selectedDay) : 0
  const [rangeStart, rangeEnd] = useMemo(
    () => timeRange(day, range, civilDayStart, dayMarginMinutes),
    [range, day, civilDayStart, dayMarginMinutes],
  )
  const keyedIndex = cursorKey
    ? events.findIndex((e) => e.key === cursorKey)
    : -1
  const activeIndex =
    keyedIndex >= 0 && Math.abs(events[keyedIndex].at - moment) < 1
      ? keyedIndex
      : events.reduce(
          (latest, e, i) => (e.at <= moment + 1e-6 ? i : latest),
          -1,
        )
  const activeKey = activeIndex >= 0 ? events[activeIndex].key : null
  const revealed = useMemo(
    () => events.filter((e) => e.at <= moment + 1e-6),
    [events, moment],
  )
  const goTo = useCallback((e: GroupEvent) => {
    setMoment(e.at)
    setCursorKey(e.key)
    setPlaying(false)
  }, [])
  const step = (d: number) => {
    const n = events[Math.max(0, Math.min(events.length - 1, activeIndex + d))]
    if (n) goTo(n)
  }
  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (events.length && activeIndex >= events.length - 1) {
      setMoment(events[0].at)
      setCursorKey(events[0].key)
    }
    setPlaying(true)
  }
  // Dia novo: placas todas ligadas e o cursor no primeiro evento.
  useEffect(() => {
    setDisabledPlates(new Set())
    setPlaying(false)
  }, [selectedDay])
  const initializedDayRef = useRef('')
  useEffect(() => {
    if (
      !selectedDay ||
      initializedDayRef.current === selectedDay ||
      !events.length
    )
      return
    initializedDayRef.current = selectedDay
    setMoment(events[0].at)
    setCursorKey(events[0].key)
  }, [selectedDay, events])
  useEffect(() => {
    if (!playing) return
    const current = events[activeIndex]
    const delay =
      current && (current.kind === 'fact' || current.kind === 'together')
        ? speed * 1.8
        : speed
    const timer = window.setTimeout(() => {
      const next = events[activeIndex + 1]
      if (!next) {
        setPlaying(false)
        return
      }
      setMoment(next.at)
      setCursorKey(next.key)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [playing, events, activeIndex, speed])
  useEffect(() => {
    const handleKeyboard = (keyEvent: KeyboardEvent) => {
      const target = keyEvent.target as HTMLElement | null
      const tag = target?.tagName.toLowerCase()
      if (
        ['input', 'textarea', 'select'].includes(tag || '') ||
        target?.isContentEditable ||
        keyEvent.altKey ||
        keyEvent.ctrlKey ||
        keyEvent.metaKey
      )
        return
      if (keyEvent.key === 'ArrowRight' || keyEvent.key === 'ArrowLeft') {
        keyEvent.preventDefault()
        step(keyEvent.key === 'ArrowRight' ? 1 : -1)
      } else if (keyEvent.code === 'Space') {
        keyEvent.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  })
  // Largura da área de tempo em px: os rótulos dos fatos precisam saber se cabem lado a lado.
  useEffect(() => {
    const element = timeAreaRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) =>
      setTimeAreaWidth(entry.contentRect.width),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [selectedDay, loading])
  // A lista rola até a linha ativa, também ao trocar o filtro.
  useEffect(() => {
    const list = listRef.current
    const row = list?.querySelector<HTMLElement>('[data-ativo="1"]')
    if (!list || !row) return
    const rowTop = row.offsetTop - list.offsetTop
    const rowBottom = rowTop + row.offsetHeight
    if (rowTop < list.scrollTop)
      list.scrollTo({
        top: Math.max(0, rowTop - 8),
        behavior: playing ? 'smooth' : 'auto',
      })
    else if (rowBottom > list.scrollTop + list.clientHeight)
      list.scrollTo({
        top: rowBottom - list.clientHeight + 8,
        behavior: playing ? 'smooth' : 'auto',
      })
  }, [activeIndex, listFilter, selectedDay, playing])
  const seek = (mouseEvent: React.MouseEvent<HTMLDivElement>) => {
    const box = mouseEvent.currentTarget.getBoundingClientRect()
    const r = Math.max(
      0,
      Math.min(1, (mouseEvent.clientX - box.left) / box.width),
    )
    setMoment(rangeStart + r * (rangeEnd - rangeStart))
    setCursorKey(null)
    setPlaying(false)
  }
  const togglePlate = (plate: string) =>
    setDisabledPlates((current) => {
      const next = new Set(current)
      if (next.has(plate)) next.delete(plate)
      else if (plateTracks.length - next.size > 1) next.add(plate)
      return next
    })

  const togetherEvents = events.filter((e) => e.kind === 'together')
  const enabledDetectionCount = day.detections.filter((detection) =>
    enabledPlates.has(detection.plate),
  ).length
  const summary = `${pluralize(day.facts.length, 'RO', 'ROs')} · ${pluralize(enabledDetectionCount, 'leitura', 'leituras')} · ${enabledPlates.size} de ${memberCount} placas · ${pluralize(togetherEvents.length, 'passagem junta', 'passagens juntas')}, ${togetherEvents.filter((e) => e.inFact).length} no fato`

  return (
    <section className="gt-shell">
      <GroupTimelineHeader
        title={title}
        summary={summary}
        loading={loading}
        backLabel={backLabel}
        onBack={onBack}
        days={days}
        visibleDays={visibleDays}
        dayInfo={dayInfo}
        dayFilter={dayFilter}
        onlyMultiPlateDays={onlyMultiPlateDays}
        setOnlyMultiPlateDays={setOnlyMultiPlateDays}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />
      {error && (
        <div className="error-banner" role="alert">
          <strong>Leitura não concluída</strong>
          <span>{error}</span>
        </div>
      )}
      {loading && !error && (
        <div className="timeline-loading" role="status">
          <strong>{loadingTitle}</strong>
          <span>{loadingText}</span>
        </div>
      )}
      {!loading && !error && days.length === 0 && (
        <div className="timeline-no-data">{empty}</div>
      )}
      {!loading && !error && days.length > 0 && selectedDay && (
        <div className="gt-body">
          <div className="gt-left">
            <GroupDayMap
              day={day}
              events={events}
              revealed={revealed}
              activeKey={activeKey}
              colors={colors}
              enabledPlates={enabledPlates}
              moment={moment}
              windowMinutes={windowMinutes}
              radiusMeters={radiusMeters}
              dayKey={selectedDay}
            />
            <div className="gt-player">
              <PlayerControls
                events={events}
                activeIndex={activeIndex}
                playing={playing}
                togglePlay={togglePlay}
                step={step}
                moment={moment}
                rangeStart={rangeStart}
                range={range}
                setRange={setRange}
                speed={speed}
                setSpeed={setSpeed}
              />
              <PlateLanes
                plateTracks={plateTracks}
                enabledPlates={enabledPlates}
                togglePlate={togglePlate}
                timeAreaRef={timeAreaRef}
                timeAreaWidth={timeAreaWidth}
                seek={seek}
                range={range}
                civilDayStart={civilDayStart}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                moment={moment}
                events={events}
                togetherEvents={togetherEvents}
                eventByDetection={eventByDetection}
                windowMinutes={windowMinutes}
                activeKey={activeKey}
                goTo={goTo}
              />
            </div>
          </div>
          <GroupSequencePanel
            selectedDay={selectedDay}
            events={events}
            activeIndex={activeIndex}
            listFilter={listFilter}
            setListFilter={setListFilter}
            listRef={listRef}
            colors={colors}
            factLabels={factLabels}
            goTo={goTo}
          />
        </div>
      )}
    </section>
  )
}
