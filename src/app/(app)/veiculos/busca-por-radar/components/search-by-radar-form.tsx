'use client'
import '@/utils/date-extensions'

import { memo } from 'react'

import { useRadarSearchForm } from '@/hooks/searchForm'
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { useMapLayers, useMapStore } from '@/stores/use-map-store'

import { SearchByRadarFormView } from './search-by-radar-form-view'

export const SearchByRadarForm = memo(function SearchByRadarForm() {
  const { formattedSearchParams } = useCarRadarSearchParams()
  const { radars } = useMapLayers()
  const setViewport = useMapStore((state) => state.setViewport)
  const { selectedObjects, setSelectedObjects, data: radarsData } = radars

  const { control, handleSubmit, isSubmitting, errors, MIN_DATE, MAX_DATE } =
    useRadarSearchForm({
      selectedObjects,
      radars: radarsData,
      formattedSearchParams,
    })

  return (
    <SearchByRadarFormView
      control={control}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      errors={errors}
      minDate={MIN_DATE}
      maxDate={MAX_DATE}
      selectedRadars={selectedObjects}
      radars={radarsData}
      setSelectedObjects={setSelectedObjects}
      setViewport={setViewport}
    />
  )
})
