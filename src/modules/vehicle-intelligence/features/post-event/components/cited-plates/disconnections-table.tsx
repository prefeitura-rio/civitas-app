import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { formatEventTime } from '@/modules/vehicle-intelligence/features/post-event/components/shared/event-time'
import type { PostEventData } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatElapsedHours } from '@/modules/vehicle-intelligence/lib/format'

/** Cada par placa–ocorrência: o último local lido antes do hiato e quando a placa voltou a ser lida. */
export function DisconnectionsTable({
  rows,
  onOpenPlate,
}: {
  rows: PostEventData['disconnections']
  onOpenPlate: (plate: string) => void
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Placa</th>
          <th>Ocorrência</th>
          <th>Vínculo</th>
          <th>Último local antes do hiato</th>
          <th>Fato</th>
          <th>Última leitura</th>
          <th>Retomada</th>
          <th>Até a desconexão</th>
          <th>Sem leitura</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.event_id}:${row.plate}`}>
            <td>
              <Button variant="link" onClick={() => onOpenPlate(row.plate)}>
                {row.plate}
              </Button>
            </td>
            <td>{row.event_id}</td>
            <td>{row.cited ? 'Citada no RO' : 'Correlata'}</td>
            <td>
              {row.location || row.point_id || 'Sem localização'}
              {row.simultaneous_points > 1 && (
                <small>
                  {' '}
                  · {row.simultaneous_points} pontos no mesmo horário
                </small>
              )}
            </td>
            <td>{formatEventTime(row.event_time)}</td>
            <td>{formatEventTime(row.detected_at)}</td>
            <td>{formatEventTime(row.resumed_at)}</td>
            <td>{formatElapsedHours(row.elapsed_hours, 1)}</td>
            <td>{formatElapsedHours(row.hiatus_hours, 1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
