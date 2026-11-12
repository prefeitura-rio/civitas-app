import { useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/vehicle-intelligence/components/ui/table'
import {
  GRAPH,
  type GraphEdge,
} from '@/modules/vehicle-intelligence/features/correlations/graph-variants'

/** As ligações do desenho em tabela (até 250), montadas só quando a pessoa abre a lista. */
export function GraphEdgeTable({
  visibleEdges,
}: {
  visibleEdges: GraphEdge[]
}) {
  const [showGraphTable, setShowGraphTable] = useState(false)
  return (
    <details
      className="graph-accessible-list"
      onToggle={(event) => setShowGraphTable(event.currentTarget.open)}
    >
      <summary>Consultar ligações em tabela</summary>
      <div className="table-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              {GRAPH.table.headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {showGraphTable &&
              visibleEdges.slice(0, 250).map((edge) => (
                <TableRow key={`${edge.source}-${edge.target}`}>
                  {GRAPH.table.cells(edge).map((cell, index) => (
                    <TableCell key={index}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </details>
  )
}
