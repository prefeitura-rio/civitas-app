import { Info } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'

import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tooltip } from '@/components/ui/tooltip'
import { useMap } from '@/hooks/use-contexts/use-map-context'

import { PlateWildcardsHelperInfo } from '../../../common/plate-wildcards-helper-info'
import { SearchByRadarForm } from './components/search-by-radar-form-schema'

export function SearchByRadarFilterForm() {
  const {
    layers: {
      radars: {
        layerStates: { selectedRadar, setSelectedRadar },
      },
    },
  } = useMap()

  if (!selectedRadar) return null

  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = useFormContext<SearchByRadarForm>()

  return (
    <div className="flex w-full flex-col space-y-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink onClick={() => setSelectedRadar(null)}>
            Lista de radares
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{`Câmera número ${selectedRadar.cameraNumber}`}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-4">
        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <div className="space-y-1">
              <div className="flex gap-2">
                <Label htmlFor="plateHint">Data de início:</Label>
                <InputError message={errors.startTime?.message} />
              </div>
              <DatePicker
                date={field.value}
                setDate={field.onChange}
                type="datetime-local"
                disabled={isSubmitting}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="duration"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Label htmlFor="plateHint">Duração:</Label>
              <div className="w-full space-y-2 pt-6">
                <Slider
                  value={field.value}
                  onValueChange={(value) => {
                    if (value[0] > 0) field.onChange([0, value[1]])
                    else if (value[1] < 0) field.onChange([value[0], 0])
                    else field.onChange(value)
                  }}
                  defaultValue={[5, 10]}
                  max={10}
                  min={-10}
                  step={1}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: -10min</span>
                  <span>Max: 10min</span>
                </div>
              </div>
            </div>
          )}
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Label htmlFor="plateHint" className="text-muted-foreground">
              Placa:
            </Label>
            <Tooltip
              asChild
              render={<PlateWildcardsHelperInfo />}
              className="p-0"
            >
              <Info className="h-4 w-4 text-muted-foreground" />
            </Tooltip>
            <span className="text-xs text-muted-foreground">(opcional)</span>
            <InputError message={errors.plateHint?.message} />
          </div>
          <Input
            id="plateHint"
            {...register('plateHint')}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
