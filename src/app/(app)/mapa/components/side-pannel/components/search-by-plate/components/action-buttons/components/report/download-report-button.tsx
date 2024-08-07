import { PDFViewer } from '@react-pdf/renderer'
import { Printer } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip } from '@/components/ui/tooltip'
import { useMap } from '@/hooks/use-contexts/use-map-context'

import { ReportDocument } from './components/report-document'

export default function DownloadReportButton() {
  const {
    layers: {
      trips: { trips, isLoading, lastSearchParams },
    },
  } = useMap()
  if (!lastSearchParams) return null

  return (
    <Dialog>
      <Tooltip asChild text="Imprimir relatório" disabled={isLoading}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={isLoading} size="sm">
            <Printer className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogContent className="h-[80%] max-w-7xl">
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <ReportDocument trips={trips || []} searchParams={lastSearchParams} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  )
}
