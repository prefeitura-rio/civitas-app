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
import type { OperationalViewFilterIn } from '@/http/tickets/get-operational-view'
import { dateConfig } from '@/lib/date-config'

import {
  DashboardTaticoFilterModal,
  OPERATIONAL_VIEW_STATUS_OPTIONS,
} from '../../components/filters'
import {
  parseDemandVolumeDate,
  toDemandVolumeDateString,
} from '../../volume/components/demand-volume-date-range'
import styles from '../../volume/components/demand-volume-top.module.css'
import { OperationalViewExportDialog } from './operational-view-export-dialog'
import {
  advancedFiltersFromApi,
  countOperationalViewAdvancedFiltersFromApi,
  type OperationalViewAdvancedFilterForm,
} from './operational-view-filter-utils'

interface OperationalViewFiltersProps {
  dateFrom: string
  dateTo: string
  onDateFromChange: (dateFrom: string) => void
  onDateToChange: (dateTo: string) => void
  onApplyPeriod: () => void
  canApplyPeriod: boolean
  isLoading: boolean
  appliedFilters: OperationalViewFilterIn
  onApplyAdvancedFilters: (filters: OperationalViewAdvancedFilterForm) => void
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

export function OperationalViewFilters({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApplyPeriod,
  canApplyPeriod,
  isLoading,
  appliedFilters,
  onApplyAdvancedFilters,
}: OperationalViewFiltersProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const startDate = useMemo(() => parseDemandVolumeDate(dateFrom), [dateFrom])
  const endDate = useMemo(() => parseDemandVolumeDate(dateTo), [dateTo])
  const activeAdvancedCount = useMemo(
    () => countOperationalViewAdvancedFiltersFromApi(appliedFilters),
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

      <PeriodBarActions
        isLoading={isLoading}
        activeAdvancedCount={activeAdvancedCount}
        appliedFilters={appliedFilters}
        onOpenFilter={() => setIsFilterModalOpen(true)}
      />

      <DashboardTaticoFilterModal
        scope="operational-view"
        statusOptions={OPERATIONAL_VIEW_STATUS_OPTIONS}
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={advancedFiltersForm}
        onApply={onApplyAdvancedFilters}
      />
    </div>
  )
}

function PeriodBarActions({
  isLoading,
  activeAdvancedCount,
  appliedFilters,
  onOpenFilter,
}: {
  isLoading: boolean
  activeAdvancedCount: number
  appliedFilters: OperationalViewFilterIn
  onOpenFilter: () => void
}) {
  return (
    <div className={styles.periodBarActions}>
      <div className={styles.filterButtonWrap}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Filtrar dados"
          title="Filtrar"
          disabled={isLoading}
          onClick={onOpenFilter}
        >
          <Filter className="h-5 w-5" />
        </button>
        {activeAdvancedCount > 0 ? (
          <span className={styles.filterBadge} aria-hidden>
            {activeAdvancedCount}
          </span>
        ) : null}
      </div>

      <OperationalViewExportDialog
        appliedFilters={appliedFilters}
        disabled={isLoading}
      />
    </div>
  )
}
