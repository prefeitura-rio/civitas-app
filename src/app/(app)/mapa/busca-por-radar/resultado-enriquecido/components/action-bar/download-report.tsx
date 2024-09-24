'use client'
// import { pdf } from '@react-pdf/renderer'
import { pdf } from '@react-pdf/renderer'
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
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import type { EnhancedDetectionDTO } from '@/hooks/use-queries/use-enhanced-radars-search'
import { useRadars } from '@/hooks/use-queries/use-radars'
import type { UseSearchByRadarEnhancedResultDynamicFilter } from '@/hooks/use-search-by-radar-enhanced-result-dynamic-filter'
import { exportToCSV } from '@/utils/csv'

import {
  type GroupedEnhancedDetection,
  RadarReportDocument,
} from '../report/document'

enum FileType {
  'PDF' = 'PDF',
  'CSV' = 'CSV',
}

enum ApplyFilters {
  'Sim' = 'Sim',
  'Não' = 'Não',
}

interface DownloadReportProps {
  data: EnhancedDetectionDTO[]
  isLoading: boolean
  filters: UseSearchByRadarEnhancedResultDynamicFilter
}

export function DownloadReport({
  data,
  isLoading,
  filters,
}: DownloadReportProps) {
  const { formattedSearchParams } = useCarRadarSearchParams()
  const [fileType, setFileType] = useState<FileType>(FileType.PDF)
  const [applyFilters, setApplyFilters] = useState<ApplyFilters>(
    ApplyFilters.Sim,
  )

  const { data: radars } = useRadars()

  function groupData(data: EnhancedDetectionDTO[]) {
    if (!radars) throw new Error('radars is required')

    const groupedData = data.reduce(
      (acc, item) => {
        // Remove "faixa" da localização
        const location = item.location?.replace(/- FX \d+/, '') || 'N/A'

        // Se não existir a localização, cria um novo objeto
        if (!acc[location]) {
          acc[location] = {
            location,
            radars: [],
            detections: [],
          }
        }
        // Adiciona o radar ao objeto
        const radar = radars.find(
          (radar) =>
            radar.cameraNumber === item.cameraNumber ||
            radar.cetRioCode === item.cameraNumber,
        )

        if (!radar) throw new Error('radar not found')
        acc[location].radars.push(radar)

        // Adiciona as detecções ao objeto
        acc[location].detections.push(item)
        return acc
      },
      {} as {
        [key: string]: GroupedEnhancedDetection
      },
    )

    Object.values(groupedData).forEach((group) => {
      group.detections.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
    })

    Object.values(groupedData).forEach((group) => {
      group.detections.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
    })

    return Object.values(groupedData) as GroupedEnhancedDetection[]
  }

  async function handleDownload() {
    if (!filters.filteredData) throw new Error('filteredData is required')
    if (!formattedSearchParams)
      throw new Error('formattedSearchParams is required')

    const selectedData =
      applyFilters === ApplyFilters.Sim ? filters.filteredData : data

    if (fileType === 'CSV') {
      // Download CSV
      exportToCSV('busca_por_radar', selectedData)
    } else {
      // Download PDF
      const groupedData = groupData(selectedData)

      const from = new Date(formattedSearchParams.date).addMinutes(
        formattedSearchParams.duration[0] * -1,
      )
      const to = new Date(formattedSearchParams.date).addMinutes(
        formattedSearchParams.duration[1],
      )

      // Get unique radarIds
      const allRadarIds = filters.filteredData?.map((item) => item.cameraNumber)
      const radarIds = [...new Set(allRadarIds)]

      const blob = await pdf(
        <RadarReportDocument
          data={groupedData}
          parameters={{
            from,
            to,
            radarIds,
            plate: filters.selectedPlate || formattedSearchParams.plate,
            brandModels: filters.selectedBrandModel,
            colors: filters.selectedColors,
          }}
        />,
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'busca_enriquecida_por_radar.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Dialog>
      <Tooltip asChild text="Baixar Relatório">
        <span tabIndex={0}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="icon" disabled={isLoading}>
              <Download className="size-4 shrink-0" />
            </Button>
          </DialogTrigger>
        </span>
      </Tooltip>
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
                  />
                  <Label htmlFor={ApplyFilters.Sim} className="cursor-pointer">
                    Sim
                  </Label>
                </div>
              </Tooltip>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={ApplyFilters.Não}
                  id={ApplyFilters.Não}
                />
                <Label htmlFor={ApplyFilters.Não} className="cursor-pointer">
                  Não
                </Label>
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
