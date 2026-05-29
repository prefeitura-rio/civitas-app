'use client'

import { format } from 'date-fns'
import { CalendarIcon, Filter } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { SlaDashboardFilterIn } from '@/http/tickets/get-sla-dashboard'
import { dateConfig } from '@/lib/date-config'

import {
  DashboardTaticoFilterModal,
  SLA_METRICS_STATUS_OPTIONS,
} from '../../components/filters'
import {
  parseDemandVolumeDate,
  toDemandVolumeDateString,
} from '../../volume/components/demand-volume-date-range'
import styles from '../../volume/components/demand-volume-top.module.css'
import { SlaMetricsExportDialog } from './sla-metrics-export-dialog'
import {
  advancedFiltersFromApi,
  countSlaMetricsAdvancedFiltersFromApi,
  type SlaMetricsAdvancedFilterForm,
} from './sla-metrics-filter-utils'

interface SlaMetricsFiltersProps {
  dateFrom: string
  dateTo: string
  onDateFromChange: (dateFrom: string) => void
  onDateToChange: (dateTo: string) => void
  onApplyPeriod: () => void
  canApplyPeriod: boolean
  isLoading: boolean
  appliedFilters: SlaDashboardFilterIn
  onApplyAdvancedFilters: (filters: SlaMetricsAdvancedFilterForm) => void
}

function formatTrigger(d: Date | undefined): string | null {
  if (!d) return null
  return format(d, dateConfig.formats.date, { locale: dateConfig.locale })
}

function DateField({
  value,
  placeholder,
  ariaLabel,
  onChange,
  disabled,
  minDate,
  maxDate,
}: {
  value: string
  placeholder: string
  ariaLabel: string
  onChange: (value: string) => void
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}) {
  const [open, setOpen] = useState(false)
  const date = useMemo(() => parseDemandVolumeDate(value), [value])

  return (
    <div className={styles.dateFieldWrap}>
      <Popover
        open={disabled ? false : open}
        onOpenChange={(o) => {
          if (!disabled) setOpen(o)
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={styles.dateTrigger}
            disabled={disabled}
            aria-label={ariaLabel}
          >
            {formatTrigger(date) ? (
              <span className={styles.dateTriggerValue}>
                {formatTrigger(date)}
              </span>
            ) : (
              <span className={styles.dateTriggerPlaceholder}>
                {placeholder}
              </span>
            )}
            <CalendarIcon className="h-5 w-5 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[100] w-auto p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (!d) return
              onChange(toDemandVolumeDateString(d))
              setOpen(false)
            }}
            disabled={(d) => {
              if (minDate && d < minDate) return true
              if (maxDate && d > maxDate) return true
              return false
            }}
            locale={dateConfig.locale}
            defaultMonth={date ?? minDate ?? maxDate ?? new Date()}
            initialFocus
            className="rounded-lg border"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function SlaMetricsFilters({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApplyPeriod,
  canApplyPeriod,
  isLoading,
  appliedFilters,
  onApplyAdvancedFilters,
}: SlaMetricsFiltersProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const startDate = useMemo(() => parseDemandVolumeDate(dateFrom), [dateFrom])
  const endDate = useMemo(() => parseDemandVolumeDate(dateTo), [dateTo])
  const activeAdvancedCount = useMemo(
    () => countSlaMetricsAdvancedFiltersFromApi(appliedFilters),
    [appliedFilters],
  )
  const advancedFiltersForm = useMemo(
    () => advancedFiltersFromApi(appliedFilters),
    [appliedFilters],
  )

  return (
    <div className={styles.periodBar}>
      <div className={styles.periodBarLabelBlock}>
        <p className={styles.periodBarLabel}>Período da Busca</p>
        <div className={styles.dateFieldsRow}>
          <DateField
            value={dateFrom}
            placeholder="dd/mm/aaaa"
            ariaLabel="Data inicial do período"
            onChange={onDateFromChange}
            disabled={isLoading}
            maxDate={endDate}
          />
          <DateField
            value={dateTo}
            placeholder="dd/mm/aaaa"
            ariaLabel="Data final do período"
            onChange={onDateToChange}
            disabled={isLoading}
            minDate={startDate}
          />
          <button
            type="button"
            className={styles.periodApplyButton}
            disabled={isLoading || !canApplyPeriod}
            onClick={onApplyPeriod}
          >
            Aplicar
          </button>
        </div>
      </div>

      <div className={styles.periodBarActions}>
        <div className={styles.filterButtonWrap}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Filtrar dados"
            title="Filtrar"
            disabled={isLoading}
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className="h-5 w-5" />
          </button>
          {activeAdvancedCount > 0 ? (
            <span className={styles.filterBadge} aria-hidden>
              {activeAdvancedCount}
            </span>
          ) : null}
        </div>

        <SlaMetricsExportDialog
          appliedFilters={appliedFilters}
          disabled={isLoading}
        />
      </div>

      <DashboardTaticoFilterModal
        scope="sla-metrics"
        statusOptions={SLA_METRICS_STATUS_OPTIONS}
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={advancedFiltersForm}
        onApply={onApplyAdvancedFilters}
      />
    </div>
  )
}
