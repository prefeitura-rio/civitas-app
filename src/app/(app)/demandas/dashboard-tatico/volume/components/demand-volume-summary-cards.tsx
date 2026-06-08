'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  DemandVolumeSummaryOut,
  DemandVolumeSummaryPeriod,
} from '@/http/tickets/get-demand-volume'

import { SUMMARY_PERIOD_OPTIONS } from './demand-volume-period-presets'
import styles from './demand-volume-top.module.css'

interface DemandVolumeSummaryCardsProps {
  summary: DemandVolumeSummaryOut | undefined
  isLoading: boolean
  summaryPeriod: DemandVolumeSummaryPeriod
  onSummaryPeriodChange: (period: DemandVolumeSummaryPeriod) => void
}

interface SummaryCardProps {
  label: string
  sublabel: string
  value: number | undefined
  isLoading: boolean
}

function SummaryCard({ label, sublabel, value, isLoading }: SummaryCardProps) {
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
      <p className={styles.summaryCardSublabel}>{sublabel}</p>
    </div>
  )
}

export function DemandVolumeSummaryCards({
  summary,
  isLoading,
  summaryPeriod,
  onSummaryPeriodChange,
}: DemandVolumeSummaryCardsProps) {
  return (
    <section className={styles.summarySection} aria-label="Resumo de demandas">
      <div className={styles.summaryHeader}>
        <div className={styles.pageSelectWrapWide}>
          <Select
            value={summaryPeriod}
            onValueChange={(value) =>
              onSummaryPeriodChange(value as DemandVolumeSummaryPeriod)
            }
          >
            <SelectTrigger
              className={`h-11 w-full ${styles.pageSelectTrigger}`}
              aria-label="Período do resumo"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={styles.selectContentForm}>
              {SUMMARY_PERIOD_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className={styles.selectItemForm}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={styles.summaryCardsRow}>
        <SummaryCard
          label="Total de Demandas"
          sublabel="no período selecionado"
          value={summary?.total}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Encerradas"
          sublabel="no período selecionado"
          value={summary?.closed}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Em aberto"
          sublabel="em todas as equipes"
          value={summary?.open}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Bloqueadas"
          sublabel="aguardando informação"
          value={summary?.blocked}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}
