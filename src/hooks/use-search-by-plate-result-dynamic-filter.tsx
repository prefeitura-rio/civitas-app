import { useEffect, useState } from 'react'

type PlateRow = {
  plate: string
}

interface UsePlatesDynamicFilterProps {
  data: PlateRow[] | undefined
}

export interface UseSearchByPlateResultDynamicFilter {
  filteredData: PlateRow[] | undefined
  selectedPlate: string
  setSelectedPlate: (plate: string) => void
}
export function useSearchByPlateResultDynamicFilter({
  data,
}: UsePlatesDynamicFilterProps): UseSearchByPlateResultDynamicFilter {
  const [filteredData, setFilteredData] = useState<PlateRow[] | undefined>(
    undefined,
  )
  // Filter States
  const [selectedPlate, setSelectedPlate] = useState('')

  function filterByPlate(detections: PlateRow[], plate: string) {
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

  useEffect(() => {
    if (
      data &&
      data.length > 0 &&
      JSON.stringify(data) !== JSON.stringify(filteredData)
    ) {
      setFilteredData(data)
    }
  }, [data])

  useEffect(() => {
    const filteredByPlateResult = filterByPlate(data || [], selectedPlate)
    setFilteredData(filteredByPlateResult)
  }, [data, selectedPlate])

  return {
    filteredData,
    selectedPlate,
    setSelectedPlate,
  }
}
