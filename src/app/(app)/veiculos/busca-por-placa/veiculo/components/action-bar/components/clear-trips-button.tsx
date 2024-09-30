import { SearchX } from 'lucide-react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function ClearTripsButton() {
  const {
    layers: {
      trips: { clearSearch },
    },
  } = useMap()

  return (
    <Tooltip text="Limpar pesquisa" asChild>
      <Button size="sm" variant="outline" type="button" onClick={clearSearch}>
        <SearchX className="h-4 w-4" />
      </Button>
    </Tooltip>
  )
}
