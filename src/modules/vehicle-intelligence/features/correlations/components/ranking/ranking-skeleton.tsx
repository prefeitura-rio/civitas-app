import type { ReactNode } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/vehicle-intelligence/components/ui/table'
import type { Column } from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'

/** A tabela vazia, com os cabeçalhos da vista, enquanto a primeira resposta não chega. */
export function RankingSkeleton({
  columns,
  header,
}: {
  columns: Column[]
  header: (column: Column) => ReactNode
}) {
  return (
    <div className="table-scroll ranking-table-scroll ranking-skeleton">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{header(column)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  <span className="ranking-skeleton-cell" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
