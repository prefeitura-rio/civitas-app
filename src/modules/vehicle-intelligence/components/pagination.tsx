import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'

interface PaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalItems)

  return (
    <nav
      className="flex min-h-16 flex-col items-center justify-between gap-3 border-t border-border bg-secondary/40 px-3 py-2 sm:flex-row"
      aria-label="Paginação da tabela"
    >
      <span className="text-xs tabular-nums text-muted-foreground">
        {firstItem}–{lastItem} de {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft size={17} />
          Anterior
        </Button>
        <strong className="min-w-24 text-center text-xs font-medium tabular-nums text-muted-foreground">
          Página {page} de {totalPages}
        </strong>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Próxima
          <ChevronRight size={17} />
        </Button>
      </div>
    </nav>
  )
}
