import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

import { MultiSelectWithSearch } from '@/components/custom/multi-select-with-search'
import { Input } from '@/components/ui/input'
import type { EnhancedDetectionDTO } from '@/hooks/use-queries/use-enhanced-radars-search'

interface FilterProps {
  data: EnhancedDetectionDTO[] | undefined
  setFilteredData: Dispatch<SetStateAction<EnhancedDetectionDTO[] | undefined>>
}

export function Filter({ setFilteredData, data }: FilterProps) {
  // Filter States
  const [selectedPlate, setSelectedPlate] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedBrandModel, setSelectedBrandModel] = useState<string[]>([])

  // Filter Options
  const [colorOptions, setColorOptions] = useState<string[]>([])
  const [brandModelOptions, setBrandModelOptions] = useState<string[]>([])
  const [locationOptions, setLocationOptions] = useState<string[]>([])

  function filterByPlate(detections: EnhancedDetectionDTO[], plate: string) {
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

  function filterByLocation(
    detections: EnhancedDetectionDTO[],
    locations: string[],
  ) {
    setSelectedLocations(locations)

    if (locations.length === 0) return detections

    return detections.filter((detection) =>
      locations.includes(detection.location),
    )
  }

  function filterByColor(detections: EnhancedDetectionDTO[], colors: string[]) {
    setSelectedColors(colors)

    if (colors.length === 0) return detections

    return detections.filter((detection) => colors.includes(detection.color))
  }

  function filterByBrandModel(
    detections: EnhancedDetectionDTO[],
    brandModels: string[],
  ) {
    setSelectedBrandModel(brandModels) // Corrected state update

    if (brandModels.length === 0) return detections

    return detections.filter((detection) =>
      brandModels.includes(detection.brandModel),
    )
  }

  useEffect(() => {
    const filteredByPlateResult = filterByPlate(data || [], selectedPlate)
    const filteredByColor = filterByColor(filteredByPlateResult, selectedColors)
    const filteredByBrandModel = filterByBrandModel(
      filteredByColor,
      selectedBrandModel, // Corrected state usage
    )
    const filteredByLocation = filterByLocation(
      filteredByBrandModel,
      selectedLocations,
    )
    setFilteredData(filteredByLocation)
  }, [selectedPlate, selectedLocations, selectedColors, selectedBrandModel])

  useEffect(() => {
    setFilteredData(data)

    const locationWithDuplicates = data?.map((detection) => detection.location)
    const uniqueLocations = [...new Set(locationWithDuplicates)]
    setLocationOptions(uniqueLocations)

    const colorWithDuplicates = data?.map((detection) => detection.color)
    const uniqueColors = [...new Set(colorWithDuplicates)]
    setColorOptions(uniqueColors)

    const brandModelWithDuplicates = data?.map(
      (detection) => detection.brandModel,
    )
    const uniqueBrandModels = [...new Set(brandModelWithDuplicates)]
    setBrandModelOptions(uniqueBrandModels)
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
      <div>
        <MultiSelectWithSearch
          options={colorOptions.map((item) => {
            return {
              label: item,
              value: item,
            }
          })}
          onValueChange={(item) => {
            setSelectedColors(item)
          }}
          defaultValue={selectedColors}
          placeholder="Selecione uma cor"
          variant="secondary"
          maxCount={2}
        />
      </div>
      <div>
        <MultiSelectWithSearch
          options={brandModelOptions.map((item) => {
            return {
              label: item,
              value: item,
            }
          })}
          onValueChange={(item) => {
            setSelectedBrandModel(item)
          }}
          defaultValue={selectedBrandModel} // Corrected default value
          placeholder="Selecione um modelo"
          variant="secondary"
          maxCount={2}
        />
      </div>
    </div>
  )
}
