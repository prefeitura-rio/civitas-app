'use client'
import { SearchX } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { UseSearchByRadarResultDynamicFilter } from '@/hooks/use-search-by-radar-result-dynamic-filter'

import { DownloadReport } from './components/download-report'
import { EnhancePlatesInfo } from './components/enhance-plates-info'

interface ActionBarProps {
  isLoading: boolean
  filters: UseSearchByRadarResultDynamicFilter
}

export function ActionBar({ isLoading, filters }: ActionBarProps) {
  const router = useRouter()
  const { filteredData: data } = filters

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
