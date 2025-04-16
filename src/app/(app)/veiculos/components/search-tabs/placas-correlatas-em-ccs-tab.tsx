'use client'
import { History, Printer } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'

enum SearchType {
  'CREATE' = 'CREATE',
  'READ' = 'READ',
}

export function PlacasCorrelatasEmCCsTabs() {
  const pathname = usePathname()
  const initialSearchType = pathname.includes('genarate-report')
    ? SearchType.CREATE
    : SearchType.READ
  const router = useRouter()

  return (
    <div className="mb-2 grid w-full grid-cols-2 rounded-md bg-secondary p-1 text-sm">
      <div
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-md p-2',
          initialSearchType === SearchType.CREATE
            ? 'bg-card'
            : 'text-muted-foreground',
        )}
        onClick={() =>
          router.push('/veiculos/placas-correlatas-em-ccs/genarate-report')
        }
      >
        <Printer className="size-5 shrink-0" />
        <span>Gerar Relatório</span>
      </div>
      <div
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-md p-1',
          initialSearchType === SearchType.READ
            ? 'bg-card'
            : 'text-muted-foreground',
        )}
        onClick={() =>
          router.push('/veiculos/placas-correlatas-em-ccs/retrieve-report')
        }
      >
        <History className="size-5 shrink-0" />
        <span>Recuperar Relatório</span>
      </div>
    </div>
  )
}
