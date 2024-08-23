import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from './button'

export interface PaginationProps {
  page: number
  total: number
  size: number
  onPageChange: (pageIndex: number) => Promise<void> | void
  className?: string
}

export function Pagination({
  page,
  size,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = Math.ceil(total / size) || 1

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-sm text-muted-foreground">
        Total de {total} item(s)
      </span>

      <div className="flex items-center gap-6 lg:gap-8">
        <div className="text-sm font-medium">
          Página {page} de {pages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onPageChange(1)}
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Primeira página</span>
          </Button>
          <Button
            onClick={() => onPageChange(page - 1)}
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>
          <Button
            onClick={() => onPageChange(page + 1)}
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={pages <= page}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próxima página</span>
          </Button>
          <Button
            onClick={() => onPageChange(pages)}
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={pages <= page}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
