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
import { useMap } from '@/hooks/useContexts/use-map-context'
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'

import { DateField } from './date-field'
import { InputField } from './input-field'
import { SelectedRadarsList } from './selected-radars-list'

export const SearchByRadarForm = memo(function SearchByRadarForm() {
  const { formattedSearchParams } = useCarRadarSearchParams()
  const {
    layers: {
      radars: { selectedObjects, setSelectedObjects, data: radars },
    },
    setViewport,
  } = useMap()

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
    radars,
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
            label="Data/Hora de Início"
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
            minDate={MIN_DATE}
            maxDate={MAX_DATE}
          />

          <DateField
            name="endDate"
            label="Data/Hora de Fim"
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
            label="Placa"
            placeholder="Digite a placa do veículo"
            control={control}
            isSubmitting={isSubmitting}
            errors={errors}
          />

          <div className="flex w-full flex-col">
            <label className="mb-2 text-sm font-medium text-muted-foreground">
              Radares
            </label>
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
                  radars={radars}
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
