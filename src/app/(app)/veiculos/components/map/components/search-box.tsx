import { zodResolver } from '@hookform/resolvers/zod'
import type { Feature } from 'geojson'
import { Search, X } from 'lucide-react'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getPlaces } from '@/http/mapbox/get-places'
import { getReversePlaces } from '@/http/mapbox/get-reverse-places'
import { cn } from '@/lib/utils'
import type { AddressMarker, SetViewportProps } from '@/models/utils'
import { parseCoordinates } from '@/utils/coordinate-parser'

const searchFormSchema = z.object({
  address: z.string().min(1),
})

type SearchForm = z.infer<typeof searchFormSchema>

interface SearchBoxProps {
  setAddressMarker: Dispatch<SetStateAction<AddressMarker | null>>
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
  setViewport: (props: SetViewportProps) => void
  onSubmit?: (props: SearchForm) => void
  placeHolder?: string
}

export function SearchBox({
  isVisible,
  setAddressMarker,
  setIsVisible,
  setViewport,
  onSubmit,
  placeHolder = 'Pesquise um endereço ou coordenadas (ex: -22.808889, -43.413889)',
}: SearchBoxProps) {
  const [suggestions, setSuggestions] = useState<Feature[]>([])
  const [openSuggestions, setOpenSuggestions] = useState(false)

  const { watch, handleSubmit, register, reset, setValue } =
    useForm<SearchForm>({
      resolver: zodResolver(searchFormSchema),
    })

  const address = watch('address')

  useEffect(() => {
    const getData = async (query: string) => {
      try {
        // Verifica se o input são coordenadas
        const coordinates = parseCoordinates(query)

        if (coordinates) {
          // Se são coordenadas, faz reverse geocoding
          const data = await getReversePlaces(
            coordinates.latitude,
            coordinates.longitude,
          )
          const places = data.features
          setSuggestions(places)
        } else {
          // Se não são coordenadas, faz busca normal
          const data = await getPlaces(query)
          const places = data.features
          setSuggestions(places)
        }
      } catch (error) {
        console.error(error)
        setSuggestions([])
      }
    }

    if (address && address.trim().length > 0) {
      getData(address)
    } else {
      setSuggestions([])
    }
  }, [address])

  return (
    <Card
      className={cn(
        'w-[21.125rem]',
        suggestions.length === 0 || !openSuggestions ? '' : 'rounded-b-none',
      )}
    >
      <form
        onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
        onFocus={() => setOpenSuggestions(true)}
        onBlur={() => setOpenSuggestions(false)}
      >
        <div className="relative flex w-[21rem] items-center">
          <Search className="absolute left-2 h-4 w-4" />
          <Input
            {...register('address')}
            placeholder={placeHolder}
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
            const coordinates = item.properties?.coordinates
            const lon = Number(coordinates?.longitude)
            const lat = Number(coordinates?.latitude)

            return (
              <div
                key={index}
                className="rounded-lg p-2 hover:cursor-default hover:bg-accent"
                onMouseDown={() => {
                  setValue('address', item.properties?.full_address)
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
                <div className="flex flex-col">
                  <span className="font-medium">
                    {item.properties?.full_address}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Lat: {lat.toFixed(6)}, Lon: {lon.toFixed(6)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </form>
    </Card>
  )
}
