import { useMutation } from '@tanstack/react-query'
import { SatelliteDish, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import { useCarsPathMapLayers } from '@/hooks/use-cars-path-map-layers'
import { getCarHint } from '@/http/cars/hint/get-cars-hint'

export function SearchByRadarFilterForm() {
  const {
    mapStates: { bbox },
  } = useCarsPathMapLayers()

  const { mutateAsync: getCarHintMutation } = useMutation({
    mutationFn: getCarHint,
  })

  return (
    <div className="flex w-full flex-col">
      <form className="flex h-full flex-col">
        <div className="flex items-center justify-between py-2">
          <CardTitle className="flex items-center gap-2">
            Consultar radar
            <SatelliteDish className="h-8 w-8" />
          </CardTitle>
          <Button
            // type="submit"
            // disabled={isSubmitting}
            type="button"
            onClick={async () => {
              const response = await getCarHintMutation({
                plate: 'SQZ****',
                startTime: '2024-07-09T00:00:00',
                endTime: '2024-07-16T00:00:00',
                minLat: bbox?._sw.lat || 0,
                minLon: bbox?._sw.lng || 0,
                maxLat: bbox?._ne.lat || 90,
                maxLon: bbox?._ne.lng || 90,
              })

              console.log({ response })
            }}
            className="flex h-9 w-9 gap-2 p-2"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <fieldset></fieldset>
      </form>
    </div>
  )
}
