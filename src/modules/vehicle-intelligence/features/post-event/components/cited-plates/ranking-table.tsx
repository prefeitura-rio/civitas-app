import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import type { PostEventData } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

export function RankingTable({
  rows,
  sort,
  ascending,
  onSort,
  onOpenPlate,
}: {
  rows: PostEventData['ranking']
  sort: string
  ascending: boolean
  onSort: (key: string) => void
  onOpenPlate: (plate: string) => void
}) {
  const sortColumn = (key: string, label: string) => (
    <button type="button" onClick={() => onSort(key)}>
      {label}
      {sort === key ? (ascending ? ' ↑' : ' ↓') : ' ↕'}
    </button>
  )
  return (
    <table>
      <thead>
        <tr>
          <th>{sortColumn('rank', 'Posição')}</th>
          <th>Placa</th>
          <th>{sortColumn('linked_events', 'Ocorrências')}</th>
          <th>{sortColumn('cited_events', 'Citada em')}</th>
          <th>{sortColumn('correlated_events', 'Só correlata em')}</th>
          <th>{sortColumn('distinct_days', 'Dias com fato')}</th>
          <th>{sortColumn('detections', 'Leituras no período')}</th>
          <th>{sortColumn('post_days', 'Dias pós')}</th>
          <th>{sortColumn('post_detections', 'Leituras pós')}</th>
          <th>{sortColumn('trips', 'Trajetos pós')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.plate}>
            <td>{row.rank}</td>
            <td>
              <Button variant="link" onClick={() => onOpenPlate(row.plate)}>
                {row.plate}
              </Button>
            </td>
            <td>{row.linked_events}</td>
            <td>{row.cited_events}</td>
            <td>{row.correlated_events}</td>
            <td>{row.distinct_days}</td>
            <td>{formatNumber(row.detections)}</td>
            <td>{row.post_days}</td>
            <td>{formatNumber(row.post_detections)}</td>
            <td>{formatNumber(row.trips)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
