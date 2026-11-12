import { CalendarDays, Check } from 'lucide-react'

import {
  dayLabel,
  type FactPeriod,
  type FactPeriodFilter,
  PERIOD_PRESETS,
  periodDates,
  periodRangeLabel,
} from '@/modules/vehicle-intelligence/components/filters/fact-period'
import { FilterPill } from '@/modules/vehicle-intelligence/components/filters/filter-pill'

/** Período dos fatos: atalhos a partir do fato mais recente e intervalo livre (De / Até). */
export function PeriodPill({
  value,
  onChange,
  factPeriod,
}: {
  value: FactPeriodFilter
  onChange: (value: FactPeriodFilter) => void
  factPeriod: FactPeriod
}) {
  const preset = PERIOD_PRESETS.find(([key]) => key === value.preset)
  const custom = periodDates(value, factPeriod)
  const display = preset
    ? preset[2]
    : custom.start || custom.end
      ? `${custom.start ? dayLabel(custom.start) : '…'} – ${custom.end ? dayLabel(custom.end) : '…'}`
      : 'Base inteira'
  const fallback = periodDates({ preset: '12m' }, factPeriod)
  return (
    <FilterPill
      label="Período"
      value={display}
      icon={<CalendarDays size={14} />}
      menuClassName="period-menu"
    >
      {(close) => (
        <>
          <div className="filter-pill-options">
            {PERIOD_PRESETS.map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={value.preset === key ? 'selected' : ''}
                onClick={() => {
                  onChange({ preset: key })
                  close()
                }}
              >
                <span>{label}</span>
                <em>{periodRangeLabel(key, factPeriod)}</em>
                {value.preset === key ? <Check size={14} /> : <i />}
              </button>
            ))}
          </div>
          <div className="period-custom">
            <label>
              <span>De</span>
              <input
                type="date"
                value={
                  (value.preset === 'custom'
                    ? value.start
                    : (custom.start ?? fallback.start)) ?? ''
                }
                min={factPeriod?.start?.slice(0, 10)}
                max={factPeriod?.end?.slice(0, 10)}
                onChange={(event) =>
                  onChange({
                    preset: 'custom',
                    start: event.target.value,
                    end:
                      value.preset === 'custom'
                        ? value.end
                        : (custom.end ?? fallback.end ?? undefined),
                  })
                }
              />
            </label>
            <label>
              <span>Até</span>
              <input
                type="date"
                value={
                  (value.preset === 'custom'
                    ? value.end
                    : (custom.end ?? fallback.end)) ?? ''
                }
                min={factPeriod?.start?.slice(0, 10)}
                max={factPeriod?.end?.slice(0, 10)}
                onChange={(event) =>
                  onChange({
                    preset: 'custom',
                    start:
                      value.preset === 'custom'
                        ? value.start
                        : (custom.start ?? fallback.start ?? undefined),
                    end: event.target.value,
                  })
                }
              />
            </label>
          </div>
        </>
      )}
    </FilterPill>
  )
}
