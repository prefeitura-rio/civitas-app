import { zodResolver } from '@hookform/resolvers/zod'
import type { Feature } from 'geojson'
import { Search, X } from 'lucide-react'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { getPlaces } from '@/http/mapbox/get-places'
import { cn } from '@/lib/utils'

const searchFormSchema = z.object({
  address: z.string().min(1),
})

type SearchForm = z.infer<typeof searchFormSchema>

interface SearchBoxProps {
  isAddressmarkerEnabled: boolean
  setIsAddressmarkerEnabled: Dispatch<SetStateAction<boolean>>
}

export function SearchBox({
  isAddressmarkerEnabled,
  setIsAddressmarkerEnabled,
}: SearchBoxProps) {
  const { setAddressmMarkerPositionState } = useCarPath()
  const [suggestions, setSuggestions] = useState<Feature[]>([])
  const [openSuggestions, setOpenSuggestions] = useState(true)

  const { setViewport, viewport } = useCarPath()

  const { watch, handleSubmit, register, reset, setValue } =
    useForm<SearchForm>({
      resolver: zodResolver(searchFormSchema),
    })

  const address = watch('address')

  function onSubmit() {
    // ...
  }

  useEffect(() => {
    const getData = async (query: string) => {
      try {
        const response = await getPlaces(query)
        console.log(response.data)
        const places = response.data.features
        setSuggestions(places)
        console.log(places)
      } catch (error) {
        console.error(error)
        setSuggestions([])
      }
    }

    const encodedQuery = encodeURIComponent(address)
    getData(encodedQuery)
  }, [address])

  return (
    <Card
      className={cn(
        'absolute-x-centered top-2 z-50 w-64',
        suggestions.length > 0 ? 'rounded-b-none' : '',
      )}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        onFocus={() => setOpenSuggestions(true)}
        onBlur={() => setOpenSuggestions(false)}
      >
        <div className="relative flex items-center">
          <Search className="absolute left-2 h-4 w-4" />
          <Input
            {...register('address')}
            placeholder="Pequise um endereço"
            className={cn(
              'pl-8 focus-visible:ring-0 focus-visible:ring-offset-0',
              suggestions.length > 0 ? 'rounded-b-none' : '',
            )}
            autoComplete="off"
          />
          {isAddressmarkerEnabled && (
            <Button
              className="absolute right-2 h-5 w-5 p-0"
              variant="ghost"
              onClick={() => {
                reset()
                setIsAddressmarkerEnabled(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div
          className={cn(
            'flex flex-col p-1',
            !openSuggestions || suggestions.length === 0 ? 'hidden' : '',
          )}
        >
          {suggestions.map((item) => {
            return (
              <div
                className="rounded-lg p-2 hover:cursor-default hover:bg-accent"
                onMouseDown={() => {
                  setValue('address', item.properties?.full_address)
                  const coordinates = item.properties?.coordinates
                  console.log({ coordinates })
                  const lon = Number(coordinates?.longitude)
                  const lat = Number(coordinates?.latitude)
                  setViewport({
                    ...viewport,
                    zoom: 14.15,
                    longitude: lon,
                    latitude: lat,
                  })
                  setAddressmMarkerPositionState([lon, lat])
                  setIsAddressmarkerEnabled(true)
                  setSuggestions([])
                }}
              >
                <span>{item.properties?.full_address}</span>
              </div>
            )
          })}
        </div>
      </form>
    </Card>
  )
}
