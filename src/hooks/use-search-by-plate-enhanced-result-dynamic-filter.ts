import { useEffect, useState } from 'react'

import type { Vehicle } from '@/models/entities'

interface UsePlatesDynamicFilterProps {
  data: Vehicle[] | undefined
}

export interface UseSearchByPlateEnhancedResultDynamicFilter {
  filteredData: Vehicle[] | undefined
  selectedPlate: string
  setSelectedPlate: (plate: string) => void
  brandModelOptions: string[]
  selectedBrandModel: string[]
  setSelectedBrandModel: (brandModel: string[]) => void
  colorOptions: string[]
  selectedColors: string[]
  setSelectedColors: (colors: string[]) => void
}
export function useSearchByPlateEnhancedResultDynamicFilter({
  data,
}: UsePlatesDynamicFilterProps): UseSearchByPlateEnhancedResultDynamicFilter {
  const [filteredData, setFilteredData] = useState<Vehicle[] | undefined>(
    undefined,
  )
  // Filter States
  const [selectedPlate, setSelectedPlate] = useState('')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedBrandModel, setSelectedBrandModel] = useState<string[]>([])

  // Filter Options
  const [colorOptions, setColorOptions] = useState<string[]>([])
  const [brandModelOptions, setBrandModelOptions] = useState<string[]>([])

  function filterByPlate(vehicles: Vehicle[], plate: string) {
    // Transforma caracteres minúsculos em maiúsculos
    const upperCasePlate = plate.toUpperCase()
    setSelectedPlate(upperCasePlate)

    if (!plate) return vehicles

    if (!plate.includes('*')) {
      return vehicles.filter((vehicle) =>
        vehicle.placa.includes(upperCasePlate),
      )
    }

    const regexString = `\\b${plate.replace(/\*/g, '.*')}\\b`
    const regex = new RegExp(regexString, 'i')

    return vehicles.filter((vehicle) => regex.test(vehicle.placa))
  }

  function filterByColor(vehicles: Vehicle[], colors: string[]) {
    setSelectedColors(colors)

    if (colors.length === 0) return vehicles

    return vehicles.filter((vehicle) => colors.includes(vehicle.cor))
  }

  function filterByBrandModel(vehicles: Vehicle[], brandModels: string[]) {
    setSelectedBrandModel(brandModels) // Corrected state update

    if (brandModels.length === 0) return vehicles

    return vehicles.filter((vehicle) =>
      brandModels.includes(vehicle.marcaModelo),
    )
  }

  useEffect(() => {
    const filteredByPlateResult = filterByPlate(data || [], selectedPlate)
    const filteredByColor = filterByColor(filteredByPlateResult, selectedColors)
    const filteredByBrandModel = filterByBrandModel(
      filteredByColor,
      selectedBrandModel, // Corrected state usage
    )
    setFilteredData(filteredByBrandModel)
  }, [selectedPlate, selectedColors, selectedBrandModel])

  useEffect(() => {
    setFilteredData(data)

    const colorWithDuplicates = data?.map((vehicle) => vehicle.cor)
    const uniqueColors = [...new Set(colorWithDuplicates)]
    setColorOptions(uniqueColors)

    const brandModelWithDuplicates = data?.map((vehicle) => vehicle.marcaModelo)
    const uniqueBrandModels = [...new Set(brandModelWithDuplicates)]
    setBrandModelOptions(uniqueBrandModels)
  }, [data])

  return {
    filteredData,
    selectedPlate,
    setSelectedPlate,
    colorOptions,
    selectedColors,
    setSelectedColors,
    brandModelOptions,
    selectedBrandModel,
    setSelectedBrandModel,
  }
}
