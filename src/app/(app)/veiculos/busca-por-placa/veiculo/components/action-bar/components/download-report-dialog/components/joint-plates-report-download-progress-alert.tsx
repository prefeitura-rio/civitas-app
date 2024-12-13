import { pdf } from '@react-pdf/renderer'
import { useQuery } from '@tanstack/react-query'
import { formatDate } from 'date-fns'
import React, { useEffect, useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { useNCarsBeforeAfter } from '@/hooks/use-queries/cars/use-n-before-after'
import { exportToCSV } from '@/utils/csv'
import { downloadFile } from '@/utils/download-file'

import { ReportDocument } from '../../reports-by-detection-point/components/report/document'

enum FileType {
  'PDF' = 'PDF',
  'CSV' = 'CSV',
}

interface DownloadReportsByDetectionPointButtonProps {
  open: boolean
  setOpen: (open: boolean) => void
  nMinutes: number
  nPlates: number
  fileType: FileType
}

export default function JointPlatesReportDownloadProgressAlert({
  open,
  setOpen,
  nMinutes,
  nPlates,
  fileType,
}: DownloadReportsByDetectionPointButtonProps) {
  const { formattedSearchParams } = useCarPathsSearchParams()
  const [initialized, setInitialized] = useState(false)
  const [initialized2, setInitialized2] = useState(false)
  if (!formattedSearchParams)
    throw new Error('formattedSearchParams is required')

  const { data, isPending } = useNCarsBeforeAfter({
    plate: formattedSearchParams.plate,
    startTime: formattedSearchParams.from,
    endTime: formattedSearchParams.to,
    nMinutes,
    nPlates,
    enabled: initialized,
  })

  const { data: doc, isPending: isGeneratingDocument } = useQuery({
    queryKey: [
      'cars-before-after',
      formattedSearchParams.plate,
      formattedSearchParams.from,
      formattedSearchParams.to,
      nMinutes,
      nPlates,
    ],
    queryFn: async () => {
      const doc = pdf(
        <ReportDocument
          params={{
            plate: formattedSearchParams!.plate,
            startTime: formattedSearchParams!.from,
            endTime: formattedSearchParams!.to,
            nMinutes,
            nPlates,
          }}
          data={data!.groups}
          ranking={data!.ranking}
        />,
      )
      return doc.toBlob()
    },
    enabled: initialized2 && fileType === FileType.PDF,
  })

  useEffect(() => {
    if (open) {
      setInitialized(true)
    }
    if (open && data && !isPending) {
      setInitialized2(true)
    }
    if (
      open &&
      data &&
      !isPending &&
      fileType === FileType.PDF &&
      doc &&
      !isGeneratingDocument
    ) {
      downloadFile(doc, `placas_conjuntas_${formattedSearchParams.plate}.pdf`)
      setOpen(false)
    }
    if (open && data && !isPending && fileType === FileType.CSV) {
      const diff =
        new Date(formattedSearchParams.to).getTime() -
        new Date(formattedSearchParams.from).getTime()

      exportToCSV(
        `placas_conjuntas_${formattedSearchParams.plate}`,
        data.groups.flatMap((g, i) =>
          g.detections.map((d, j) => ({
            'Índice Grupo': i + 1,
            'Índice Detecção': j + 1,
            'Data Hora Detecção Placa Monitorada': formatDate(
              new Date(
                new Date(formattedSearchParams.from).getTime() + diff / 2,
              ),
              'dd/MM/yyyy HH:mm:ss',
            ),
            'Início Período Analisado': formatDate(
              g.start_time,
              'dd/MM/yyyy HH:mm:ss',
            ),
            'Fim Período Analisado': formatDate(
              g.end_time,
              'dd/MM/yyyy HH:mm:ss',
            ),
            Radares: g.radars.join(', '),
            Latitude: g.latitude.toString().replace('.', ','),
            Longitude: g.longitude.toString().replace('.', ','),
            Endereço: g.location,
            'Total Detecções Grupo': g.total_detections,
            'Data e Hora Detecção': d.timestamp,
            Placa: d.plate,
            Radar: d.camera_numero,
            Faixa: d.lane,
            'Velocidade (km/h)': d.speed,
            'Nº Ocorrências': d.count,
          })),
        ),
      )
      exportToCSV(
        `placas_conjuntas_${formattedSearchParams.plate}_ranking`,
        data.ranking.map((r) => ({
          Placa: r.plate,
          Contagem: r.count,
        })),
      )

      setOpen(false)
    }
  }, [isPending, data, open, isGeneratingDocument, doc])

  return (
    <div>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <div className="flex flex-col items-center justify-center">
            <Spinner className="size-8" />
            <p className="text-center">
              {isPending ? 'Extraindo dados...' : 'Preparando documento...'}
            </p>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
