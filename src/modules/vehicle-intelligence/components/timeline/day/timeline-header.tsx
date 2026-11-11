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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/modules/vehicle-intelligence/components/ui/select'

/**
 * O cabeçalho, no padrão da timeline do Painel de Clonagem: uma faixa baixa com controles sem borda (fundo só no hover),
 * a placa com o resumo do dia, a escolha do dia (anterior, lista e seguinte) e, à direita, as ações do dia.
 */
export function TimelineHeader({
  eyebrow,
  title,
  summary,
  headerAside,
  actions,
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
  actions?: ReactNode
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
    <>
      <header className="timeline-analysis-header" aria-label={eyebrow}>
        <div className="timeline-header-main">
          <button
            type="button"
            className="timeline-back-button"
            onClick={onBack}
            aria-label={backLabel}
            title={backLabel}
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <div className="timeline-title">
            <strong>{title}</strong>
            {!loading && summary && selectedDay && (
              <small>{summary(day, dayMarginMinutes)}</small>
            )}
          </div>
          {days.length > 0 && (
            <>
              <span className="timeline-header-divider" aria-hidden="true" />
              <div className="timeline-day-picker">
                <button
                  type="button"
                  className="timeline-day-step"
                  aria-label="Dia anterior"
                  title="Dia anterior"
                  disabled={loading || dayIndex <= 0}
                  onClick={() => setSelectedDay(days[dayIndex - 1])}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <Select
                  value={selectedDay}
                  onValueChange={setSelectedDay}
                  disabled={loading}
                >
                  <SelectTrigger
                    className="timeline-day-trigger"
                    aria-label="Selecionar dia da timeline"
                  >
                    <CalendarDays size={15} aria-hidden="true" />
                    <span className="timeline-day-trigger-text">
                      <b>
                        {selectedDay
                          ? shortDayLabel(selectedDay)
                          : 'Carregando dias…'}
                      </b>
                      {selectedInfo && (
                        <>
                          <em>{selectedInfo.count} detecções</em>
                          <DayModalities modalities={selectedInfo.modalities} />
                        </>
                      )}
                    </span>
                  </SelectTrigger>
                  <SelectContent
                    className="timeline-select-content"
                    position="popper"
                    align="start"
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
                <button
                  type="button"
                  className="timeline-day-step"
                  aria-label="Dia seguinte"
                  title="Dia seguinte"
                  disabled={
                    loading || dayIndex < 0 || dayIndex >= days.length - 1
                  }
                  onClick={() => setSelectedDay(days[dayIndex + 1])}
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
                <span className="timeline-day-count">
                  Dia {dayIndex + 1} de {days.length}
                </span>
              </div>
            </>
          )}
        </div>
        {actions && <div className="timeline-header-actions">{actions}</div>}
      </header>
      {headerAside}
    </>
  )
}
