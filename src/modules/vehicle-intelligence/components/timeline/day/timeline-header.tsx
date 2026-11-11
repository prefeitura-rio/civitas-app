import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { DayModalities } from '@/modules/vehicle-intelligence/components/timeline/day-modalities'
import {
  listDayLabel,
  shortDayLabel,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type {
  TimelineDay,
  TimelineDayInfo,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/modules/vehicle-intelligence/components/ui/select'

/** O cabeçalho: voltar, o título com o resumo do dia e a escolha do dia (anterior, lista e seguinte). */
export function TimelineHeader({
  eyebrow,
  title,
  summary,
  headerAside,
  backLabel,
  onBack,
  loading,
  days,
  dayInfo,
  dayMarginMinutes,
  day,
  selectedDay,
  setSelectedDay,
}: {
  eyebrow: string
  title: ReactNode
  summary?: (day: TimelineDay, dayMarginMinutes: number) => ReactNode
  headerAside?: ReactNode
  backLabel: string
  onBack: () => void
  loading: boolean
  days: string[]
  dayInfo: (day: string) => TimelineDayInfo
  dayMarginMinutes: number
  day: TimelineDay
  selectedDay: string
  setSelectedDay: (day: string) => void
}) {
  const dayIndex = days.indexOf(selectedDay)
  const selectedInfo = selectedDay ? dayInfo(selectedDay) : null
  return (
    <header className="timeline-analysis-header">
      <div className="timeline-header-main">
        <Button
          variant="outline"
          size="icon"
          className="timeline-back-button"
          onClick={onBack}
          aria-label={backLabel}
          title={backLabel}
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="timeline-title">
          <span>{eyebrow}</span>
          <div className="timeline-title-line">
            <strong>{title}</strong>
            {!loading && summary && selectedDay && (
              <p>{summary(day, dayMarginMinutes)}</p>
            )}
          </div>
        </div>
        <div className="timeline-day-picker">
          {days.length > 0 && (
            <span className="timeline-day-count">
              Dia <b>{dayIndex + 1}</b> de {days.length}
            </span>
          )}
          <Button
            variant="outline"
            size="icon"
            className="timeline-day-step"
            type="button"
            aria-label="Dia anterior"
            title="Dia anterior"
            disabled={loading || dayIndex <= 0}
            onClick={() => setSelectedDay(days[dayIndex - 1])}
          >
            <ChevronLeft size={16} />
          </Button>
          <Select
            value={selectedDay}
            onValueChange={setSelectedDay}
            disabled={loading}
          >
            <SelectTrigger
              className="timeline-day-trigger"
              aria-label="Selecionar dia da timeline"
            >
              <CalendarDays size={16} />
              <span className="timeline-day-trigger-text">
                <b>
                  {selectedDay
                    ? shortDayLabel(selectedDay)
                    : 'Carregando dias…'}
                </b>
                {selectedInfo && (
                  <small>
                    <DayModalities modalities={selectedInfo.modalities} />
                    <em>{selectedInfo.count} detecções</em>
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
              {days.map((item) => {
                const info = dayInfo(item)
                return (
                  <SelectItem
                    className="timeline-select-item"
                    key={item}
                    value={item}
                  >
                    <span className="timeline-select-row">
                      <b>{listDayLabel(item)}</b>
                      <DayModalities modalities={info.modalities} />
                      <em>{info.count}</em>
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="timeline-day-step"
            type="button"
            aria-label="Dia seguinte"
            title="Dia seguinte"
            disabled={loading || dayIndex < 0 || dayIndex >= days.length - 1}
            onClick={() => setSelectedDay(days[dayIndex + 1])}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      {headerAside}
    </header>
  )
}
