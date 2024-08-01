import { zodResolver } from '@hookform/resolvers/zod'
import type { Feature } from 'geojson'
import { Search, X } from 'lucide-react'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { SetViewportProps } from '@/hooks/map-layers/use-trips-data'
import { getPlaces } from '@/http/mapbox/get-places'
import { cn } from '@/lib/utils'
import type { AddressMarker } from '@/models/utils'

const searchFormSchema = z.object({
  address: z.string().min(1),
})

type SearchForm = z.infer<typeof searchFormSchema>

interface SearchBoxProps {
  setAddressMarker: Dispatch<SetStateAction<AddressMarker | null>>
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
  setViewport: (props: SetViewportProps) => void
}

export function SearchBox({
  isVisible,
  setAddressMarker,
  setIsVisible,
  setViewport,
}: SearchBoxProps) {
  const [suggestions, setSuggestions] = useState<Feature[]>([])
  const [openSuggestions, setOpenSuggestions] = useState(true)

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
        const places = response.data.features
        setSuggestions(places)
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
        suggestions.length === 0 || !openSuggestions ? '' : 'rounded-b-none',
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
              'pl-8 pr-8 focus-visible:ring-0 focus-visible:ring-offset-0',
              suggestions.length === 0 || !openSuggestions
                ? ''
                : 'rounded-b-none',
            )}
            autoComplete="off"
          />
          {isVisible && (
            <Button
              className="absolute right-2 h-5 w-5 p-0"
              variant="ghost"
              onClick={() => {
                reset()
                setIsVisible(false)
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
          {suggestions.map((item, index) => {
            return (
              <div
                key={index}
                className="rounded-lg p-2 hover:cursor-default hover:bg-accent"
                onMouseDown={() => {
                  setValue('address', item.properties?.full_address)
                  const coordinates = item.properties?.coordinates
                  const lon = Number(coordinates?.longitude)
                  const lat = Number(coordinates?.latitude)
                  setViewport({
                    zoom: 14.15,
                    longitude: lon,
                    latitude: lat,
                  })
                  setAddressMarker({
                    longitude: lon,
                    latitude: lat,
                  })
                  setIsVisible(true)
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
