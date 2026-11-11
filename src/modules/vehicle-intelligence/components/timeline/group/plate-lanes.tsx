import { type RefObject, useMemo } from 'react'

import {
  detectionKind,
  type GroupEvent,
} from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { layoutFactLabels } from '@/modules/vehicle-intelligence/components/timeline/group/fact-label-layout'
import { SmallPin } from '@/modules/vehicle-intelligence/components/timeline/group/small-pin'
import {
  AXIS_HEIGHT,
  COLORS,
  FACTS_LANE_HEIGHT,
  LANE_HEIGHT,
} from '@/modules/vehicle-intelligence/components/timeline/group/style'
import {
  axisHours,
  type TimeRangeMode,
} from '@/modules/vehicle-intelligence/components/timeline/group/time'
import { lighten } from '@/modules/vehicle-intelligence/components/timeline/palette'
import type { TimelineTrack } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { formatTime, instantMs } from '@/modules/vehicle-intelligence/lib/dates'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

/**
 * As faixas de tempo: os nomes das placas (cada um liga e desliga a placa) e a área do eixo com as horas, a janela de
 * cada fato, os fatos, as passagens juntas, as leituras de cada placa e o cursor. Clicar na área leva o cursor até lá.
 */
export function PlateLanes({
  plateTracks,
  enabledPlates,
  togglePlate,
  timeAreaRef,
  timeAreaWidth,
  seek,
  range,
  civilDayStart,
  rangeStart,
  rangeEnd,
  moment,
  events,
  togetherEvents,
  eventByDetection,
  windowMinutes,
  activeKey,
  goTo,
}: {
  plateTracks: TimelineTrack[]
  enabledPlates: Set<string>
  togglePlate: (plate: string) => void
  timeAreaRef: RefObject<HTMLDivElement>
  timeAreaWidth: number
  seek: (mouseEvent: React.MouseEvent<HTMLDivElement>) => void
  range: TimeRangeMode
  civilDayStart: number
  rangeStart: number
  rangeEnd: number
  moment: number
  events: GroupEvent[]
  togetherEvents: GroupEvent[]
  eventByDetection: Map<string, GroupEvent>
  windowMinutes: number
  activeKey: string | null
  goTo: (e: GroupEvent) => void
}) {
  const hourMarks = useMemo(
    () => axisHours(range, civilDayStart, rangeStart, rangeEnd),
    [range, civilDayStart, rangeStart, rangeEnd],
  )
  const positionPercent = (t: number) =>
    Math.max(
      0,
      Math.min(1, (t - rangeStart) / Math.max(rangeEnd - rangeStart, 1)),
    ) * 100
  const leftPercent = (t: number) => `${positionPercent(t).toFixed(2)}%`
  const reached = (t: number) => t <= moment + 1e-6
  const factEvents = events.filter((e) => e.kind === 'fact')
  const factLabelLayout = layoutFactLabels(
    factEvents,
    positionPercent,
    timeAreaWidth,
  )
  const laneY = new Map(
    plateTracks.map((t, k) => [
      t.plate,
      AXIS_HEIGHT + FACTS_LANE_HEIGHT + LANE_HEIGHT * k + LANE_HEIGHT / 2,
    ]),
  )
  return (
    <div className="gt-bands">
      <div className="gt-nomes">
        <div className="gt-name-facts">
          <SmallPin color="#9fb4ba" />
          Fatos do dia
        </div>
        {plateTracks.map((t) => {
          const n = t.detections.length
          const j = t.detections.filter(
            (detection) => detection.together_id,
          ).length
          const enabled = enabledPlates.has(t.plate)
          return (
            <button
              key={t.key}
              type="button"
              className="gt-name"
              style={{ opacity: enabled ? 1 : 0.4 }}
              aria-pressed={enabled}
              title="Mostrar ou esconder a placa"
              onClick={() => togglePlate(t.plate)}
            >
              <i style={{ background: t.color }} />
              <span>
                <b>{t.plate}</b>
                <small>
                  {t.label} · {pluralize(n, 'leitura', 'leituras')} ·{' '}
                  {pluralize(j, 'junta', 'juntas')}
                </small>
              </span>
            </button>
          )
        })}
      </div>
      <div
        ref={timeAreaRef}
        className="gt-time"
        style={{
          height:
            AXIS_HEIGHT + FACTS_LANE_HEIGHT + LANE_HEIGHT * plateTracks.length,
        }}
        onClick={seek}
        role="slider"
        tabIndex={0}
        aria-label="Horário na faixa de tempo"
        aria-valuemin={rangeStart}
        aria-valuemax={rangeEnd}
        aria-valuenow={moment}
        aria-valuetext={formatTime(moment)}
      >
        {hourMarks.map((h) => (
          <span
            key={`h${h.at}`}
            className="gt-hour"
            style={{ left: leftPercent(h.at) }}
          >
            {h.label}
          </span>
        ))}
        {hourMarks.map((h) => (
          <i
            key={`g${h.at}`}
            className="gt-grid"
            style={{ left: leftPercent(h.at) }}
          />
        ))}
        {factEvents.map((e) => (
          <div
            key={`b${e.key}`}
            className="gt-window"
            style={{
              left: leftPercent(e.at - windowMinutes * 60_000),
              width: `${(positionPercent(e.at + windowMinutes * 60_000) - positionPercent(e.at - windowMinutes * 60_000)).toFixed(2)}%`,
            }}
          />
        ))}
        {plateTracks.map((t) => (
          <i
            key={`l${t.key}`}
            className="gt-thread"
            style={{
              top: laneY.get(t.plate),
              opacity: enabledPlates.has(t.plate) ? 1 : 0.4,
            }}
          />
        ))}
        {factEvents.map((e, k) => (
          <button
            key={`f${e.key}`}
            type="button"
            title={factLabelLayout[k].fullText}
            aria-label={factLabelLayout[k].fullText}
            className={`gt-fact${activeKey === e.key ? ' active' : ''}${factLabelLayout[k].text ? '' : ' pin-only'}`}
            style={{
              left: leftPercent(e.at),
              transform: factLabelLayout[k].transform,
              opacity: reached(e.at) ? 1 : 0.5,
              zIndex: activeKey === e.key ? 3 : 2,
            }}
            onClick={(x) => {
              x.stopPropagation()
              goTo(e)
            }}
          >
            <SmallPin color="#c9d6d9" />
            {factLabelLayout[k].text}
          </button>
        ))}
        {togetherEvents.map((e) => {
          const ys = e.detections.map(
            (detection) => laneY.get(detection.plate) ?? 0,
          )
          const a = Math.min(...ys)
          const b = Math.max(...ys)
          return (
            <i
              key={`j${e.key}`}
              className="gt-joint-row"
              style={{
                left: leftPercent(e.at),
                top: a,
                height: b - a,
                borderLeft: e.inFact
                  ? `3px solid ${COLORS.passage}`
                  : `2px dashed ${COLORS.passage}`,
                opacity: reached(e.at) ? 1 : 0.4,
              }}
            />
          )
        })}
        {plateTracks.map((t) =>
          t.detections.map((detection) => {
            const e = eventByDetection.get(detection.key)
            const kind = detectionKind(detection)
            const isMember = e?.kind === 'together'
            const shape =
              kind === 'departure'
                ? {
                    size: 12,
                    background: COLORS.departure,
                    border: '2px solid #121717',
                  }
                : kind === 'disconnection'
                  ? {
                      size: 12,
                      background: '#121717',
                      border: `3px solid ${COLORS.disconnection}`,
                    }
                  : isMember
                    ? {
                        size: 12,
                        background: t.color,
                        border: '2px solid #f3f7f8',
                      }
                    : {
                        size: 9,
                        background: detection.within_fact_window
                          ? t.color
                          : lighten(t.color),
                        border: '2px solid #121717',
                      }
            const at = instantMs(detection.detected_at)
            return (
              <button
                key={detection.key}
                type="button"
                className="gt-point-band"
                title={`${formatTime(at)} · ${t.plate} · ${detection.location || detection.point_id}`}
                style={{
                  left: leftPercent(at),
                  top: laneY.get(t.plate),
                  width: shape.size,
                  height: shape.size,
                  background: shape.background,
                  border: shape.border,
                  opacity: !enabledPlates.has(t.plate)
                    ? 0.25
                    : reached(at)
                      ? 1
                      : 0.35,
                }}
                onClick={(x) => {
                  x.stopPropagation()
                  if (e) goTo(e)
                }}
                aria-label={`${t.plate} às ${formatTime(at)}`}
              />
            )
          }),
        )}
        <i
          className="gt-cursor"
          style={{ left: leftPercent(Math.max(moment, rangeStart)) }}
        />
      </div>
    </div>
  )
}
