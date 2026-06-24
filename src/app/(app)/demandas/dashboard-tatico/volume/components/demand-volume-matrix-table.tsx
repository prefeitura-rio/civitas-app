'use client'

import { Pagination } from '@/components/ui/pagination'
import type {
  DemandVolumeGranularity,
  MatrixRowOut,
  MatrixSortOrder,
} from '@/http/tickets/get-demand-volume'

import { DashboardTaticoDataState } from '../../components/dashboard-tatico-data-state'
import { formatPeriodLabel } from './demand-volume-period-label'

interface DemandVolumeMatrixTablePagination {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

interface DemandVolumeMatrixTableProps {
  title: string
  columnHeader: string
  rows: MatrixRowOut[]
  periodLabels: string[]
  isLoading: boolean
  isAvailable: boolean
  pagination?: DemandVolumeMatrixTablePagination
  sortOrder?: MatrixSortOrder
  onSortOrderChange?: (order: MatrixSortOrder) => void
}

/** Tabelas usam agrupamento fixo (mensal) definido pelo backend. */
const MATRIX_GRANULARITY: DemandVolumeGranularity = 'monthly'

type CellVariant = 'above' | 'below' | 'neutral'

function getCellVariant(
  count: number,
  average: number | null | undefined,
): CellVariant {
  if (count === 0) return 'neutral'
  if (average == null || Number.isNaN(average)) return 'neutral'
  if (count > average) return 'above'
  if (count < average) return 'below'
  return 'neutral'
}

const CELL_STYLES: Record<CellVariant, React.CSSProperties> = {
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

const HEADER_CELL: React.CSSProperties = {
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

const ROW_LABEL_CELL: React.CSSProperties = {
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

const DATA_CELL_BASE: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  textAlign: 'center',
  borderBottom: '1px solid #1d3449',
  borderRadius: '4px',
  minWidth: '52px',
}

const TOTAL_CELL: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#f9fafa',
  textAlign: 'center',
  borderBottom: '1px solid #1d3449',
  borderLeft: '1px solid #1d3449',
  whiteSpace: 'nowrap',
}

export function DemandVolumeMatrixTable({
  title,
  columnHeader,
  rows,
  periodLabels,
  isLoading,
  isAvailable,
  pagination,
  sortOrder = 'desc',
  onSortOrderChange,
}: DemandVolumeMatrixTableProps) {
  const formattedHeaders = periodLabels.map((pl) =>
    formatPeriodLabel(pl, MATRIX_GRANULARITY),
  )

  function handleSortToggle() {
    if (!onSortOrderChange) return
    onSortOrderChange(sortOrder === 'desc' ? 'asc' : 'desc')
  }

  if (!isLoading && !isAvailable) {
    return null
  }

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
        {title}
      </h2>

      {rows.length === 0 ? (
        <DashboardTaticoDataState isLoading={isLoading} isEmpty height={120} />
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
                    {columnHeader}
                  </th>
                  {formattedHeaders.map((h, i) => (
                    <th key={i} style={HEADER_CELL}>
                      {h}
                    </th>
                  ))}
                  <th
                    style={{
                      ...HEADER_CELL,
                      borderLeft: '1px solid #1d3449',
                    }}
                  >
                    {onSortOrderChange ? (
                      <button
                        type="button"
                        onClick={handleSortToggle}
                        aria-label={`Ordenar por total, ${
                          sortOrder === 'desc'
                            ? 'maior para menor'
                            : 'menor para maior'
                        }`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          font: 'inherit',
                          color: 'inherit',
                          textTransform: 'inherit',
                          letterSpacing: 'inherit',
                        }}
                      >
                        Total
                        <span aria-hidden="true" style={{ fontSize: '10px' }}>
                          {sortOrder === 'desc' ? '▼' : '▲'}
                        </span>
                      </button>
                    ) : (
                      'Total'
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td style={ROW_LABEL_CELL}>{row.label}</td>
                    {row.periods.map((period) => {
                      const variant = getCellVariant(
                        period.count,
                        period.average,
                      )
                      return (
                        <td
                          key={period.period_label}
                          style={{
                            ...DATA_CELL_BASE,
                            ...CELL_STYLES[variant],
                          }}
                        >
                          {period.count === 0 ? (
                            <span style={{ opacity: 0.3 }}>—</span>
                          ) : (
                            period.count
                          )}
                        </td>
                      )
                    })}
                    <td style={TOTAL_CELL}>
                      {row.total.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.total > pagination.pageSize ? (
            <div style={{ marginTop: '16px' }}>
              <Pagination
                page={pagination.page}
                total={pagination.total}
                size={pagination.pageSize}
                onPageChange={pagination.onPageChange}
              />
            </div>
          ) : null}

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
