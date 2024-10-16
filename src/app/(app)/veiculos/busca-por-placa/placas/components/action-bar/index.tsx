import { SearchX } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { UseSearchByPlateResultDynamicFilter } from '@/hooks/use-search-by-plate-result-dynamic-filter'

import { EnhancePlatesInfo } from './components/enhance-plates-info'

interface ActionBarProps {
  isLoading: boolean
  filters: UseSearchByPlateResultDynamicFilter
  data: string[]
}

export function ActionBar({ filters, isLoading, data }: ActionBarProps) {
  const router = useRouter()
  // const { filteredData } = filters

  return (
    <Card className="mx-auto flex w-full max-w-screen-md justify-between gap-2 p-2">
      <div className="flex gap-2">
        <EnhancePlatesInfo
          isLoading={isLoading}
          plates={data}
          filters={filters}
        />
      </div>
      <div className="flex gap-2">
        <Tooltip text="Limpar busca" asChild>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => router.push('/veiculos/busca-por-placa')}
          >
            <SearchX className="size-4 shrink-0" />
          </Button>
        </Tooltip>
      </div>
    </Card>
  )
}
