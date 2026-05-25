'use client'

import type { OperationalViewSummaryOut } from '@/http/tickets/get-operational-view'

import styles from '../../volume/components/demand-volume-top.module.css'

interface OperationalViewSummaryCardsProps {
  summary: OperationalViewSummaryOut | undefined
  isLoading: boolean
}

function SummaryCard({
  label,
  value,
  isLoading,
}: {
  label: string
  value: number | undefined
  isLoading: boolean
}) {
  return (
    <div className={styles.summaryCard}>
      <p className={styles.summaryCardLabel}>{label}</p>
      <p className={styles.summaryCardValue}>
        {isLoading ? (
          <span style={{ opacity: 0.4 }}>—</span>
        ) : (
          (value?.toLocaleString('pt-BR') ?? '—')
        )}
      </p>
    </div>
  )
}

export function OperationalViewSummaryCards({
  summary,
  isLoading,
}: OperationalViewSummaryCardsProps) {
  return (
    <section
      className={styles.summarySection}
      aria-label="Resumo operacional de chamados"
    >
      <div className={styles.summaryCardsRow}>
        <SummaryCard
          label="Pendentes"
          value={summary?.total_pendentes}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Bloqueados"
          value={summary?.total_bloqueados}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Aguardando Revisão"
          value={summary?.total_aguardando_revisao}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Finalizados"
          value={summary?.total_finalizados}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}
