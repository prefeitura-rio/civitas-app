import { SatelliteDish, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'

export function SearchByRadarHeader() {
  const { selectedRadar } = useCarPath()

  return (
    <div className="flex w-full flex-col">
      <div className="flex h-full flex-col">
        <div className="flex h-[3.25rem] items-center justify-between py-2">
          <CardTitle className="flex items-center gap-2">
            Consultar radar
            <SatelliteDish className="h-8 w-8" />
          </CardTitle>
          {selectedRadar && (
            <Button type="submit" className="flex h-9 w-9 gap-2 p-2">
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
