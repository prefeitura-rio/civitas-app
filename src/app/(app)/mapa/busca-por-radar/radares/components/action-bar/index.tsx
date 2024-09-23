import { Download, SearchX, WandSparkles } from 'lucide-react'
import { redirect, useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ActionBar() {
  const router = useRouter()
  return (
    <Card className="flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <Tooltip text="Baixar Relatório">
          <Button variant="secondary" size="icon">
            <Download className="size-4 shrink-0" />
          </Button>
        </Tooltip>
        <Tooltip text="Enriquecer resultado">
          <Button variant="secondary" size="icon">
            <WandSparkles className="size-4 shrink-0" />
          </Button>
        </Tooltip>
      </div>
      <div className="flex gap-2">
        <Tooltip text="Limpar busca">
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
