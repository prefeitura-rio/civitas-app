import { PDFViewer } from '@react-pdf/renderer'

import { Spinner } from '@/components/custom/spinner'
import { DialogContent } from '@/components/ui/dialog'
import { useMap } from '@/hooks/useContexts/use-map-context'
import { useCarPathsSearchParams } from '@/hooks/useParams/useCarPathsSearchParams'
import { useCirculationIndicators } from '@/hooks/useQueries/useCirculationIndicators'
import { useVehicle } from '@/hooks/useQueries/useVehicle'

import { ReportDocument } from '../../../../report/components/report-document'

export function TripsReportDialogContent() {
  const {
    layers: {
      trips: { trips },
    },
  } = useMap()
  const { formattedSearchParams } = useCarPathsSearchParams()
  if (!formattedSearchParams)
    throw new Error('formattedSearchParams is required')

  const { data: vehicle, isPending: isPendingVehicle } = useVehicle(
    formattedSearchParams.plate,
  )
  const {
    data: circulationIndicators,
    isPending: isPendingCirculationIndicators,
  } = useCirculationIndicators({
    plate: formattedSearchParams.plate,
    startTime: formattedSearchParams.from,
    endTime: formattedSearchParams.to,
  })

  if (isPendingVehicle || isPendingCirculationIndicators) {
    return (
      <DialogContent className="h-[80%] max-w-7xl">
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Spinner className="size-8" />
          <p className="text-center text-sm text-muted-foreground">
            Preparando relatório...
          </p>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="h-[80%] max-w-7xl">
      <PDFViewer style={{ width: '100%', height: '100%' }}>
        <ReportDocument
          circulationIndicators={circulationIndicators}
          trips={trips || []}
          searchParams={{
            plate: formattedSearchParams.plate,
            endTime: formattedSearchParams.to,
            startTime: formattedSearchParams.from,
          }}
          vehicle={vehicle}
        />
      </PDFViewer>
    </DialogContent>
  )
}
