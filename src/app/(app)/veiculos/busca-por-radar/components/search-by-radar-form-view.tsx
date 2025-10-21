import type { FormEventHandler } from 'react'
import type { Control, FieldErrors } from 'react-hook-form'

import type { RadarSearchFormData } from '@/app/(app)/veiculos/components/validationSchemas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Radar } from '@/models/entities'

import { DateField } from './date-field'
import { FormField } from './form-field'
import { InputField } from './input-field'
import { SelectedRadarsPopover } from './selected-radars-popover'

type SearchByRadarFormViewProps = {
  control: Control<RadarSearchFormData>
  onSubmit: FormEventHandler<HTMLFormElement>
  isSubmitting: boolean
  errors: FieldErrors<RadarSearchFormData>
  minDate: Date
  maxDate: Date
  selectedRadars: Radar[]
  radars: Radar[] | undefined
  setSelectedObjects: (radars: Radar[] | ((prev: Radar[]) => Radar[])) => void
  setViewport: (props: {
    longitude: number
    latitude: number
    zoom: number
  }) => void
}

export function SearchByRadarFormView({
  control,
  onSubmit,
  isSubmitting,
  errors,
  minDate,
  maxDate,
  selectedRadars,
  radars,
  setSelectedObjects,
  setViewport,
}: SearchByRadarFormViewProps) {
  return (
    <>
      <Card className="mb-0 w-full max-w-screen-md p-4">
        <h1 className="text-lg font-bold">Busca por Radar</h1>
      </Card>

      <Card className="flex w-full max-w-screen-md flex-col p-6">
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-x-8 gap-y-2">
          <DateField
            name="startDate"
            control={control}
            isSubmitting={isSubmitting}
            minDate={minDate}
            maxDate={maxDate}
            error={errors.startDate?.message}
          />

          <DateField
            name="endDate"
            control={control}
            isSubmitting={isSubmitting}
            minDate={minDate}
            maxDate={maxDate}
            error={errors.endDate?.message}
          />

          <InputField
            name="plate"
            placeholder="Digite a placa do veículo"
            control={control}
            isSubmitting={isSubmitting}
            error={errors.plate?.message}
          />

          <FormField
            control={control}
            name="radarIds"
            error={errors.radarIds?.message}
          >
            {({ value }) => (
              <SelectedRadarsPopover
                selectedRadarIds={Array.isArray(value) ? value : []}
                selectedRadars={selectedRadars}
                radars={radars}
                setSelectedObjects={setSelectedObjects}
                setViewport={setViewport}
              />
            )}
          </FormField>

          <div className="col-span-2 mt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
