'use client'
import { pdf } from '@react-pdf/renderer'
import { Download } from 'lucide-react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  RadarReportDocument,
  type RadarReportDocumentProps,
} from './report/document'

export function DownloadReport({ data, parameters }: RadarReportDocumentProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="size-9 p-0">
          <Download className="size-4 p-0" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecione o formato do relatório</DialogTitle>
        </DialogHeader>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={async () => {
              const blob = await pdf(
                <RadarReportDocument data={data} parameters={parameters} />,
              ).toBlob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'busca_por_radar.pdf'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            PDF
          </Button>
          <Tooltip asChild disabled disabledText="Em breve">
            <div>
              <Button disabled variant="outline">
                CSV
              </Button>
            </div>
          </Tooltip>
        </div>
      </DialogContent>
    </Dialog>
  )
}
