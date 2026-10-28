import { PDFViewer } from '@react-pdf/renderer'
import { Printer } from 'lucide-react'
import React from 'react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useMap } from '@/hooks/useContexts/use-map-context'
import { useCarPathsSearchParams } from '@/hooks/useParams/useCarPathsSearchParams'
import { useReportVehicle } from '@/hooks/useQueries/useReportVehicle'

import { ReportDocument } from '../../report/components/report-document'

export default function DownloadReportButton() {
  const {
    layers: {
      trips: { trips, isLoading },
    },
  } = useMap()
  const { formattedSearchParams } = useCarPathsSearchParams()
  if (!formattedSearchParams)
    throw new Error('formattedSearchParams is required')
  const { vehicle, isPending: isPendingVehicle } = useReportVehicle(
    formattedSearchParams.plate,
  )

  return (
    <Dialog>
      <Tooltip
        asChild
        text="Relatório de viagens"
        disabled={isLoading || isPendingVehicle}
      >
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            disabled={isLoading || isPendingVehicle}
          >
            <Printer className="size-4 shrink-0" />
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogContent className="h-[80%] max-w-7xl">
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <ReportDocument
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
    </Dialog>
  )
}
