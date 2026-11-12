import { useEffect, useMemo, useState } from 'react'

import { Pagination } from '@/modules/vehicle-intelligence/components/pagination'
import { Panel } from '@/modules/vehicle-intelligence/components/panel'
import { PanelHeader } from '@/modules/vehicle-intelligence/components/panel-header'
import { Badge } from '@/modules/vehicle-intelligence/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/vehicle-intelligence/components/ui/table'
import { OVERVIEW } from '@/modules/vehicle-intelligence/features/overview/overview-variants'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { cispParts } from '@/modules/vehicle-intelligence/lib/labels'
import type { DashboardData } from '@/modules/vehicle-intelligence/types/domain'

const PAGE_SIZE = 25

export function TerritorialTable({ data }: { data: DashboardData }) {
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [data])
  const visibleRows = useMemo(
    () => data.ranking.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [data.ranking, page],
  )

  return (
    <Panel className="table-panel">
      <PanelHeader
        compact
        eyebrow="Dados tabulares"
        title="Ranking detalhado por CISP"
        description="Ocorrências por modalidade e participação no recorte atual."
        action={
          <Badge variant="outline" className="rank-count">
            {data.ranking.length} ÁREAS
          </Badge>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>CISP</TableHead>
            <TableHead>Área</TableHead>
            {OVERVIEW.columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead>Total</TableHead>
            <TableHead>Participação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.ranking.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={OVERVIEW.columns.length + 5}
                className="table-empty-state"
              >
                Nenhuma CISP encontrada para o recorte atual.
              </TableCell>
            </TableRow>
          ) : (
            visibleRows.map((row, index) => (
              <TableRow key={row.cisp}>
                <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                <TableCell>
                  <strong>CISP {row.cisp}</strong>
                </TableCell>
                <TableCell>
                  {(() => {
                    const { locality, unit } = cispParts(row.cisp, row.area)
                    return locality ? (
                      <span className="territory-area">
                        <strong>{locality}</strong>
                        <small>{unit}</small>
                      </span>
                    ) : (
                      row.area
                    )
                  })()}
                </TableCell>
                {OVERVIEW.columns.map((column) => (
                  <TableCell key={column.key}>
                    {formatNumber(row[column.key] ?? 0)}
                  </TableCell>
                ))}
                <TableCell>
                  <b>{formatNumber(row.ocorrencias)}</b>
                </TableCell>
                <TableCell>
                  {data.summary.total
                    ? (
                        (row.ocorrencias / data.summary.total) *
                        100
                      ).toLocaleString('pt-BR', {
                        maximumFractionDigits: 1,
                      })
                    : 0}
                  %
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {data.ranking.length > PAGE_SIZE && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={data.ranking.length}
          onPageChange={setPage}
        />
      )}
    </Panel>
  )
}
