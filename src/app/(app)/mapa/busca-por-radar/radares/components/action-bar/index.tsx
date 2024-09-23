import { SearchX } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { DownloadReport } from './components/download-report'
import { EnhancePlatesInfo } from './components/enhance-plates-info'

interface ActionBarProps {
  data: unknown[]
}

export function ActionBar({ data }: ActionBarProps) {
  const router = useRouter()
  return (
    <Card className="flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <DownloadReport data={data} />
        <EnhancePlatesInfo />
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
