import { SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'

export function ClearTripsButton() {
  const { clearSearch } = useCarPath()

  return (
    <Tooltip text="Limpar pesquisa" asChild>
      <Button size="sm" variant="outline" type="button" onClick={clearSearch}>
        <SearchX className="h-4 w-4" />
      </Button>
    </Tooltip>
  )
}
