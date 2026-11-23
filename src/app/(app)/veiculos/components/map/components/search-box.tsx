import { zodResolver } from '@hookform/resolvers/zod'
import type { Feature } from 'geojson'
import { Search, X } from 'lucide-react'
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getPlaces } from '@/http/mapbox/get-places'
import { getReversePlaces } from '@/http/mapbox/get-reverse-places'
import { cn } from '@/lib/utils'
import type { Camera, CollectionPoint } from '@/models/entities'
import type { AddressMarker, SetViewportProps } from '@/models/utils'
import { getCoincidentPointOffsets } from '@/utils/coincident-point-offsets'
import {
  getCameraOrigin,
  getCollectionPointOrigin,
} from '@/utils/collection-point-origin'
import { parseCoordinates } from '@/utils/coordinate-parser'
import { getRioSearchArea } from '@/utils/rio-search-area'

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
  radars?: CollectionPoint[]
  cameras?: Camera[]
  visibleRadars?: CollectionPoint[]
  visibleCameras?: Camera[]
  setEquipmentHighlight?: (marker: AddressMarker | null) => void
}

export function SearchBox({
  isVisible,
  setAddressMarker,
  setIsVisible,
  setViewport,
  onSubmit,
  radars,
  cameras,
  visibleRadars,
  visibleCameras,
  setEquipmentHighlight,
  placeHolder = 'Pesquise um endereço, equipamento ou coordenadas',
}: SearchBoxProps) {
  const [suggestions, setSuggestions] = useState<Feature[]>([])
  const [openSuggestions, setOpenSuggestions] = useState(false)
  const [searchMessage, setSearchMessage] = useState<string | null>(null)

  const { watch, handleSubmit, register, reset, setValue } =
    useForm<SearchForm>({
      resolver: zodResolver(searchFormSchema),
    })

  const address = watch('address')
  const debouncedAddress = useDebounce(address, 400)
  useEffect(() => {
    setEquipmentHighlight?.(null)
  }, [visibleRadars, visibleCameras, setEquipmentHighlight])
  const equipmentSuggestions = useMemo(() => {
    const normalize = (code: string) =>
      code
        .trim()
        .replace(/^0+(?=.)/, '')
        .toUpperCase()
    const query = address?.trim()
    if (!query || parseCoordinates(query)) return []

    const matches = (code: string | null | undefined) =>
      !!code?.trim() && normalize(code) === normalize(query)
    const radarPositions = getCoincidentPointOffsets(radars ?? [], (point) => [
      point.longitude,
      point.latitude,
    ])
    const cameraPositions = getCoincidentPointOffsets(
      cameras ?? [],
      (point) => [point.longitude, point.latitude],
    )

    return [
      ...(visibleRadars ?? radars ?? [])
        .filter((radar) => matches(radar.cetRioCode))
        .map((radar) => ({
          code: radar.cetRioCode,
          location: radar.location,
          origin: getCollectionPointOrigin(radar.company),
          type: 'LPR',
          position: radarPositions.get(radar) ?? [
            radar.longitude,
            radar.latitude,
          ],
        })),
      ...(visibleCameras ?? cameras ?? [])
        .filter((camera) => matches(camera.code))
        .map((camera) => ({
          code: camera.code,
          location: camera.location,
          origin: getCameraOrigin(camera.sistemaOrigem),
          type: 'Câmera',
          position: cameraPositions.get(camera) ?? [
            camera.longitude,
            camera.latitude,
          ],
        })),
    ]
  }, [address, radars, cameras, visibleRadars, visibleCameras])
  const hasEquipmentSuggestions = equipmentSuggestions.length > 0
  const hasSuggestions =
    hasEquipmentSuggestions || suggestions.length > 0 || !!searchMessage

  useEffect(() => {
    let active = true
    setSuggestions([])
    setSearchMessage(null)
    const getData = async (query: string) => {
      try {
        const coordinates = parseCoordinates(query)
        const area = await getRioSearchArea()
        if (!active) return
        if (
          coordinates &&
          !area.contains([coordinates.longitude, coordinates.latitude])
        ) {
          setSearchMessage(
            'Informe coordenadas dentro do município do Rio de Janeiro.',
          )
          return
        }
        const data = coordinates
          ? await getReversePlaces(coordinates.latitude, coordinates.longitude)
          : await getPlaces(query, area.bounds)
        if (!active) return
        const places = data.features.filter((feature) =>
          area.contains([
            feature.properties?.coordinates?.longitude,
            feature.properties?.coordinates?.latitude,
          ]),
        )
        setSuggestions(
          places.map((feature) =>
            coordinates
              ? {
                  ...feature,
                  properties: { ...feature.properties, coordinates },
                }
              : feature,
          ),
        )
        if (!places.length) {
          setSearchMessage(
            'Nenhum endereço encontrado no município do Rio de Janeiro.',
          )
        }
      } catch (error) {
        console.error(error)
        if (active) {
          setSuggestions([])
          setSearchMessage(
            'Não foi possível buscar endereços. Tente novamente.',
          )
        }
      }
    }

    if (
      debouncedAddress &&
      address === debouncedAddress &&
      debouncedAddress.trim().length > 0 &&
      !hasEquipmentSuggestions
    ) {
      getData(debouncedAddress)
    } else {
      setSuggestions([])
    }
    return () => {
      active = false
    }
  }, [address, debouncedAddress, hasEquipmentSuggestions])

  return (
    <Card
      className={cn(
        'w-[21.125rem]',
        !hasSuggestions || !openSuggestions ? '' : 'rounded-b-none',
      )}
    >
      <form
        onSubmit={handleSubmit((values) => {
          if (hasEquipmentSuggestions) {
            setOpenSuggestions(true)
          } else {
            onSubmit?.(values)
          }
        })}
        onFocus={() => setOpenSuggestions(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpenSuggestions(false)
          }
        }}
      >
        <div className="relative flex w-[21rem] items-center">
          <Search className="absolute left-2 h-4 w-4" />
          <Input
            {...register('address', {
              onChange: () => setOpenSuggestions(true),
            })}
            placeholder={placeHolder}
            className={cn(
              'pl-8 pr-8 focus-visible:ring-0 focus-visible:ring-offset-0',
              !hasSuggestions || !openSuggestions ? '' : 'rounded-b-none',
            )}
            autoComplete="off"
          />
          {isVisible && (
            <Button
              type="button"
              className="absolute right-2 h-5 w-5 p-0"
              variant="ghost"
              onClick={() => {
                reset()
                setIsVisible(false)
                setEquipmentHighlight?.(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div
          className={cn(
            'flex max-h-80 flex-col overflow-y-auto p-1',
            !openSuggestions || !hasSuggestions ? 'hidden' : '',
          )}
        >
          {hasEquipmentSuggestions && (
            <div role="group" aria-label="Equipamentos encontrados">
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                Equipamentos ({equipmentSuggestions.length})
              </p>
              {equipmentSuggestions.map((equipment, index) => (
                <button
                  key={`${equipment.type}-${equipment.origin}-${equipment.code}-${index}`}
                  type="button"
                  className="flex w-full flex-col rounded-lg p-2 text-left hover:bg-accent focus:bg-accent"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setValue('address', equipment.code)
                    setViewport({
                      zoom: 20,
                      longitude: equipment.position[0],
                      latitude: equipment.position[1],
                    })
                    setAddressMarker(null)
                    setIsVisible(false)
                    setEquipmentHighlight?.({
                      longitude: equipment.position[0],
                      latitude: equipment.position[1],
                    })
                    setOpenSuggestions(false)
                  }}
                >
                  <span className="font-medium">
                    {equipment.code} · {equipment.type} · {equipment.origin}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {equipment.location || 'Endereço não informado'}
                  </span>
                </button>
              ))}
            </div>
          )}
          {!hasEquipmentSuggestions && searchMessage && (
            <p
              role="status"
              className="px-2 py-2 text-sm text-muted-foreground"
            >
              {searchMessage}
            </p>
          )}
          {!hasEquipmentSuggestions &&
            suggestions.map((item, index) => {
              const coordinates = item.properties?.coordinates
              const lon = Number(coordinates?.longitude)
              const lat = Number(coordinates?.latitude)

              return (
                <div
                  key={index}
                  className="rounded-lg p-2 hover:cursor-default hover:bg-accent"
                  onMouseDown={() => {
                    setEquipmentHighlight?.(null)
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
