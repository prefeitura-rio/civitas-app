import { Network } from 'lucide-react'

import type { MasterPreData } from '@/modules/vehicle-intelligence/types/domain'

/** O motor respondeu, mas o grafo de correlatas ainda não foi materializado: o motivo e o comando. */
export function MaterializationCallout({ data }: { data: MasterPreData }) {
  return (
    <section className="materialization-callout">
      <Network size={34} />
      <div>
        <strong>Motor pronto; falta materializar o grafo de correlatas</strong>
        <p>{data.reason}</p>
        <code>{data.build_command}</code>
        <small>Arquivo esperado: {data.missing_source}</small>
      </div>
    </section>
  )
}
