'use client'
import { SearchX } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'

import { DownloadReport } from './components/download-report'
import { EnhancePlatesInfo } from './components/enhance-plates-info'

interface ActionBarProps {
  data: DetectionDTO[] | undefined
  isLoading: boolean
}

export function ActionBar({ data, isLoading }: ActionBarProps) {
  const router = useRouter()
  return (
    <Card className="flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <DownloadReport data={data || []} />
        <EnhancePlatesInfo
          isLoading={isLoading}
          plates={data?.map((item) => item.plate) || []}
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
