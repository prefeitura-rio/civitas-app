import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

import { DayModalities } from '@/modules/vehicle-intelligence/components/timeline/day-modalities'
import type {
  GroupDayInfo,
  GroupTimelineViewProps,
} from '@/modules/vehicle-intelligence/components/timeline/group-timeline-view'
import {
  listDayLabel,
  shortDayLabel,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/modules/vehicle-intelligence/components/ui/select'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'

/** O cabeçalho da timeline do grupo: voltar, título com o resumo, o filtro de dias e a escolha do dia. */
export function GroupTimelineHeader({
  title,
  summary,
  loading,
  backLabel,
  onBack,
  days,
  visibleDays,
  dayInfo,
  dayFilter,
  onlyMultiPlateDays,
  setOnlyMultiPlateDays,
  selectedDay,
  setSelectedDay,
}: {
  title: string
  summary: string
  loading: boolean
  backLabel: string
  onBack: () => void
  days: string[]
  visibleDays: string[]
  dayInfo: (day: string) => GroupDayInfo
  dayFilter: GroupTimelineViewProps['dayFilter']
  onlyMultiPlateDays: boolean
  setOnlyMultiPlateDays: Dispatch<SetStateAction<boolean>>
  selectedDay: string
  setSelectedDay: (day: string) => void
}) {
  const dayIndex = visibleDays.indexOf(selectedDay)
  const info = selectedDay ? dayInfo(selectedDay) : null
  return (
    <header className="gt-head">
      <button
        type="button"
        className="gt-back"
        onClick={onBack}
        aria-label={backLabel}
        title={backLabel}
      >
        <ArrowLeft size={17} />
      </button>
      <div className="gt-title">
        <span>TIMELINE DO GRUPO</span>
        <div>
          <strong>{title}</strong>
          {!loading && selectedDay && <small>{summary}</small>}
        </div>
      </div>
      <div className="gt-head-right">
        <button
          type="button"
          className={`gt-button${onlyMultiPlateDays ? ' active' : ''}`}
          aria-pressed={onlyMultiPlateDays}
          title={dayFilter.title}
          disabled={loading || !days.some(dayFilter.test)}
          onClick={() => setOnlyMultiPlateDays((v) => !v)}
        >
          {dayFilter.label}
        </button>
        <button
          type="button"
          className="gt-button gt-arrow"
          aria-label="Dia anterior"
          title="Dia anterior"
          disabled={loading || dayIndex <= 0}
          onClick={() => setSelectedDay(visibleDays[dayIndex - 1])}
        >
          <ChevronLeft size={16} />
        </button>
        <Select
          value={selectedDay}
          onValueChange={setSelectedDay}
          disabled={loading}
        >
          <SelectTrigger
            className="gt-day"
            aria-label="Selecionar dia da timeline"
          >
            <CalendarDays size={15} />
            <span className="gt-day-text">
              <b>
                {selectedDay ? shortDayLabel(selectedDay) : 'Carregando dias…'}
              </b>
              {info && (
                <small>
                  Dia {dayIndex + 1} de {visibleDays.length} ·{' '}
                  {pluralize(info.events, 'RO', 'ROs')} ·{' '}
                  {pluralize(info.plates.length, 'placa', 'placas')} em RO
                </small>
              )}
            </span>
          </SelectTrigger>
          <SelectContent
            className="timeline-select-content"
            position="popper"
            align="end"
            sideOffset={6}
          >
            {visibleDays.map((d) => {
              const i = dayInfo(d)
              return (
                <SelectItem className="timeline-select-item" key={d} value={d}>
                  <span className="timeline-select-row">
                    <b>{listDayLabel(d)}</b>
                    <DayModalities modalities={i.modalities} />
                    <span className="timeline-day-plates">
                      {i.plates.map((p) => (
                        <i key={p.plate} style={{ background: p.color }} />
                      ))}
                    </span>
                    <em>{i.detections}</em>
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <button
          type="button"
          className="gt-button gt-arrow"
          aria-label="Dia seguinte"
          title="Dia seguinte"
          disabled={
            loading || dayIndex < 0 || dayIndex >= visibleDays.length - 1
          }
          onClick={() => setSelectedDay(visibleDays[dayIndex + 1])}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </header>
  )
}
