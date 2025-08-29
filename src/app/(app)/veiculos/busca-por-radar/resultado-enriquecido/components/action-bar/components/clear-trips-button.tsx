import { SearchX } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useMap } from '@/hooks/useContexts/use-map-context'

export function ClearTripsButton() {
  const {
    layers: {
      trips: { clearSearch },
    },
  } = useMap()
  const router = useRouter()

  return (
    <Tooltip text="Limpar busca" asChild>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => {
          console.log('clearSearch')
          clearSearch()
          router.push('/veiculos/busca-por-radar')
        }}
      >
        <SearchX className="size-4 shrink-0" />
      </Button>
    </Tooltip>
  )
}
