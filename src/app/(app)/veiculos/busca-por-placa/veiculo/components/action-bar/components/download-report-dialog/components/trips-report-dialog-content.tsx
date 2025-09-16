import { PDFViewer } from '@react-pdf/renderer'

import { DialogContent } from '@/components/ui/dialog'
import { useCarPathsSearchParams } from '@/hooks/useParams/useCarPathsSearchParams'
import { useVehicle } from '@/hooks/useQueries/useVehicle'
import { useMapLayers } from '@/stores/use-map-store'

import { ReportDocument } from '../../../../report/components/report-document'

export function TripsReportDialogContent() {
  const { trips } = useMapLayers()
  const { formattedSearchParams } = useCarPathsSearchParams()
  if (!formattedSearchParams)
    throw new Error('formattedSearchParams is required')

  const { data: vehicle } = useVehicle(formattedSearchParams?.plate || '')

  return (
    <DialogContent className="h-[80%] max-w-7xl">
      <PDFViewer style={{ width: '100%', height: '100%' }}>
        <ReportDocument
          trips={trips.trips || []}
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
