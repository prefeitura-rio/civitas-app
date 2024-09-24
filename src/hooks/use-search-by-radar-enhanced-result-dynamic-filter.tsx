import { useEffect, useState } from 'react'

import type { EnhancedDetectionDTO } from './use-queries/use-enhanced-radars-search'

interface UseRadarsDynamicFilterProps {
  data: EnhancedDetectionDTO[] | undefined
}

export interface UseSearchByRadarEnhancedResultDynamicFilter {
  filteredData: EnhancedDetectionDTO[] | undefined
  setFilteredData: (data: EnhancedDetectionDTO[] | undefined) => void
  selectedPlate: string
  setSelectedPlate: (plate: string) => void
  selectedLocations: string[]
  setSelectedLocations: (locations: string[]) => void
  selectedRadars: string[]
  setSelectedRadars: (radars: string[]) => void
  locationOptions: string[]
  colorOptions: string[]
  brandModelOptions: string[]
  selectedBrandModel: string[]
  setSelectedBrandModel: (brandModel: string[]) => void
  selectedColors: string[]
  setSelectedColors: (colors: string[]) => void
}
export function useSearchByRadarEnhancedResultDynamicFilter({
  data,
}: UseRadarsDynamicFilterProps): UseSearchByRadarEnhancedResultDynamicFilter {
  const [filteredData, setFilteredData] = useState<
    EnhancedDetectionDTO[] | undefined
  >(undefined)
  // Filter States
  const [selectedPlate, setSelectedPlate] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedBrandModel, setSelectedBrandModel] = useState<string[]>([])
  const [selectedRadars, setSelectedRadars] = useState<string[]>([])

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

  function filterByRadar(detections: EnhancedDetectionDTO[], radars: string[]) {
    setSelectedRadars(radars)

    if (radars.length === 0) return detections

    return detections.filter((detection) =>
      radars.includes(detection.cameraNumber),
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
    const filteredByRadars = filterByRadar(filteredByBrandModel, selectedRadars)
    const filteredByLocation = filterByLocation(
      filteredByRadars,
      selectedLocations,
    )
    setFilteredData(filteredByLocation)
  }, [
    selectedPlate,
    selectedLocations,
    selectedColors,
    selectedBrandModel,
    selectedRadars,
  ])

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

  return {
    filteredData,
    setFilteredData,
    selectedPlate,
    setSelectedPlate,
    selectedLocations,
    setSelectedLocations,
    selectedRadars,
    setSelectedRadars,
    selectedBrandModel,
    setSelectedBrandModel,
    selectedColors,
    setSelectedColors,
    locationOptions,
    colorOptions,
    brandModelOptions,
  }
}
