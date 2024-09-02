import { PDFViewer } from '@react-pdf/renderer'
import { Printer } from 'lucide-react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

import { ReportDocument } from './report-document'

export function GenerateReportButton() {
  return (
    <Dialog>
      <Tooltip asChild text="Imprimir relatório">
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogContent className="h-[80%] max-w-7xl">
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <ReportDocument />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  )
}
