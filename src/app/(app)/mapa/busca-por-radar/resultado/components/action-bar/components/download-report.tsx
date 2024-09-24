'use client'
// import { pdf } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { useState } from 'react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'
import { exportToCSV } from '@/utils/csv'

// import {
//   RadarReportDocument,
//   type RadarReportDocumentProps,
// } from '../../report/document'

enum FileType {
  'PDF' = 'PDF',
  'CSV' = 'CSV',
}

enum ApplyFilters {
  'Sim' = 'Sim',
  'Não' = 'Não',
}

interface DownloadReportProps {
  data: DetectionDTO[]
}

export function DownloadReport({ data }: DownloadReportProps) {
  const [fileType, setFileType] = useState<FileType>(FileType.PDF)
  const [applyFilters, setApplyFilters] = useState<ApplyFilters>(
    ApplyFilters.Não,
  )

  function handleDownload() {
    if (fileType === 'CSV') {
      // Download CSV
      exportToCSV('busca_por_radar', data)
    } else {
      // Download PDF
      // const blob = await pdf(
      //   <RadarReportDocument data={data} parameters={parameters} />,
      // ).toBlob()
      // const url = URL.createObjectURL(blob)
      // const a = document.createElement('a')
      // a.href = url
      // a.download = 'busca_por_radar.pdf'
      // a.click()
      // URL.revokeObjectURL(url)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <Tooltip asChild text="Baixar Relatório">
            <Button variant="secondary" size="icon">
              <Download className="size-4 shrink-0" />
            </Button>
          </Tooltip>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Relatório de Busca por Radar</DialogTitle>
          <DialogDescription>
            Baixe um relatório PDF ou CSV contendo o resultado da busca
            realizada. Você pode escolher por aplicar ou não os filtros
            dinâmicos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Label>Formato do arquivo:</Label>
            <RadioGroup
              defaultValue={fileType}
              className="flex"
              value={fileType}
              onValueChange={(e) => setFileType(e as FileType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={FileType.PDF} id={FileType.PDF} />
                <Label htmlFor={FileType.PDF} className="cursor-pointer">
                  PDF
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={FileType.CSV} id={FileType.CSV} />
                <Label htmlFor={FileType.CSV} className="cursor-pointer">
                  CSV
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex gap-2">
            <Label>Aplicar filtros dinâmicos: </Label>
            <RadioGroup
              defaultValue={applyFilters}
              className="flex"
              value={applyFilters}
              onValueChange={(e) => setApplyFilters(e as ApplyFilters)}
            >
              <Tooltip text="Em breve">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={ApplyFilters.Sim}
                    id={ApplyFilters.Sim}
                    disabled
                  />
                  <Label
                    htmlFor={ApplyFilters.Sim}
                    className="cursor-pointer text-muted-foreground"
                  >
                    Sim
                  </Label>
                </div>
              </Tooltip>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={ApplyFilters.Não}
                  id={ApplyFilters.Não}
                />
                <Label className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleDownload}>Obter Relatório</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
