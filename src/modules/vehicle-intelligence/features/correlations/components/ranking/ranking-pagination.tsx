import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { CorrelationRankingData } from '@/modules/vehicle-intelligence/types/domain'

/** "1–25 de 1.204" e as páginas; os botões esperam a resposta da página atual. */
export function RankingPagination({
  pagination,
  currentData,
  setPage,
}: {
  pagination: CorrelationRankingData['pagination']
  currentData: boolean
  setPage: Dispatch<SetStateAction<number>>
}) {
  return (
    <div className="ranking-pagination">
      <span>
        {pagination.total
          ? `${(pagination.page - 1) * pagination.page_size + 1}–${Math.min(pagination.page * pagination.page_size, pagination.total)} de ${formatNumber(pagination.total)}`
          : '0 resultados'}
      </span>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={!currentData || pagination.page <= 1}
        >
          <ChevronLeft size={17} />
          Anterior
        </Button>
        <strong>
          Página {pagination.page} de {pagination.total_pages}
        </strong>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setPage((current) => Math.min(pagination.total_pages, current + 1))
          }
          disabled={!currentData || pagination.page >= pagination.total_pages}
        >
          Próxima
          <ChevronRight size={17} />
        </Button>
      </div>
    </div>
  )
}
