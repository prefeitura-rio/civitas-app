import { Network } from 'lucide-react'

import { SCREEN } from '@/modules/vehicle-intelligence/features/correlations/screen-variants'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { MasterPreData } from '@/modules/vehicle-intelligence/types/domain'

/** Nota quando o limite de placas desenhadas corta correlatas elegíveis (a tabela continua com todas). */
export function GraphLimitNote({ data }: { data: MasterPreData }) {
  return (
    <div className="data-note">
      <Network size={16} />
      <span>
        O grafo exibe {formatNumber(data.summary.displayed_candidates)}{' '}
        correlatas de {formatNumber(data.summary.candidates)} elegíveis no
        recorte calculado, além das {SCREEN.anchors} conectadas. O limite é
        aplicado depois dos filtros; a tabela consulta todo o resultado
        filtrado.
      </span>
    </div>
  )
}
