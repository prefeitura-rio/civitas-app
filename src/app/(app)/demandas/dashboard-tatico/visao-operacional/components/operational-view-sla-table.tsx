'use client'

import type { CSSProperties } from 'react'

import type { SlaPerformanceByTeamRowOut } from '@/http/tickets/get-operational-view'

import { formatPeriodLabel } from '../../volume/components/demand-volume-period-label'

interface OperationalViewSlaTableProps {
  rows: SlaPerformanceByTeamRowOut[]
  periodLabels: string[]
  isLoading: boolean
}

type CellVariant = 'above' | 'below' | 'neutral'

function getCellVariant(
  slaPercent: number | null,
  isAboveAverage: boolean,
): CellVariant {
  if (slaPercent == null || slaPercent === 0) return 'neutral'
  if (isAboveAverage) return 'above'
  return 'below'
}

const CELL_STYLES: Record<CellVariant, CSSProperties> = {
  above: {
    backgroundColor: 'rgba(185, 61, 82, 0.25)',
    color: '#f9a7b3',
    fontWeight: 600,
  },
  below: {
    backgroundColor: 'rgba(6, 178, 187, 0.15)',
    color: '#06b2bb',
    fontWeight: 600,
  },
  neutral: {
    backgroundColor: 'transparent',
    color: '#f9fafa',
    fontWeight: 400,
  },
}

const HEADER_CELL: CSSProperties = {
  padding: '10px 12px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#97a2ab',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid #1d3449',
  textAlign: 'center',
}

const ROW_LABEL_CELL: CSSProperties = {
  padding: '10px 12px',
  fontSize: '13px',
  color: '#f9fafa',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid #1d3449',
  textAlign: 'left',
  position: 'sticky',
  left: 0,
  backgroundColor: '#101d28',
  zIndex: 1,
}

const DATA_CELL_BASE: CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  textAlign: 'center',
  borderBottom: '1px solid #1d3449',
  borderRadius: '4px',
  minWidth: '52px',
}

function formatSlaPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function OperationalViewSlaTable({
  rows,
  periodLabels,
  isLoading,
}: OperationalViewSlaTableProps) {
  const formattedHeaders = periodLabels.map((pl) =>
    formatPeriodLabel(pl, 'monthly'),
  )

  return (
    <div
      style={{
        backgroundColor: '#101d28',
        border: '1px solid #4a5d6d',
        borderRadius: '8px',
        padding: '24px',
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#f9fafa',
          margin: '0 0 20px 0',
        }}
      >
        Desempenho de SLA por Equipe
      </h2>

      {isLoading && rows.length === 0 ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...HEADER_CELL,
                      textAlign: 'left',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: '#101d28',
                      zIndex: 2,
                      minWidth: '160px',
                    }}
                  >
                    EQUIPE
                  </th>
                  {formattedHeaders.map((h, i) => (
                    <th key={i} style={HEADER_CELL}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td style={ROW_LABEL_CELL}>{row.label}</td>
                    {row.periods.map((period) => {
                      const variant = getCellVariant(
                        period.sla_percent,
                        period.is_above_average,
                      )
                      return (
                        <td
                          key={period.period_label}
                          style={{
                            ...DATA_CELL_BASE,
                            ...CELL_STYLES[variant],
                          }}
                        >
                          {period.sla_percent == null ||
                          period.sla_percent === 0 ? (
                            <span style={{ opacity: 0.3 }}>—</span>
                          ) : (
                            formatSlaPercent(period.sla_percent)
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #1d3449',
            }}
          >
            <LegendItem
              color="#f9a7b3"
              bg="rgba(185, 61, 82, 0.25)"
              label="Acima da média"
            />
            <LegendItem
              color="#06b2bb"
              bg="rgba(6, 178, 187, 0.15)"
              label="Abaixo da média"
            />
          </div>
        </>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div
      style={{
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#97a2ab',
        fontSize: '14px',
      }}
    >
      Carregando…
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#97a2ab',
        fontSize: '14px',
      }}
    >
      Nenhum dado disponível
    </div>
  )
}

function LegendItem({
  color,
  bg,
  label,
}: {
  color: string
  bg: string
  label: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          display: 'inline-block',
          width: '32px',
          height: '16px',
          backgroundColor: bg,
          borderRadius: '4px',
          border: `1px solid ${color}`,
        }}
      />
      <span style={{ fontSize: '12px', color: '#97a2ab' }}>{label}</span>
    </div>
  )
}
