import { MapPin } from 'lucide-react'
import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'

import {
  correlationAnchorTracks,
  correlationTrackLabel,
  revealedCorrelationMatches,
  trackKey,
} from '@/modules/vehicle-intelligence/components/timeline/correlation'
import type { TimelineEvent } from '@/modules/vehicle-intelligence/components/timeline/day/events'
import { placeName } from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type { TimelineTrack } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import {
  formatDate,
  formatTimeSeconds,
} from '@/modules/vehicle-intelligence/lib/dates'

/** "RUA DO PARAISO, 78, SANTA TERESA, Rio de Janeiro/RJ" vira "Rua do Paraiso, 78, Santa Teresa". */
const factPlace = (address: string | null | undefined) =>
  placeName((address || '').replace(/,\s*Rio de Janeiro\/RJ\s*$/i, '')) ||
  'Endereço não informado'

/**
 * A sequência do dia, à direita, no padrão do Painel de Clonagem: uma linha por fato ou leitura, com a hora, a ordem, o
 * local em caixa de título e a trilha; só o que foge do comum ganha selo (a leitura ligada a um fato). Um realce só
 * desliza até a linha da vez e a lista rola no mesmo ritmo do mapa (`motionMs`); o clique leva o player até a linha.
 */
export function SequencePanel({
  selectedDay,
  orderedEvents,
  revealedEventIndex,
  tracks,
  trackByKey,
  currentMoment,
  motionMs,
  move,
}: {
  selectedDay: string
  orderedEvents: TimelineEvent[]
  revealedEventIndex: number
  tracks: TimelineTrack[]
  trackByKey: Map<string, TimelineTrack>
  currentMoment: number
  motionMs: number
  move: (next: number) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const activeRowRef = useRef<HTMLButtonElement>(null)
  const scrollFrame = useRef(0)
  // A ordem de cada leitura na trilha dela: o mesmo número do marcador no mapa.
  const orderByKey = useMemo(
    () =>
      new Map(
        tracks.flatMap((track) =>
          track.detections.map((item, index) => [item.key, index + 1] as const),
        ),
      ),
    [tracks],
  )

  useLayoutEffect(() => {
    const row = activeRowRef.current
    const list = listRef.current
    const cursor = cursorRef.current
    if (!list || !cursor) return
    if (!row) {
      cursor.style.height = '0px'
      return
    }
    cursor.style.transitionDuration = `${motionMs}ms`
    cursor.style.transform = `translateY(${row.offsetTop}px)`
    cursor.style.height = `${row.offsetHeight}px`
    // A linha da vez vai para o meio da lista, no mesmo tempo do passo do mapa.
    const target = Math.max(
      0,
      Math.min(
        list.scrollHeight - list.clientHeight,
        row.offsetTop + row.offsetHeight / 2 - list.clientHeight / 2,
      ),
    )
    window.cancelAnimationFrame(scrollFrame.current)
    const from = list.scrollTop
    const distance = target - from
    if (!motionMs || Math.abs(distance) < 1) {
      list.scrollTop = target
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / motionMs)
      list.scrollTop = from + distance * (1 - (1 - progress) ** 3)
      if (progress < 1) scrollFrame.current = window.requestAnimationFrame(tick)
    }
    scrollFrame.current = window.requestAnimationFrame(tick)
  }, [revealedEventIndex, selectedDay, orderedEvents.length, motionMs])
  useEffect(() => () => window.cancelAnimationFrame(scrollFrame.current), [])

  return (
    <aside className="timeline-sequence-panel">
      <header>
        <div>
          <strong>Sequência do dia</strong>
          <span>
            {formatDate(selectedDay)} · {orderedEvents.length} eventos
          </span>
        </div>
      </header>
      <div className="timeline-sequence-list" ref={listRef}>
        <div className="timeline-sequence-track">
          <span
            className="sequence-cursor"
            ref={cursorRef}
            aria-hidden="true"
          />
          {orderedEvents.map((event, index) => {
            const active = index === revealedEventIndex
            const state = `${active ? ' active' : ''}${index > revealedEventIndex ? ' future' : ''}`
            if (event.kind === 'fact') {
              const item = event.case
              const ro = copassagem ? item.ro : (item.ro ?? item.event_id)
              return (
                <button
                  ref={active ? activeRowRef : null}
                  key={event.key}
                  type="button"
                  className={`sequence-row fact${state}`}
                  style={
                    { '--row-color': event.track.softColor } as CSSProperties
                  }
                  aria-current={active ? 'step' : undefined}
                  onClick={() => move(index)}
                >
                  <span className="sequence-when">
                    <strong>{formatTimeSeconds(event.occurredAt)}</strong>
                    <small>{event.track.label}</small>
                  </span>
                  <span className="sequence-body">
                    <span className="sequence-place">
                      {factPlace(item.event_address)}
                    </span>
                    <span className="sequence-meta">
                      <MapPin
                        className="sequence-pin"
                        size={12}
                        aria-hidden="true"
                      />
                      <span>{item.crime_type || 'Ocorrência'}</span>
                      {ro && <span className="sequence-source">RO {ro}</span>}
                    </span>
                  </span>
                </button>
              )
            }
            const detection = event.detection
            const track = trackByKey.get(trackKey(detection))
            const matches =
              index <= revealedEventIndex
                ? revealedCorrelationMatches(detection, currentMoment)
                : []
            const anchor = correlationAnchorTracks(matches, tracks)[0]
            const neighborhood = placeName(detection.neighborhood)
            return (
              <button
                ref={active ? activeRowRef : null}
                key={event.key}
                type="button"
                className={`sequence-row ${detection.role}${anchor ? ' correlated' : ''}${state}`}
                aria-current={active ? 'step' : undefined}
                onClick={() => move(index)}
              >
                <span className="sequence-when">
                  <strong>{formatTimeSeconds(detection.detected_at)}</strong>
                  <small>{orderByKey.get(detection.key) ?? index + 1}ª</small>
                </span>
                <span className="sequence-body">
                  <span className="sequence-place">
                    {placeName(detection.location) || detection.point_id}
                  </span>
                  <span className="sequence-meta">
                    <i
                      className={`sequence-dot${detection.within_fact_window ? '' : ' hollow'}`}
                      style={{ '--dot': track?.softColor } as CSSProperties}
                      aria-hidden="true"
                    />
                    <span>{track?.label ?? detection.plate}</span>
                    {neighborhood && (
                      <span className="sequence-source">{neighborhood}</span>
                    )}
                    {anchor && (
                      <small
                        className="correlated-tag"
                        style={{ color: anchor.softColor }}
                      >
                        {correlationTrackLabel(matches, tracks)}
                      </small>
                    )}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
