'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import {
  getOperationalView,
  type OperationalViewFilterIn,
  type OperationalViewGranularity,
  pickOperationalViewGranularitySeries,
} from '@/http/tickets/get-operational-view'

import { normalizeDemandVolumeDateRange } from '../../volume/components/demand-volume-date-range'
import {
  pivotOpenTicketsForBarChart,
  pivotTeamPeriodSeries,
} from './operational-view-chart-utils'
import {
  advancedFiltersToApiPatch,
  type OperationalViewAdvancedFilterForm,
  stripAdvancedFiltersFromApi,
} from './operational-view-filter-utils'
import { OperationalViewFilters } from './operational-view-filters'
import { OperationalViewOpenTicketsChart } from './operational-view-open-tickets-chart'
import {
  createDefaultOperationalViewFilters,
  getDefaultOperationalViewDateRange,
} from './operational-view-period-presets'
import { OperationalViewSlaTable } from './operational-view-sla-table'
import { OperationalViewSummaryCards } from './operational-view-summary-cards'
import { OperationalViewTeamLineChart } from './operational-view-team-line-chart'

export function OperationalViewView() {
  const [draftFilters, setDraftFilters] = useState<OperationalViewFilterIn>(
    createDefaultOperationalViewFilters,
  )
  const [appliedFilters, setAppliedFilters] = useState<OperationalViewFilterIn>(
    createDefaultOperationalViewFilters,
  )
  const [openTicketsGranularity, setOpenTicketsGranularity] =
    useState<OperationalViewGranularity>('monthly')
  const [closedVolumeGranularity, setClosedVolumeGranularity] =
    useState<OperationalViewGranularity>('monthly')
  const [resolutionTimeGranularity, setResolutionTimeGranularity] =
    useState<OperationalViewGranularity>('monthly')

  useEffect(() => {
    const fillDates = (
      prev: OperationalViewFilterIn,
    ): OperationalViewFilterIn => {
      if (prev.date_from && prev.date_to) return prev
      return { ...prev, ...getDefaultOperationalViewDateRange() }
    }
    setDraftFilters(fillDates)
    setAppliedFilters(fillDates)
  }, [])

  const { data, isFetching, isError } = useQuery({
    queryKey: ['operational-view', appliedFilters],
    queryFn: () => getOperationalView(appliedFilters),
    staleTime: 60_000,
  })

  const openTicketsChart = useMemo(
    () =>
      pivotOpenTicketsForBarChart(
        data?.open_tickets_by_team,
        openTicketsGranularity,
        appliedFilters.date_from,
        appliedFilters.date_to,
      ),
    [
      data?.open_tickets_by_team,
      openTicketsGranularity,
      appliedFilters.date_from,
      appliedFilters.date_to,
    ],
  )

  const closedVolumeSeries = useMemo(
    () =>
      pickOperationalViewGranularitySeries(
        data?.closed_volume_by_team,
        closedVolumeGranularity,
      ),
    [data?.closed_volume_by_team, closedVolumeGranularity],
  )

  const resolutionTimeSeries = useMemo(
    () =>
      pickOperationalViewGranularitySeries(
        data?.avg_resolution_time_by_team,
        resolutionTimeGranularity,
      ),
    [data?.avg_resolution_time_by_team, resolutionTimeGranularity],
  )

  const closedVolumeChart = useMemo(
    () => pivotTeamPeriodSeries(closedVolumeSeries, closedVolumeGranularity),
    [closedVolumeSeries, closedVolumeGranularity],
  )

  const resolutionTimeChart = useMemo(
    () =>
      pivotTeamPeriodSeries(resolutionTimeSeries, resolutionTimeGranularity),
    [resolutionTimeSeries, resolutionTimeGranularity],
  )

  const slaTablePeriodLabels = useMemo(
    () =>
      data?.sla_performance_by_team[0]?.periods.map((p) => p.period_label) ??
      [],
    [data?.sla_performance_by_team],
  )

  function applyFilters(next: OperationalViewFilterIn) {
    setDraftFilters(next)
    setAppliedFilters(next)
  }

  function handlePeriodDatesChange(
    patch: Partial<{ dateFrom: string; dateTo: string }>,
    changed: 'from' | 'to',
  ) {
    const fallback = getDefaultOperationalViewDateRange()
    let dateFrom =
      patch.dateFrom ?? draftFilters.date_from ?? fallback.date_from ?? ''
    let dateTo = patch.dateTo ?? draftFilters.date_to ?? fallback.date_to ?? ''

    if (dateFrom && dateTo) {
      ;({ dateFrom, dateTo } = normalizeDemandVolumeDateRange(
        dateFrom,
        dateTo,
        changed,
      ))
    }

    applyFilters({
      ...appliedFilters,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    })
  }

  function handleApplyAdvancedFilters(form: OperationalViewAdvancedFilterForm) {
    applyFilters({
      ...stripAdvancedFiltersFromApi(appliedFilters),
      ...advancedFiltersToApiPatch(form),
    })
  }

  return (
    <div
      style={{
        paddingTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <OperationalViewSummaryCards
        summary={data?.summary}
        isLoading={isFetching}
      />

      <OperationalViewFilters
        dateFrom={draftFilters.date_from ?? ''}
        dateTo={draftFilters.date_to ?? ''}
        onDateFromChange={(dateFrom) =>
          handlePeriodDatesChange({ dateFrom }, 'from')
        }
        onDateToChange={(dateTo) => handlePeriodDatesChange({ dateTo }, 'to')}
        isLoading={isFetching}
        appliedFilters={appliedFilters}
        onApplyAdvancedFilters={handleApplyAdvancedFilters}
      />

      {isError && (
        <div
          style={{
            backgroundColor: '#1d3449',
            border: '1px solid #4a5d6d',
            borderRadius: '8px',
            padding: '16px 24px',
            color: '#f9fafa',
            fontSize: '14px',
          }}
        >
          Erro ao carregar dados. Verifique sua conexão e tente novamente.
        </div>
      )}

      <OperationalViewOpenTicketsChart
        chartData={openTicketsChart.chartData}
        teams={openTicketsChart.teams}
        granularity={openTicketsGranularity}
        onGranularityChange={setOpenTicketsGranularity}
        isLoading={isFetching}
      />

      <OperationalViewTeamLineChart
        title="Volume de Chamados Fechados por Equipe"
        chartData={closedVolumeChart.chartData}
        teams={closedVolumeChart.teams}
        granularity={closedVolumeGranularity}
        onGranularityChange={setClosedVolumeGranularity}
        isLoading={isFetching}
      />

      <OperationalViewTeamLineChart
        title="Tempo Médio de Resolução por Equipe"
        chartData={resolutionTimeChart.chartData}
        teams={resolutionTimeChart.teams}
        granularity={resolutionTimeGranularity}
        onGranularityChange={setResolutionTimeGranularity}
        isLoading={isFetching}
        valueFormatter={(value) =>
          `${value.toLocaleString('pt-BR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} dias`
        }
      />

      <OperationalViewSlaTable
        rows={data?.sla_performance_by_team ?? []}
        periodLabels={slaTablePeriodLabels}
        isLoading={isFetching}
      />
    </div>
  )
}
