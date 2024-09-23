import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

import { MultiSelectWithSearch } from '@/components/custom/multi-select-with-search'
import { Input } from '@/components/ui/input'

import type { Detection } from './detections-table'

interface FilterProps {
  data: Detection[] | undefined
  setFilteredData: Dispatch<SetStateAction<Detection[] | undefined>>
}

export function Filter({ setFilteredData, data }: FilterProps) {
  // Filter States
  const [selectedPlate, setSelectedPlate] = useState('')
  const [selectedBrandModels, setSelectedBrandModels] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  // Filter Options
  const [brandModelOptions, setBrandModelOptions] = useState<string[]>([])
  const [colorsOptions, setColorOptions] = useState<string[]>([])
  const [locationOptions, setLocationOptions] = useState<string[]>([])

  function filterByPlate(detections: Detection[], plate: string) {
    // Transforma caracteres minúsculos em maiúsculos
    const upperCasePlate = plate.toUpperCase()
    setSelectedPlate(upperCasePlate)

    if (!plate) return detections

    if (!plate.includes('*')) {
      return detections.filter((detection) =>
        detection.plate.includes(upperCasePlate),
      )
    }

    const regexString = `\\b${plate.replace(/\*/g, '.*')}\\b`
    const regex = new RegExp(regexString, 'i')

    return detections.filter((detection) => regex.test(detection.plate))
  }

  function filterByBrandModel(detections: Detection[], brandModels: string[]) {
    setSelectedBrandModels(brandModels)

    if (brandModels.length === 0) return detections

    return detections.filter((detection) =>
      brandModels.includes(detection.brandModel),
    )
  }

  function filterByLocation(detections: Detection[], locations: string[]) {
    setSelectedLocations(locations)

    if (locations.length === 0) return detections

    return detections.filter((detection) =>
      locations.includes(detection.location),
    )
  }

  function filterByColor(detections: Detection[], colors: string[]) {
    setSelectedColors(colors)

    if (colors.length === 0) return detections

    return detections.filter((detection) => colors.includes(detection.color))
  }

  useEffect(() => {
    const filteredByLocation = filterByLocation(data || [], selectedLocations)
    const filteredByBrandModelResult = filterByBrandModel(
      filteredByLocation,
      selectedBrandModels,
    )
    const filteredByPlateResult = filterByPlate(
      filteredByBrandModelResult,
      selectedPlate,
    )
    const filteredByColorResult = filterByColor(
      filteredByPlateResult,
      selectedColors,
    )
    setFilteredData(filteredByColorResult)
  }, [selectedPlate, selectedBrandModels, selectedColors, selectedLocations])

  useEffect(() => {
    setFilteredData(data)

    // Filtra as marcas e modelos únicos
    const brandModelsWithDuplicates = data?.map(
      (detection) => detection.brandModel,
    )
    const uniqueBrandModels = [...new Set(brandModelsWithDuplicates)]
    setBrandModelOptions(uniqueBrandModels)

    // Filtra as localizações únicas
    const locationWithDuplicates = data?.map((detection) => detection.location)
    const uniqueLocations = [...new Set(locationWithDuplicates)]
    setLocationOptions(uniqueLocations)

    // Filtra as cores únicas
    const colorWithDuplicates = data?.map((detection) => detection.color)
    const uniqueColors = [...new Set(colorWithDuplicates)]
    setColorOptions(uniqueColors)
  }, [data])

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Input
        value={selectedPlate}
        onChange={(e) => setSelectedPlate(e.target.value)}
        className="w-44"
        placeholder="Filtrar por placa"
      />
      <div>
        <MultiSelectWithSearch
          options={locationOptions.map((item) => {
            return {
              label: item,
              value: item,
            }
          })}
          onValueChange={(item) => {
            setSelectedLocations(item)
          }}
          defaultValue={selectedLocations}
          placeholder="Selecione uma localidade"
          variant="secondary"
          maxCount={2}
        />
      </div>
    </div>
  )
}
