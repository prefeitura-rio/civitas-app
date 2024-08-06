import { zodResolver } from '@hookform/resolvers/zod'
import { PDFViewer } from '@react-pdf/renderer'
import { useMutation } from '@tanstack/react-query'
import { Cctv, Printer } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip } from '@/components/ui/tooltip'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { getCarsByRadar } from '@/http/cars/radar/get-cars-by-radar'
import { dateToString } from '@/utils/date-to-string'
import { genericErrorMessage } from '@/utils/error-handlers'

import { RadarList } from './components/radar-list'
import { SearchByRadarFilterForm } from './components/search-by-radar-filter-form'
import {
  RadarReportDocument,
  type RadarReportDocumentProps,
} from './components/search-by-radar-filter-form/components/radar-report-document'
import {
  type SearchByRadarForm,
  searchByRadarFormSchema,
} from './components/search-by-radar-filter-form/components/search-by-radar-form-schema'

export function SearchByRadar() {
  const [openPrintModal, setOpenPrintModal] = useState(false)
  const [documentProps, setDocumentProps] = useState<RadarReportDocumentProps>(
    {} as RadarReportDocumentProps,
  )
  const {
    layers: {
      radars: {
        layerStates: { selectedRadar, isLoading },
      },
    },
  } = useMap()
  const form = useForm<SearchByRadarForm>({
    resolver: zodResolver(searchByRadarFormSchema),
    defaultValues: {
      duration: [-5, 5],
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const { mutateAsync: getCarsByRadarMutation } = useMutation({
    mutationFn: getCarsByRadar,
    onSuccess: (data, variables) => {
      if (!selectedRadar) throw new Error('Nenhum radar selecionado')

      setDocumentProps({
        radar: selectedRadar,
        fromDate: new Date(variables.startTime),
        toDate: new Date(variables.endTime),
        detections: data.data,
      })
      setOpenPrintModal(true)
    },
    onError: () => {
      toast.error(genericErrorMessage)
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
      radar: selectedRadar?.cameraNumber || '',
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
            Consultar radar
            <Cctv className="h-8 w-8" />
          </CardTitle>
          {selectedRadar && (
            <Dialog open={openPrintModal} onOpenChange={setOpenPrintModal}>
              <Tooltip asChild text="Baixar relatório" disabled={isLoading}>
                <DialogTrigger asChild>
                  <Button
                    type="submit"
                    className="flex h-9 w-9 gap-2 p-2"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting || isLoading}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </Tooltip>
              <DialogContent className="h-[80%] max-w-7xl">
                <DialogTitle className="sr-only">
                  Imprimir relatório
                </DialogTitle>
                <PDFViewer style={{ width: '100%', height: '100%' }}>
                  <RadarReportDocument {...documentProps} />
                </PDFViewer>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <RadarList />
        <SearchByRadarFilterForm />
      </form>
    </FormProvider>
  )
}
