import { AlertCircle, Database, RefreshCw } from 'lucide-react'

import { DataState } from '@/modules/vehicle-intelligence/components/data-state'
import { Badge } from '@/modules/vehicle-intelligence/components/ui/badge'
import { ChoroplethMap } from '@/modules/vehicle-intelligence/features/overview/components/choropleth-map'
import { CispRanking } from '@/modules/vehicle-intelligence/features/overview/components/cisp-ranking'
import { CrimeDonut } from '@/modules/vehicle-intelligence/features/overview/components/crime-donut'
import { DashboardKpiGrid } from '@/modules/vehicle-intelligence/features/overview/components/dashboard-kpi-grid'
import { TargetChart } from '@/modules/vehicle-intelligence/features/overview/components/target-chart'
import { TerritorialTable } from '@/modules/vehicle-intelligence/features/overview/components/territorial-table'
import { TrendChart } from '@/modules/vehicle-intelligence/features/overview/components/trend-chart'
import { OVERVIEW } from '@/modules/vehicle-intelligence/features/overview/overview-variants'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { DashboardData } from '@/modules/vehicle-intelligence/types/domain'

interface OverviewViewProps {
  data: DashboardData | null
  error: string | null
  loading: boolean
}

/** Panorama do recorte inteiro, sem filtros. Área foco: fatos no mapa; território estadual: modalidade e tabela por CISP. */
export function OverviewView({ data, error, loading }: OverviewViewProps) {
  return (
    <>
      <section className="mb-5 flex flex-col items-start justify-between gap-4 min-[901px]:flex-row min-[901px]:items-end">
        <div>
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-primary">
            Visão geral
          </span>
          <h2 className="mb-1 mt-1.5 text-[1.375rem] font-semibold leading-tight tracking-tight text-foreground">
            {OVERVIEW.title(data)}
          </h2>
          <p className="m-0 max-w-3xl text-xs leading-5 text-muted-foreground">
            {OVERVIEW.text}
          </p>
        </div>
        {data && (
          <Badge
            variant="outline"
            className="h-10 w-full justify-center gap-2 rounded-lg border-border bg-card px-3 text-muted-foreground min-[901px]:w-auto"
          >
            <Database className="text-primary" size={15} />
            <span>
              {data.metadata.data_mode === 'detailed'
                ? 'Base detalhada'
                : 'Snapshot analítico'}
            </span>
            <strong className="border-l border-border pl-2 font-semibold tabular-nums text-foreground">
              {formatNumber(data.summary.total)} {OVERVIEW.totalLabel}
            </strong>
          </Badge>
        )}
      </section>

      {error && (
        <DataState
          tone="danger"
          icon={<AlertCircle size={18} />}
          title="Não foi possível carregar o painel"
        >
          {error}
        </DataState>
      )}

      {!data && !error && (
        <DataState
          centered
          icon={
            <RefreshCw
              className="animate-spin motion-reduce:animate-none"
              size={26}
            />
          }
          title="Preparando o panorama"
        >
          Carregando geometrias e indicadores…
        </DataState>
      )}

      {data && (
        <div
          className="flex flex-col gap-3.5 transition-opacity duration-150 data-[refreshing=true]:opacity-60 motion-reduce:transition-none"
          data-refreshing={loading}
          aria-busy={loading}
        >
          <DashboardKpiGrid data={data} />
          {OVERVIEW.focusArea ? (
            <ChoroplethMap data={data} />
          ) : (
            <div className="grid gap-3.5 min-[901px]:grid-cols-[minmax(0,2.7fr)_minmax(280px,0.8fr)]">
              <ChoroplethMap data={data} />
              <CrimeDonut data={data} />
            </div>
          )}
          {!OVERVIEW.focusArea && data.metadata.observacoes.length > 0 && (
            <DataState tone="warning" icon={<AlertCircle size={16} />}>
              <div className="flex flex-col gap-1">
                {data.metadata.observacoes.map((note) => (
                  <span key={note}>{note}</span>
                ))}
              </div>
            </DataState>
          )}
          <div className="grid gap-3.5 min-[901px]:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.85fr)] min-[1381px]:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)_minmax(310px,0.9fr)]">
            <TrendChart data={data} />
            <TargetChart data={data} />
            <CispRanking data={data} />
          </div>
          {!OVERVIEW.focusArea && <TerritorialTable data={data} />}
        </div>
      )}
    </>
  )
}
