'use client'
import { Cctv, LandPlot } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'

enum SearchType {
  'RADAR' = 'RADAR',
  'WIDE' = 'WIDE',
}

export function SearchTabs() {
  const pathname = usePathname()
  const initialSearchType = pathname.includes('busca-por-radar')
    ? SearchType.RADAR
    : SearchType.WIDE
  const router = useRouter()

  return (
    <div className="m-2 grid grid-cols-2 rounded-md bg-secondary p-1 text-sm">
      <div
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-md p-2',
          initialSearchType === SearchType.RADAR
            ? 'bg-card'
            : 'text-muted-foreground',
        )}
        onClick={() => router.push('/mapa/busca-por-radar')}
      >
        <Cctv className="size-5 shrink-0" />
        <span>Busca por Radar</span>
      </div>
      <div
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-md p-1',
          initialSearchType === SearchType.WIDE
            ? 'bg-card'
            : 'text-muted-foreground',
        )}
        onClick={() => router.push('/mapa/busca-ampla')}
      >
        <LandPlot className="size-5 shrink-0" />
        <span>Busca Ampla</span>
      </div>
    </div>
  )
}
