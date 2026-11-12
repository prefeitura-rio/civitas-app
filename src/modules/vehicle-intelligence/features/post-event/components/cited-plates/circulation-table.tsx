import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

/** Circulação por dia, hora ou dia da semana: placas distintas e leituras. */
export function CirculationTable({
  heading,
  rows,
}: {
  heading: string
  rows: Array<{
    key: string | number
    label: string | undefined
    plates: number
    detections: number
  }>
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>{heading}</th>
          <th>Placas distintas</th>
          <th>Leituras</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <td>{row.label}</td>
            <td>{row.plates}</td>
            <td>{formatNumber(row.detections)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
