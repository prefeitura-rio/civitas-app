import { useEffect, useState } from 'react'

import type { DetectionDTO } from './useQueries/useRadarsSearch'

interface UseRadarsDynamicFilterProps {
  data: DetectionDTO[] | undefined
}

export interface UseSearchByRadarResultDynamicFilter {
  filteredData: DetectionDTO[] | undefined
  setFilteredData: (data: DetectionDTO[] | undefined) => void
  selectedPlate: string
  setSelectedPlate: (plate: string) => void
  selectedLocations: string[]
  setSelectedLocations: (locations: string[]) => void
  selectedRadars: string[]
  setSelectedRadars: (radars: string[]) => void
  locationOptions: string[]
}
export function useSearchByRadarResultDynamicFilter({
  data,
}: UseRadarsDynamicFilterProps): UseSearchByRadarResultDynamicFilter {
  const [filteredData, setFilteredData] = useState<DetectionDTO[] | undefined>(
    undefined,
  )
  // Filter States
  const [selectedPlate, setSelectedPlate] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedRadars, setSelectedRadars] = useState<string[]>([])

  // Filter Options
  const [locationOptions, setLocationOptions] = useState<string[]>([])

  function filterByPlate(detections: DetectionDTO[], plate: string) {
    if (!plate) return detections

    // Transforma caracteres minúsculos em maiúsculos
    const upperCasePlate = plate.toUpperCase()

    if (!plate.includes('*')) {
      return detections.filter((detection) =>
        detection.plate.includes(upperCasePlate),
      )
    }

    const regexString = `\\b${plate.replace(/\*/g, '.*')}\\b`
    const regex = new RegExp(regexString, 'i')

    return detections.filter((detection) => regex.test(detection.plate))
  }

  function filterByLocation(detections: DetectionDTO[], locations: string[]) {
    if (locations.length === 0) return detections

    return detections.filter((detection) =>
      locations.includes(detection.location),
    )
  }

  function filterByRadar(detections: DetectionDTO[], radars: string[]) {
    if (radars.length === 0) return detections

    return detections.filter((detection) =>
      radars.includes(detection.cetRioCode),
    )
  }

  useEffect(() => {
    const filteredByLocation = filterByLocation(data || [], selectedLocations)
    const filteredByRadars = filterByRadar(filteredByLocation, selectedRadars)
    const filteredByPlateResult = filterByPlate(filteredByRadars, selectedPlate)
    setFilteredData(filteredByPlateResult)
  }, [selectedPlate, selectedLocations, selectedRadars])

  useEffect(() => {
    setFilteredData(data)

    // Filtra as localizações únicas
    const locationWithDuplicates = data?.map((detection) => detection.location)
    const uniqueLocations = [...new Set(locationWithDuplicates)]
    setLocationOptions(uniqueLocations)
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
    locationOptions,
  }
}
