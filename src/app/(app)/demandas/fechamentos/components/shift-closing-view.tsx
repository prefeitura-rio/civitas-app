'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCookie } from 'cookies-next'
import { format } from 'date-fns'
import {
  Bold,
  CalendarIcon,
  ChevronLeft,
  Italic,
  MessageSquareText,
  Underline,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
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
import { useResolvedTicketModulePermissions } from '@/hooks/useQueries/useResolvedTicketModulePermissions'
import { getTeamsByRole } from '@/http/teams/get-teams-by-role'
import {
  parseTicketModulePermissionsCookie,
  TICKET_MODULE_PERMISSIONS_COOKIE,
} from '@/http/tickets/ticket-module-permissions-me'
import {
  getTicketShiftClosing,
  persistTicketShiftClosing,
  previewTicketShiftClosing,
} from '@/http/tickets/ticket-shift-closing'
import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'
import { dateConfig } from '@/lib/date-config'
import { getApiErrorMessage } from '@/utils/error-handlers'

import {
  getDefaultShiftClosingPeriod,
  getShiftEndDate,
  periodFromRecord,
  periodToApiPayload,
  type ShiftClosingPeriodForm,
  toInputTime,
} from '../utils/shift-closing-period'
import { ShiftClosingTicketCard } from './shift-closing-ticket-card'
import styles from './shift-closing-view.module.css'

const SHIFT_CLOSING_TEAM_ROLES = [
  'Assessor',
  'Coordenador',
  'Administrativo',
] as const satisfies readonly UserRoleEnum[]

function requiresShiftClosingTeamSelection(
  role: UserRoleEnum | null | undefined,
): boolean {
  if (!role) return false
  return SHIFT_CLOSING_TEAM_ROLES.includes(
    role as (typeof SHIFT_CLOSING_TEAM_ROLES)[number],
  )
}

function parseDateString(s: string): Date | undefined {
  if (!s?.trim()) return undefined
  const d = new Date(`${s.trim()}T00:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toDateString(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function formatDateTrigger(d: Date | undefined): string | null {
  if (!d) return null
  return format(d, dateConfig.formats.date, { locale: dateConfig.locale })
}

type DateFieldProps = {
  placeholder: string
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  readOnly?: boolean
}

function ShiftClosingDateField({
  placeholder,
  value,
  onChange,
  ariaLabel,
  readOnly = false,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const date = useMemo(() => parseDateString(value), [value])
  const display = formatDateTrigger(date)

  if (readOnly) {
    return (
      <div className={styles.dateReadOnly} aria-label={ariaLabel}>
        <span className="min-w-0 flex-1 truncate">
          {display ?? placeholder}
        </span>
        <CalendarIcon className="h-5 w-5 shrink-0 opacity-50" aria-hidden />
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={styles.dateTrigger}
          aria-label={ariaLabel}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {display ?? placeholder}
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
          selected={date}
          onSelect={(d) => {
            if (d) onChange(toDateString(d))
            setOpen(false)
          }}
          locale={dateConfig.locale}
          defaultMonth={date ?? new Date()}
          initialFocus
          className="rounded-lg border"
        />
      </PopoverContent>
    </Popover>
  )
}

type ShiftClosingViewProps = {
  shiftClosingId?: string
}

export function ShiftClosingView({
  shiftClosingId,
}: ShiftClosingViewProps = {}) {
  const isViewMode = Boolean(shiftClosingId)
  const router = useRouter()
  const queryClient = useQueryClient()
  const fromCookie = parseTicketModulePermissionsCookie(
    getCookie(TICKET_MODULE_PERMISSIONS_COOKIE) as string | undefined,
  )
  const { permissions, resolved: permissionsResolved } =
    useResolvedTicketModulePermissions(fromCookie)
  const userRole = permissions?.role ?? null
  const mustSelectTeam = requiresShiftClosingTeamSelection(userRole)
  const [period, setPeriod] = useState<ShiftClosingPeriodForm>(
    getDefaultShiftClosingPeriod,
  )
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [comment, setComment] = useState('')
  const debouncedPeriod = useDebounce(period, 400)

  const teamsQuery = useQuery({
    queryKey: ['teams', 'by-role'],
    queryFn: getTeamsByRole,
    enabled: !isViewMode && mustSelectTeam && permissionsResolved,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (!mustSelectTeam || selectedTeamId || teamsQuery.isLoading) return
    const teams = teamsQuery.data ?? []
    if (teams.length === 1) {
      setSelectedTeamId(teams[0].id)
    }
  }, [mustSelectTeam, selectedTeamId, teamsQuery.data, teamsQuery.isLoading])

  const apiPayload = useMemo(() => {
    const payload = periodToApiPayload(debouncedPeriod)
    if (mustSelectTeam && selectedTeamId) {
      return { ...payload, team_id: selectedTeamId }
    }
    return payload
  }, [debouncedPeriod, mustSelectTeam, selectedTeamId])

  const recordQuery = useQuery({
    queryKey: ['ticket-shift-closing', shiftClosingId],
    queryFn: () => getTicketShiftClosing(shiftClosingId!),
    enabled: isViewMode,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const previewQuery = useQuery({
    queryKey: ['ticket-shift-closing-preview', apiPayload],
    queryFn: () => previewTicketShiftClosing(apiPayload),
    enabled:
      !isViewMode &&
      Boolean(
        apiPayload.start_date && apiPayload.start_time && apiPayload.end_time,
      ) &&
      (!mustSelectTeam || Boolean(selectedTeamId)),
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const viewPeriod = useMemo(() => {
    if (!recordQuery.data) return null
    return periodFromRecord(
      recordQuery.data.period_start,
      recordQuery.data.period_end,
    )
  }, [recordQuery.data])

  const displayPeriod = isViewMode ? viewPeriod : period

  const canSubmitClose = !mustSelectTeam || Boolean(selectedTeamId.trim())

  const closeMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...periodToApiPayload(period),
        comment,
      }
      if (mustSelectTeam && selectedTeamId) {
        return persistTicketShiftClosing({
          ...payload,
          team_id: selectedTeamId,
        })
      }
      return persistTicketShiftClosing(payload)
    },
    onSuccess: async () => {
      toast.success('Turno fechado com sucesso.')
      await queryClient.invalidateQueries({
        queryKey: ['ticket-shift-closings'],
      })
      router.push('/demandas/fechamentos')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const endDate = displayPeriod ? getShiftEndDate(displayPeriod.start_date) : ''
  const endDateLabel =
    formatDateTrigger(parseDateString(endDate)) ?? 'Data final'
  const selectedTotal = isViewMode
    ? (recordQuery.data?.total ?? 0)
    : (previewQuery.data?.total ?? 0)
  const items = isViewMode
    ? (recordQuery.data?.items ?? [])
    : (previewQuery.data?.items ?? [])
  const isLoading = isViewMode ? recordQuery.isLoading : previewQuery.isLoading
  const isError = isViewMode ? recordQuery.isError : previewQuery.isError
  const queryError = isViewMode ? recordQuery.error : previewQuery.error
  const savedComment = recordQuery.data?.comment?.trim() ?? ''

  return (
    <div className={styles.root}>
      <header className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <Link
            href="/demandas/fechamentos"
            className={styles.backLink}
            aria-label="Voltar para fechamentos"
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden />
          </Link>
          <h1 className={styles.pageTitle}>Fechamento de Turno</h1>
        </div>
      </header>

      <section className={styles.periodSection}>
        <span className={styles.periodLabel}>Período do turno</span>
        <div className={styles.periodRow}>
          <div className={styles.periodGroup}>
            <ShiftClosingDateField
              placeholder="Data inicial"
              value={displayPeriod?.start_date ?? ''}
              onChange={(startDate) =>
                setPeriod((current) => ({ ...current, start_date: startDate }))
              }
              ariaLabel="Data inicial do turno"
              readOnly={isViewMode}
            />
            {isViewMode ? (
              <div
                className={styles.timeReadOnly}
                aria-label="Hora inicial do turno"
              >
                {toInputTime(displayPeriod?.start_time ?? '')}
              </div>
            ) : (
              <Input
                type="time"
                className={styles.timeInput}
                value={toInputTime(period.start_time)}
                onChange={(e) =>
                  setPeriod((current) => ({
                    ...current,
                    start_time: e.target.value,
                  }))
                }
                aria-label="Hora inicial do turno"
              />
            )}
          </div>

          <div className={styles.periodGroup}>
            <div
              className={styles.dateReadOnly}
              aria-label="Data final do turno (calculada automaticamente)"
            >
              <span className="min-w-0 flex-1 truncate">{endDateLabel}</span>
              <CalendarIcon
                className="h-5 w-5 shrink-0 opacity-50"
                aria-hidden
              />
            </div>
            {isViewMode ? (
              <div
                className={styles.timeReadOnly}
                aria-label="Hora final do turno"
              >
                {toInputTime(displayPeriod?.end_time ?? '')}
              </div>
            ) : (
              <Input
                type="time"
                className={styles.timeInput}
                value={toInputTime(period.end_time)}
                onChange={(e) =>
                  setPeriod((current) => ({
                    ...current,
                    end_time: e.target.value,
                  }))
                }
                aria-label="Hora final do turno"
              />
            )}
          </div>
        </div>

        {!isViewMode && mustSelectTeam ? (
          <div className={styles.teamRow}>
            <div className={styles.teamField}>
              <span className={styles.periodLabel}>Equipe</span>
              <Select
                value={selectedTeamId || undefined}
                onValueChange={setSelectedTeamId}
                disabled={teamsQuery.isLoading}
              >
                <SelectTrigger
                  className={styles.teamSelectTrigger}
                  aria-label="Equipe do fechamento"
                >
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent className={styles.teamSelectContent}>
                  {(teamsQuery.data ?? []).map((team) => (
                    <SelectItem
                      key={team.id}
                      value={team.id}
                      className={styles.teamSelectItem}
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {teamsQuery.isError ? (
                <p className={styles.errorState}>
                  {getApiErrorMessage(teamsQuery.error)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <p className={styles.selectedCount}>
          {isLoading
            ? 'Carregando chamados…'
            : `${selectedTotal} chamado${selectedTotal === 1 ? '' : 's'} selecionado${selectedTotal === 1 ? '' : 's'}`}
        </p>
      </section>

      <section className={styles.ticketsList}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Spinner />
          </div>
        ) : isError ? (
          <p className={styles.errorState}>{getApiErrorMessage(queryError)}</p>
        ) : items.length === 0 ? (
          <p className={styles.emptyState}>
            Nenhum chamado encontrado para o período selecionado.
          </p>
        ) : (
          <div className={styles.ticketsGroup}>
            {items.map((item) => (
              <ShiftClosingTicketCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {isViewMode && !isLoading && !isError ? (
        <section className={styles.commentSection}>
          <div className={styles.commentHeading}>
            <h2 className={styles.commentTitle}>
              Comentário do Balanço do Serviço
            </h2>
            <p className={styles.commentSubtitle}>
              Observações registradas no fechamento do turno.
            </p>
          </div>

          <div className={styles.commentReadOnlyCard}>
            <div className={styles.commentReadOnlyHeader}>
              <MessageSquareText
                size={18}
                className={styles.commentReadOnlyIcon}
                aria-hidden
              />
              <span className={styles.commentReadOnlyLabel}>
                {savedComment ? 'Comentário' : 'Sem comentário'}
              </span>
            </div>

            {savedComment ? (
              <p className={styles.commentReadOnlyBody}>{savedComment}</p>
            ) : (
              <p className={styles.commentReadOnlyEmpty}>
                Nenhum comentário foi registrado neste fechamento.
              </p>
            )}
          </div>
        </section>
      ) : null}

      {!isViewMode ? (
        <section className={styles.commentSection}>
          <div className={styles.commentHeading}>
            <h2 className={styles.commentTitle}>
              Comentário do Balanço do Serviço
            </h2>
            <p className={styles.commentSubtitle}>
              Adicione um comentário ao relatório de balanço do serviço.
            </p>
          </div>

          <div className={styles.commentActions}>
            <div className={styles.editorWrap}>
              <div className={styles.toolbar} aria-hidden>
                <button type="button" className={styles.toolbarBtn} disabled>
                  <Bold size={16} />
                </button>
                <button type="button" className={styles.toolbarBtn} disabled>
                  <Italic size={16} />
                </button>
                <button type="button" className={styles.toolbarBtn} disabled>
                  <Underline size={16} />
                </button>
              </div>

              <textarea
                className={styles.textarea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva um comentário"
                disabled={closeMutation.isPending}
                spellCheck
              />
            </div>

            <Button
              type="button"
              className={styles.submitButton}
              disabled={
                closeMutation.isPending ||
                previewQuery.isLoading ||
                !canSubmitClose
              }
              onClick={() => closeMutation.mutate()}
            >
              {closeMutation.isPending ? 'Fechando…' : 'Fechar Relatório'}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
