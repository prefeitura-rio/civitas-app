import { SearchX } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import DownloadReportButton from './components/download-report-button'
import { MonitoringToggle } from './components/monitoring-toggle'

export function ActionBar() {
  const router = useRouter()

  return (
    <Card className="mx-auto flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <DownloadReportButton />
        <MonitoringToggle />
      </div>
      <div className="flex gap-2">
        <Tooltip text="Limpar busca" asChild>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => router.push('/mapa/busca-por-placa')}
          >
            <SearchX className="size-4 shrink-0" />
          </Button>
        </Tooltip>
      </div>
    </Card>
  )
}
