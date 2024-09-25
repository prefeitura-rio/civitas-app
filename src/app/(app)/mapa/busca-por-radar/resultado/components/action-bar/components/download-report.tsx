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
import { useRadars } from '@/hooks/use-queries/use-radars'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'
import type { UseSearchByRadarResultDynamicFilter } from '@/hooks/use-search-by-radar-result-dynamic-filter'
import { exportToCSV } from '@/utils/csv'

import {
  type GroupedDetection,
  RadarReportDocument,
} from '../../report/document'

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
  isLoading: boolean
  filters: UseSearchByRadarResultDynamicFilter
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

  function groupData(data: DetectionDTO[]) {
    if (!radars) throw new Error('radars is required')
    if (!formattedSearchParams)
      throw new Error('formattedSearchParams is required')

    const selectedRadars = radars.filter((radar) =>
      formattedSearchParams.radarIds.some(
        (radarId) =>
          radarId === radar.cameraNumber || radarId === radar.cetRioCode,
      ),
    )

    const groupedData = selectedRadars.reduce(
      (acc, radar) => {
        // Remove "faixa" da localização
        const location = radar.location?.replace(/- FX \d+/, '') || 'N/A'

        // Se não existir a localização, cria um novo objeto
        if (!acc[location]) {
          acc[location] = {
            location,
            radars: [],
            detections: [],
          }
        }
        // Adiciona o radar ao objeto
        acc[location].radars.push(radar)

        // Adiciona as detecções ao objeto
        const detections = data.filter(
          (detection) =>
            detection.cameraNumber === radar.cameraNumber ||
            detection.cameraNumber === radar.cetRioCode,
        )
        acc[location].detections.push(...detections)
        return acc
      },
      {} as {
        [key: string]: GroupedDetection
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

    return Object.values(groupedData) as GroupedDetection[]
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
      console.log(groupedData)

      const from = new Date(formattedSearchParams.date).addMinutes(
        formattedSearchParams.duration[0] * -1,
      )
      const to = new Date(formattedSearchParams.date).addMinutes(
        formattedSearchParams.duration[1],
      )

      // Get unique radarIds
      const radarIds = groupedData
        .map((group) => {
          const radarIds = group.radars.map((radar) => radar.cameraNumber)
          return radarIds
        })
        .flat()
      console.log(radarIds)
      const blob = await pdf(
        <RadarReportDocument
          data={groupedData}
          parameters={{
            from,
            to,
            radarIds,
            plate: filters.selectedPlate || formattedSearchParams.plate,
          }}
        />,
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'busca_por_radar.pdf'
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
