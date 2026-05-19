'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getTeamsList } from '@/http/teams/get-teams'
import { getUsersOnlyWithRoles } from '@/http/user-roles/get-users-only-with-roles'
import { dateConfig } from '@/lib/date-config'
import { cn } from '@/lib/utils'

import styles from './shift-closings-list.module.css'

const DEFAULT_OPTION = '__default__'

function parseDateString(s: string): Date | undefined {
  if (!s?.trim()) return undefined
  const trimmed = s.trim()
  const datePart = trimmed.includes('T') ? trimmed.slice(0, 10) : trimmed
  const d = new Date(`${datePart}T00:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type ShiftClosingsFilterState = {
  closed_by_id: string
  team_id: string
  shift_date: string
}

export function emptyShiftClosingsFilters(): ShiftClosingsFilterState {
  return {
    closed_by_id: '',
    team_id: '',
    shift_date: '',
  }
}

type ShiftClosingsFiltersProps = {
  filters: ShiftClosingsFilterState
  onChange: (filters: ShiftClosingsFilterState) => void
}

export function ShiftClosingsFilters({
  filters,
  onChange,
}: ShiftClosingsFiltersProps) {
  const [dateOpen, setDateOpen] = useState(false)

  const { data: adjunctOptions = [], isLoading: isAdjunctsLoading } = useQuery({
    queryKey: ['shift-closings-adjuncts'],
    queryFn: async () => {
      const { data } = await getUsersOnlyWithRoles({ role: 'Adjunto' })
      return data.map((user) => ({
        value: user.id,
        label: user.full_name?.trim() || user.username,
      }))
    },
    staleTime: 1000 * 60 * 5,
  })

  const { data: teamOptions = [], isLoading: isTeamsLoading } = useQuery({
    queryKey: ['shift-closings-teams'],
    queryFn: async () => {
      const { data } = await getTeamsList()
      return data.map((team) => ({
        value: team.id,
        label: team.name,
      }))
    },
    staleTime: 1000 * 60 * 5,
  })

  const shiftDate = useMemo(
    () => parseDateString(filters.shift_date),
    [filters.shift_date],
  )

  const shiftDateLabel = shiftDate
    ? format(shiftDate, dateConfig.formats.date, { locale: dateConfig.locale })
    : null

  return (
    <div className={styles.filtersRow}>
      <div className={styles.filterField}>
        <span className={styles.filterLabel}>Adjunto</span>
        <Select
          value={filters.closed_by_id || DEFAULT_OPTION}
          onValueChange={(value) =>
            onChange({
              ...filters,
              closed_by_id: value === DEFAULT_OPTION ? '' : value,
            })
          }
          disabled={isAdjunctsLoading}
        >
          <SelectTrigger className={styles.filterSelectTrigger}>
            <SelectValue placeholder="Padrão" />
          </SelectTrigger>
          <SelectContent className={styles.filterSelectContent}>
            <SelectItem
              value={DEFAULT_OPTION}
              className={styles.filterSelectItem}
            >
              Padrão
            </SelectItem>
            {adjunctOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={styles.filterSelectItem}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={styles.filterField}>
        <span className={styles.filterLabel}>Equipe</span>
        <Select
          value={filters.team_id || DEFAULT_OPTION}
          onValueChange={(value) =>
            onChange({
              ...filters,
              team_id: value === DEFAULT_OPTION ? '' : value,
            })
          }
          disabled={isTeamsLoading}
        >
          <SelectTrigger className={styles.filterSelectTrigger}>
            <SelectValue placeholder="Padrão" />
          </SelectTrigger>
          <SelectContent className={styles.filterSelectContent}>
            <SelectItem
              value={DEFAULT_OPTION}
              className={styles.filterSelectItem}
            >
              Padrão
            </SelectItem>
            {teamOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={styles.filterSelectItem}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={styles.filterField}>
        <span className={styles.filterLabel}>Data do turno</span>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                styles.filterDateTrigger,
                !shiftDateLabel && styles.filterDatePlaceholder,
              )}
              aria-label="Data do turno"
            >
              <span className="min-w-0 flex-1 truncate text-left">
                {shiftDateLabel ?? 'Padrão'}
              </span>
              <CalendarIcon className="h-5 w-5 shrink-0 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="z-[100] w-auto p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Calendar
              mode="single"
              selected={shiftDate}
              onSelect={(d) => {
                onChange({
                  ...filters,
                  shift_date: d ? toDateString(d) : '',
                })
                setDateOpen(false)
              }}
              locale={dateConfig.locale}
              defaultMonth={shiftDate ?? new Date()}
              initialFocus
              className="rounded-lg border"
            />
            {filters.shift_date ? (
              <div className="border-t border-[#4a5d6d] p-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-full text-[#97a2ab]"
                  onClick={() => {
                    onChange({ ...filters, shift_date: '' })
                    setDateOpen(false)
                  }}
                >
                  Limpar data
                </Button>
              </div>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
