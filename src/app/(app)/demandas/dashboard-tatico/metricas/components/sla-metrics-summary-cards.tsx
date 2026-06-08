'use client'

import type { SlaDashboardSummaryOut } from '@/http/tickets/get-sla-dashboard'

import styles from '../../volume/components/demand-volume-top.module.css'

interface SlaMetricsSummaryCardsProps {
  summary: SlaDashboardSummaryOut | undefined
  isLoading: boolean
}

interface SummaryCardProps {
  label: string
  sublabel?: string
  value: string
  isLoading: boolean
}

function SummaryCard({ label, sublabel, value, isLoading }: SummaryCardProps) {
  return (
    <div className={styles.summaryCard}>
      <p className={styles.summaryCardLabel}>{label}</p>
      <p className={styles.summaryCardValue}>
        {isLoading ? <span style={{ opacity: 0.4 }}>—</span> : value}
      </p>
      {sublabel ? (
        <p className={styles.summaryCardSublabel}>{sublabel}</p>
      ) : null}
    </div>
  )
}

function formatDays(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} dias`
}

function formatPercent(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value)}%`
}

export function SlaMetricsSummaryCards({
  summary,
  isLoading,
}: SlaMetricsSummaryCardsProps) {
  return (
    <section
      className={styles.summarySection}
      aria-label="Resumo de métricas de resposta"
    >
      <div className={styles.summaryCardsRow}>
        <SummaryCard
          label="Tempo médio de resolução"
          value={formatDays(summary?.avg_resolution_days)}
          isLoading={isLoading}
        />
        <SummaryCard
          label="SLA geral atingido"
          value={formatPercent(summary?.overall_sla_attained_percent)}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Total de demandas"
          value={
            summary?.total_demands != null
              ? summary.total_demands.toLocaleString('pt-BR')
              : '—'
          }
          isLoading={isLoading}
        />
        <SummaryCard
          label="Taxa de resolução"
          sublabel="demandas finalizadas"
          value={formatPercent(summary?.resolution_rate_percent)}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}
