import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Download, SatelliteDish } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'
import { exportToCSV } from '@/utils/csv'
import { dateToString } from '@/utils/date-to-string'

import { RadarList } from './components/radar-list'
import { SearchByRadarFilterForm } from './components/search-by-radar-filter-form'
import {
  type SearchByRadarForm,
  searchByRadarFormSchema,
} from './components/search-by-radar-form-schema'

export function SearchByRadar() {
  const { selectedRadar } = useCarPath()
  const form = useForm<SearchByRadarForm>({
    resolver: zodResolver(searchByRadarFormSchema),
    defaultValues: {
      duration: [-5, 5],
    },
  })

  const { handleSubmit } = form

  const { mutateAsync: getCarsByRadarMutation } = useMutation({
    mutationFn: getCarsByRadar,
    onSuccess: (data) => {
      const cars =
        data.data.length > 0
          ? data.data.map((item) => ({
              Placa: item,
            }))
          : [
              {
                Placa: '',
              },
            ]
      exportToCSV('data.csv', cars)
    },
  })

  async function onSubmit(props: SearchByRadarForm) {
    // Start Time
    const startTime = new Date(props.startTime)
    startTime.setTime(startTime.getTime() + props.duration[0] * 60 * 1000)

    // End Time
    const endTime = new Date(props.startTime)
    endTime.setTime(endTime.getTime() + props.duration[1] * 60 * 1000)

    await getCarsByRadarMutation({
      radar: selectedRadar?.cameraNumero || '',
      startTime: dateToString(startTime),
      endTime: dateToString(endTime),
      plateHint: props.plateHint,
    })
  }

  return (
    <FormProvider {...form}>
      <form className="h-full w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex h-[3.25rem] items-center justify-between py-2">
          <CardTitle className="flex items-center gap-2">
            Consultar Radar
            <SatelliteDish className="h-8 w-8" />
          </CardTitle>
          {selectedRadar && (
            <Tooltip asChild text="Baixar relatório">
              <Button
                type="submit"
                className="flex h-9 w-9 gap-2 p-2"
                onClick={handleSubmit(onSubmit)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </Tooltip>
          )}
        </div>
        <RadarList />
        <SearchByRadarFilterForm />
      </form>
    </FormProvider>
  )
}
