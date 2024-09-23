import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

import { MultiSelectWithSearch } from '@/components/custom/multi-select-with-search'
import { Input } from '@/components/ui/input'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'

interface FilterProps {
  data: DetectionDTO[] | undefined
  setFilteredData: Dispatch<SetStateAction<DetectionDTO[] | undefined>>
}

export function Filter({ setFilteredData, data }: FilterProps) {
  // Filter States
  const [selectedPlate, setSelectedPlate] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  // Filter Options
  // const [brandModelOptions, setBrandModelOptions] = useState<string[]>([])
  // const [colorsOptions, setColorOptions] = useState<string[]>([])
  const [locationOptions, setLocationOptions] = useState<string[]>([])

  function filterByPlate(detections: DetectionDTO[], plate: string) {
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

  function filterByLocation(detections: DetectionDTO[], locations: string[]) {
    setSelectedLocations(locations)

    if (locations.length === 0) return detections

    return detections.filter((detection) =>
      locations.includes(detection.location),
    )
  }

  useEffect(() => {
    const filteredByLocation = filterByLocation(data || [], selectedLocations)
    const filteredByPlateResult = filterByPlate(
      filteredByLocation,
      selectedPlate,
    )
    setFilteredData(filteredByPlateResult)
  }, [selectedPlate, selectedLocations])

  useEffect(() => {
    setFilteredData(data)

    // Filtra as localizações únicas
    const locationWithDuplicates = data?.map((detection) => detection.location)
    const uniqueLocations = [...new Set(locationWithDuplicates)]
    setLocationOptions(uniqueLocations)
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
