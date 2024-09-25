'use client'
import { SearchX } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'
import type { UseSearchByRadarResultDynamicFilter } from '@/hooks/use-search-by-radar-result-dynamic-filter'

import { DownloadReport } from './components/download-report'
import { EnhancePlatesInfo } from './components/enhance-plates-info'

interface ActionBarProps {
  isLoading: boolean
  filters: UseSearchByRadarResultDynamicFilter
  data: DetectionDTO[] | undefined
}

export function ActionBar({ isLoading, filters, data }: ActionBarProps) {
  const router = useRouter()
  // const { filteredData } = filters

  return (
    <Card className="flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <DownloadReport
          data={data || []}
          filters={filters}
          isLoading={isLoading}
        />
        <EnhancePlatesInfo
          isLoading={isLoading}
          plates={data?.map((item) => item.plate) || []}
          filters={filters}
          data={data}
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
