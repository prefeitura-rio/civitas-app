'use client'
// import { pdf } from '@react-pdf/renderer'
import { pdf } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'
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
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { useCollectionPoints } from '@/hooks/useQueries/useCollectionPoints'
import type { EnhancedDetectionDTO } from '@/hooks/useQueries/useEnhancedRadarsSearch'
import type { UseSearchByRadarEnhancedResultDynamicFilter } from '@/hooks/useSearchByRadarEnhancedResultDynamicFilter'
import { exportToCSV, formatCsvDateTime } from '@/utils/csv'
import { toCsvSpreadsheetText } from '@/utils/csv-text'
import { downloadFile } from '@/utils/download-file'

import {
  type GroupedEnhancedDetection,
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

  const { data: radars } = useCollectionPoints()

  // function groupData(data: EnhancedDetectionDTO[]) {
  //   if (!radars) throw new Error('radars is required')

  //   const groupedData = data.reduce(
  //     (acc, item) => {
  //       // Remove "faixa" da localização
  //       const location = item.location?.replace(/- FX \d+/, '') || 'N/A'

  //       // Se não existir a localização, cria um novo objeto
  //       if (!acc[location]) {
  //         acc[location] = {
  //           location,
  //           radars: [],
  //           detections: [],
  //         }
  //       }
  //       // Adiciona o radar ao objeto
  //       const radar = radars.find(
  //         (radar) =>
  //           radar.cameraNumber === item.cameraNumber ||
  //           radar.cetRioCode === item.cameraNumber,
  //       )

  //       if (!radar) throw new Error('radar not found')
  //       acc[location].radars.push(radar)

  //       // Adiciona as detecções ao objeto
  //       acc[location].detections.push(item)
  //       return acc
  //     },
  //     {} as {
  //       [key: string]: GroupedEnhancedDetection
  //     },
  //   )

  //   Object.values(groupedData).forEach((group) => {
  //     group.detections.sort(
  //       (a, b) =>
  //         new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  //     )
  //   })

  //   Object.values(groupedData).forEach((group) => {
  //     group.detections.sort(
  //       (a, b) =>
  //         new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  //     )
  //   })

  //   return Object.values(groupedData) as GroupedEnhancedDetection[]
  // }

  function groupData(data: EnhancedDetectionDTO[]) {
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
            // brandModel:
            detections: [],
          }
        }
        // Adiciona o radar ao objeto
        acc[location].radars.push(radar)

        // Adiciona as detecções ao objeto
        const detections = data.filter(
          (detection) => detection.equipmentCode === radar.cetRioCode,
        )
        acc[location].detections.push(...detections)
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
      const csvData = selectedData || []
      const isUsingDynamicFilters = applyFilters === ApplyFilters.Sim
      const metadataLines = [
        'Nome do relatório: Relatório de Busca Enriquecida por Radar',
        `Gerado em: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
        `Período da busca: De ${formatDate(
          new Date(formattedSearchParams.date.from),
          'dd/MM/yyyy HH:mm:ss',
        )} até ${formatDate(
          new Date(formattedSearchParams.date.to),
          'dd/MM/yyyy HH:mm:ss',
        )}`,
        `Radares pesquisados: ${formattedSearchParams.radarIds.join(', ')}`,
      ]

      if (formattedSearchParams.plate) {
        metadataLines.push(`Placa pesquisada: ${formattedSearchParams.plate}`)
      }

      if (isUsingDynamicFilters) {
        if (filters.selectedPlate) {
          metadataLines.push(`Placa filtrada: ${filters.selectedPlate}`)
        }
        if (filters.selectedLocations.length > 0) {
          metadataLines.push(
            `Localizações filtradas: ${filters.selectedLocations.join(', ')}`,
          )
        }
        if (filters.selectedRadars.length > 0) {
          metadataLines.push(
            `Radares selecionados para exportação: ${filters.selectedRadars.join(', ')}`,
          )
        }
        if (filters.selectedColors.length > 0) {
          metadataLines.push(
            `Cores filtradas: ${filters.selectedColors.join(', ')}`,
          )
        }
        if (filters.selectedBrandModel.length > 0) {
          metadataLines.push(
            `Marcas/Modelos filtrados: ${filters.selectedBrandModel.join(', ')}`,
          )
        }
      }

      type EnrichedRadarCsvRow = (typeof csvData)[number]
      type EnrichedRadarCsvColumnContext = {
        row: EnrichedRadarCsvRow
      }

      const enrichedRadarCsvColumns = [
        {
          header: 'Placa',
          getValue: ({ row }: EnrichedRadarCsvColumnContext) => row.plate,
        },
        {
          header: 'Data e Hora',
          getValue: ({ row }: EnrichedRadarCsvColumnContext) =>
            formatCsvDateTime(row.timestamp),
        },
        {
          header: 'Velocidade',
          getValue: ({ row }: EnrichedRadarCsvColumnContext) => row.speed,
        },
        {
          header: 'Marca/Modelo',
          getValue: ({ row }: EnrichedRadarCsvColumnContext) => row.brandModel,
        },
        {
          header: 'Cor',
          getValue: ({ row }: EnrichedRadarCsvColumnContext) => row.color,
        },
        {
          header: 'Ano do Modelo',
          getValue: ({ row }: EnrichedRadarCsvColumnContext) => row.modelYear,
        },
        {
          header: 'Radar',
          getValue: ({ row }: EnrichedRadarCsvColumnContext) =>
            toCsvSpreadsheetText(row.equipmentCode),
        },
        {
          header: 'Endereço',
          getValue: ({ row }: EnrichedRadarCsvColumnContext) => row.location,
        },
      ] as const
      const enrichedRadarCsvHeaders = enrichedRadarCsvColumns.map(
        (column) => column.header,
      )
      const enrichedRadarCsvDataRows = csvData.map((row) =>
        enrichedRadarCsvColumns.map((column) => column.getValue({ row })),
      )

      exportToCSV('busca_por_radar', {
        topRows: [[metadataLines.join('\n')], []],
        headers: enrichedRadarCsvHeaders,
        dataRows: enrichedRadarCsvDataRows,
      })
    } else {
      // Download PDF
      const groupedData = groupData(selectedData)

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
            brandModels: filters.selectedBrandModel,
            colors: filters.selectedColors,
          }}
        />,
      ).toBlob()
      downloadFile(blob, 'busca_enriquecida_por_radar.pdf')
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
          <DialogTitle>Relatório de Busca por Equipamento</DialogTitle>
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
