'use client'

// import { pdf } from '@react-pdf/renderer'
import { pdf } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

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
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { useRadars } from '@/hooks/useQueries/useRadars'
import type { DetectionDTO } from '@/hooks/useQueries/useRadarsSearch'
import type { UseSearchByRadarResultDynamicFilter } from '@/hooks/useSearchByRadarResultDynamicFilter'
import { exportToCSV } from '@/utils/csv'
import { downloadFile } from '@/utils/download-file'

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

  const groupData = useCallback(
    (data: DetectionDTO[]) => {
      if (!radars) throw new Error('radars is required')
      if (!formattedSearchParams)
        throw new Error('formattedSearchParams is required')

      const selectedRadars = radars.filter((radar) =>
        formattedSearchParams.radarIds.some(
          (radarId) => radarId === radar.cetRioCode,
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
            (detection) => detection.cetRioCode === radar.cetRioCode,
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

      return Object.values(groupedData) as GroupedDetection[]
    },
    [radars, formattedSearchParams],
  )

  const selectedData = useMemo(
    () => (applyFilters === ApplyFilters.Sim ? filters.filteredData : data),
    [applyFilters, filters.filteredData, data],
  )

  const handleDownload = useCallback(async () => {
    if (!filters.filteredData) throw new Error('filteredData is required')
    if (!formattedSearchParams)
      throw new Error('formattedSearchParams is required')

    if (fileType === 'CSV') {
      // Download CSV
      exportToCSV('busca_por_radar', selectedData || [])
    } else {
      // Download PDF
      const groupedData = groupData(selectedData || [])

      const from = new Date(formattedSearchParams.date.from)
      const to = new Date(formattedSearchParams.date.to)

      // Get unique radarIds
      const radarIds = groupedData
        .map((group) => {
          const radarIds = group.radars.map((radar) => radar.cetRioCode)
          return radarIds
        })
        .flat()

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

      downloadFile(blob, 'busca_por_radar.pdf')
    }
  }, [
    filters.filteredData,
    formattedSearchParams,
    fileType,
    selectedData,
    groupData,
    filters.selectedPlate,
  ])

  const handleFileTypeChange = useCallback(
    (value: string) => setFileType(value as FileType),
    [],
  )

  const handleApplyFiltersChange = useCallback(
    (value: string) => setApplyFilters(value as ApplyFilters),
    [],
  )

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
              onValueChange={handleFileTypeChange}
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
              onValueChange={handleApplyFiltersChange}
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
