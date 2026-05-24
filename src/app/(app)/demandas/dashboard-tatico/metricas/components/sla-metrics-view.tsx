'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import {
  getSlaDashboard,
  pickSlaDashboardGranularitySeries,
  type SlaDashboardFilterIn,
  type SlaDashboardGranularity,
} from '@/http/tickets/get-sla-dashboard'

import { normalizeDemandVolumeDateRange } from '../../volume/components/demand-volume-date-range'
import {
  advancedFiltersToApiPatch,
  type SlaMetricsAdvancedFilterForm,
  stripAdvancedFiltersFromApi,
} from './sla-metrics-filter-utils'
import { SlaMetricsFilters } from './sla-metrics-filters'
import { SlaMetricsGeneralChart } from './sla-metrics-general-chart'
import { SlaMetricsMediaChart } from './sla-metrics-media-chart'
import {
  createDefaultSlaMetricsFilters,
  getDefaultSlaMetricsDateRange,
} from './sla-metrics-period-presets'
import { SlaMetricsPriorityChart } from './sla-metrics-priority-chart'
import { SlaMetricsSlaTable } from './sla-metrics-sla-table'
import { SlaMetricsSummaryCards } from './sla-metrics-summary-cards'

export function SlaMetricsView() {
  const [draftFilters, setDraftFilters] = useState<SlaDashboardFilterIn>(
    createDefaultSlaMetricsFilters,
  )
  const [appliedFilters, setAppliedFilters] = useState<SlaDashboardFilterIn>(
    createDefaultSlaMetricsFilters,
  )
  const [generalGranularity, setGeneralGranularity] =
    useState<SlaDashboardGranularity>('monthly')
  const [priorityGranularity, setPriorityGranularity] =
    useState<SlaDashboardGranularity>('monthly')
  const [mediaGranularity, setMediaGranularity] =
    useState<SlaDashboardGranularity>('monthly')

  useEffect(() => {
    const fillDates = (prev: SlaDashboardFilterIn): SlaDashboardFilterIn => {
      if (prev.date_from && prev.date_to) return prev
      return { ...prev, ...getDefaultSlaMetricsDateRange() }
    }
    setDraftFilters(fillDates)
    setAppliedFilters(fillDates)
  }, [])

  const { data, isFetching, isError } = useQuery({
    queryKey: ['sla-dashboard', appliedFilters],
    queryFn: () => getSlaDashboard(appliedFilters),
    staleTime: 60_000,
  })

  const generalChartData = useMemo(
    () =>
      pickSlaDashboardGranularitySeries(
        data?.avg_resolution_time_general,
        generalGranularity,
      ),
    [data?.avg_resolution_time_general, generalGranularity],
  )

  const priorityChartData = useMemo(
    () =>
      pickSlaDashboardGranularitySeries(
        data?.avg_resolution_time_by_priority,
        priorityGranularity,
      ),
    [data?.avg_resolution_time_by_priority, priorityGranularity],
  )

  const mediaChartData = useMemo(
    () =>
      pickSlaDashboardGranularitySeries(
        data?.delivery_time_for_media_relevant,
        mediaGranularity,
      ),
    [data?.delivery_time_for_media_relevant, mediaGranularity],
  )

  const slaTablePeriodLabels = useMemo(() => {
    const fromPriority = data?.sla_performance_by_priority[0]?.periods.map(
      (p) => p.period_label,
    )
    if (fromPriority?.length) return fromPriority
    return (
      data?.sla_performance_by_service[0]?.periods.map((p) => p.period_label) ??
      []
    )
  }, [data?.sla_performance_by_priority, data?.sla_performance_by_service])

  function applyFilters(next: SlaDashboardFilterIn) {
    setDraftFilters(next)
    setAppliedFilters(next)
  }

  function handlePeriodDatesChange(
    patch: Partial<{ dateFrom: string; dateTo: string }>,
    changed: 'from' | 'to',
  ) {
    const fallback = getDefaultSlaMetricsDateRange()
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

  function handleApplyAdvancedFilters(form: SlaMetricsAdvancedFilterForm) {
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
      <SlaMetricsSummaryCards summary={data?.summary} isLoading={isFetching} />

      <SlaMetricsFilters
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

      <SlaMetricsGeneralChart
        data={generalChartData}
        granularity={generalGranularity}
        onGranularityChange={setGeneralGranularity}
        isLoading={isFetching}
      />

      <SlaMetricsPriorityChart
        data={priorityChartData}
        granularity={priorityGranularity}
        onGranularityChange={setPriorityGranularity}
        isLoading={isFetching}
      />

      <SlaMetricsSlaTable
        title="Desempenho de SLA por Prioridade"
        columnHeader="PRIORIDADE"
        rows={data?.sla_performance_by_priority ?? []}
        periodLabels={slaTablePeriodLabels}
        isLoading={isFetching}
      />

      <SlaMetricsSlaTable
        title="Desempenho de SLA por Serviço"
        columnHeader="SERVIÇO"
        rows={data?.sla_performance_by_service ?? []}
        periodLabels={slaTablePeriodLabels}
        isLoading={isFetching}
        formatRowLabel={(label) => label}
      />

      <SlaMetricsMediaChart
        data={mediaChartData}
        granularity={mediaGranularity}
        onGranularityChange={setMediaGranularity}
        isLoading={isFetching}
      />
    </div>
  )
}
