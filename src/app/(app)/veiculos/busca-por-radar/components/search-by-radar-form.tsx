'use client'
import '@/utils/date-extensions'

import { MapPinIcon } from 'lucide-react'
import { memo } from 'react'

import { InputError } from '@/components/custom/input-error'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useRadarSearchForm } from '@/hooks/searchForm'
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { useMapLayers, useMapStore } from '@/stores/use-map-store'

import { DateField } from './date-field'
import { InputField } from './input-field'
import { SelectedRadarsList } from './selected-radars-list'

export const SearchByRadarForm = memo(function SearchByRadarForm() {
  const { formattedSearchParams } = useCarRadarSearchParams()
  const { radars } = useMapLayers()
  const setViewport = useMapStore((state) => state.setViewport)
  const { selectedObjects, setSelectedObjects, data: radarsData } = radars

  const {
    control,
    handleSubmit,
    isSubmitting,
    errors,
    timeValidation,
    MIN_DATE,
    MAX_DATE,
  } = useRadarSearchForm({
    selectedObjects,
    setSelectedObjects,
    radars: radarsData,
    formattedSearchParams,
  })

  return (
    <>
      <Card className="mb-0 w-full max-w-screen-md p-4">
        <h1 className="text-lg font-bold">Busca por Radar</h1>
      </Card>

      <Card className="flex w-full max-w-screen-md flex-col p-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-x-8 gap-y-2"
        >
          <DateField
            name="startDate"
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
            minDate={MIN_DATE}
            maxDate={MAX_DATE}
          />

          <DateField
            name="endDate"
            showValidation={true}
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
            timeValidation={timeValidation}
            minDate={MIN_DATE}
            maxDate={MAX_DATE}
          />

          <InputField
            name="plate"
            placeholder="Digite a placa do veículo"
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
          />

          <div className="flex w-full flex-col">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  <MapPinIcon className="mr-2 size-4 shrink-0" />
                  Radares ({selectedObjects.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={2}
                className="max-h-96 w-80 overflow-y-auto"
              >
                <SelectedRadarsList
                  selectedObjects={selectedObjects}
                  radars={radarsData}
                  setSelectedObjects={setSelectedObjects}
                  setViewport={setViewport}
                />
              </PopoverContent>
            </Popover>
            <InputError message={errors.radarIds?.message} />
          </div>

          <div className="col-span-2 mt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
})
