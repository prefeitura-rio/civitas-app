'use client'
import { SearchX } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { EnhancedDetectionDTO } from '@/hooks/use-queries/use-enhanced-radars-search'
import type { UseSearchByRadarEnhancedResultDynamicFilter } from '@/hooks/use-search-by-radar-enhanced-result-dynamic-filter'

import { DownloadReport } from './components/download-report'

interface ActionBarProps {
  data: EnhancedDetectionDTO[] | undefined
  filters: UseSearchByRadarEnhancedResultDynamicFilter
  isLoading: boolean
}

export function ActionBar({ data, filters, isLoading }: ActionBarProps) {
  const router = useRouter()

  return (
    <Card className="flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <DownloadReport
          data={data || []}
          filters={filters}
          isLoading={isLoading}
        />
      </div>
      <div className="flex gap-2">
        <Tooltip text="Limpar busca" asChild>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => router.push('/mapa/busca-por-radar')}
          >
            <SearchX className="size-4 shrink-0" />
          </Button>
        </Tooltip>
      </div>
    </Card>
  )
}
