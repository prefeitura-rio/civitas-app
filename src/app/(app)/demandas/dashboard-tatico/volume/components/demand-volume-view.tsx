'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import {
  type DemandVolumeFilterIn,
  type DemandVolumeGranularity,
  type DemandVolumeSummaryPeriod,
  getDemandVolume,
  pickDemandVolumeGranularitySeries,
} from '@/http/tickets/get-demand-volume'

import { normalizeDemandVolumeDateRange } from './demand-volume-date-range'
import {
  advancedFiltersToApiPatch,
  type DemandVolumeAdvancedFilterForm,
  stripAdvancedFiltersFromApi,
} from './demand-volume-filter-utils'
import { DemandVolumeFilters } from './demand-volume-filters'
import { DemandVolumeMatrixTable } from './demand-volume-matrix-table'
import { DemandVolumeMediaChart } from './demand-volume-media-chart'
import {
  createDefaultDemandVolumeFilters,
  getDefaultChartDateRange,
} from './demand-volume-period-presets'
import { DemandVolumeSummaryCards } from './demand-volume-summary-cards'
import { DemandVolumeTotalChart } from './demand-volume-total-chart'
import { DemandVolumeUrgencyChart } from './demand-volume-urgency-chart'

export function DemandVolumeView() {
  const [draftFilters, setDraftFilters] = useState<DemandVolumeFilterIn>(
    createDefaultDemandVolumeFilters,
  )
  const [appliedFilters, setAppliedFilters] = useState<DemandVolumeFilterIn>(
    createDefaultDemandVolumeFilters,
  )
  const [totalCallVolumeGranularity, setTotalCallVolumeGranularity] =
    useState<DemandVolumeGranularity>('monthly')
  const [urgencyGranularity, setUrgencyGranularity] =
    useState<DemandVolumeGranularity>('monthly')
  const [mediaGranularity, setMediaGranularity] =
    useState<DemandVolumeGranularity>('monthly')

  useEffect(() => {
    const fillDates = (prev: DemandVolumeFilterIn): DemandVolumeFilterIn => {
      if (prev.date_from && prev.date_to) return prev
      return { ...prev, ...getDefaultChartDateRange() }
    }
    setDraftFilters(fillDates)
    setAppliedFilters(fillDates)
  }, [])

  const { data, isFetching, isError } = useQuery({
    queryKey: ['demand-volume', appliedFilters],
    queryFn: () => getDemandVolume(appliedFilters),
    staleTime: 60_000,
  })

  const summaryPeriod = appliedFilters.summary_period ?? 'current_year'

  const totalCallVolumeData = useMemo(
    () =>
      pickDemandVolumeGranularitySeries(
        data?.total_call_volume,
        totalCallVolumeGranularity,
      ),
    [data?.total_call_volume, totalCallVolumeGranularity],
  )

  const urgencyChartData = useMemo(
    () =>
      pickDemandVolumeGranularitySeries(
        data?.closed_calls_by_urgency,
        urgencyGranularity,
      ),
    [data?.closed_calls_by_urgency, urgencyGranularity],
  )

  const mediaChartData = useMemo(
    () =>
      pickDemandVolumeGranularitySeries(
        data?.media_relevant_calls,
        mediaGranularity,
      ),
    [data?.media_relevant_calls, mediaGranularity],
  )

  function applyFilters(next: DemandVolumeFilterIn) {
    setDraftFilters(next)
    setAppliedFilters(next)
  }

  function handleSummaryPeriodChange(summaryPeriod: DemandVolumeSummaryPeriod) {
    applyFilters({ ...appliedFilters, summary_period: summaryPeriod })
  }

  const canApplyPeriod = useMemo(
    () =>
      (draftFilters.date_from ?? '') !== (appliedFilters.date_from ?? '') ||
      (draftFilters.date_to ?? '') !== (appliedFilters.date_to ?? ''),
    [
      draftFilters.date_from,
      draftFilters.date_to,
      appliedFilters.date_from,
      appliedFilters.date_to,
    ],
  )

  function handlePeriodDatesChange(
    patch: Partial<{ dateFrom: string; dateTo: string }>,
    changed: 'from' | 'to',
  ) {
    const fallback = getDefaultChartDateRange()
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

    setDraftFilters({
      ...draftFilters,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    })
  }

  function handleApplyPeriodFilter() {
    setAppliedFilters({
      ...appliedFilters,
      date_from: draftFilters.date_from,
      date_to: draftFilters.date_to,
    })
  }

  function handleApplyAdvancedFilters(form: DemandVolumeAdvancedFilterForm) {
    applyFilters({
      ...stripAdvancedFiltersFromApi(appliedFilters),
      ...advancedFiltersToApiPatch(form),
    })
  }

  /** Tabelas fixas (agrupamento mensal no backend); colunas vêm dos dados da matriz. */
  const matrixPeriodLabels = useMemo(() => {
    const fromNature = data?.closed_calls_by_nature[0]?.periods.map(
      (p) => p.period_label,
    )
    if (fromNature?.length) return fromNature
    return (
      data?.closed_calls_by_service[0]?.periods.map((p) => p.period_label) ?? []
    )
  }, [data?.closed_calls_by_nature, data?.closed_calls_by_service])

  return (
    <div
      style={{
        paddingTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <DemandVolumeSummaryCards
        summary={data?.summary}
        isLoading={isFetching}
        summaryPeriod={summaryPeriod}
        onSummaryPeriodChange={handleSummaryPeriodChange}
      />

      <DemandVolumeFilters
        dateFrom={draftFilters.date_from ?? ''}
        dateTo={draftFilters.date_to ?? ''}
        onDateFromChange={(dateFrom) =>
          handlePeriodDatesChange({ dateFrom }, 'from')
        }
        onDateToChange={(dateTo) => handlePeriodDatesChange({ dateTo }, 'to')}
        onApplyPeriod={handleApplyPeriodFilter}
        canApplyPeriod={canApplyPeriod}
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

      <DemandVolumeTotalChart
        data={totalCallVolumeData}
        granularity={totalCallVolumeGranularity}
        onGranularityChange={setTotalCallVolumeGranularity}
        isLoading={isFetching}
      />

      <DemandVolumeUrgencyChart
        data={urgencyChartData}
        granularity={urgencyGranularity}
        onGranularityChange={setUrgencyGranularity}
        isLoading={isFetching}
      />

      <DemandVolumeMatrixTable
        title="Volume de Chamados Encerrados por Natureza"
        rows={data?.closed_calls_by_nature ?? []}
        periodLabels={matrixPeriodLabels}
        isLoading={isFetching}
        columnHeader="NATUREZA"
      />

      <DemandVolumeMatrixTable
        title="Volume de Chamados Encerrados por Serviço"
        rows={data?.closed_calls_by_service ?? []}
        periodLabels={matrixPeriodLabels}
        isLoading={isFetching}
        columnHeader="SERVIÇO"
      />

      <DemandVolumeMediaChart
        data={mediaChartData}
        granularity={mediaGranularity}
        onGranularityChange={setMediaGranularity}
        isLoading={isFetching}
      />

      <DemandVolumeMatrixTable
        title="Volume de Chamados Encerrados por Demandante"
        rows={data?.closed_calls_by_requester ?? []}
        periodLabels={matrixPeriodLabels}
        isLoading={isFetching}
        columnHeader="DEMANDANTE"
      />
    </div>
  )
}
