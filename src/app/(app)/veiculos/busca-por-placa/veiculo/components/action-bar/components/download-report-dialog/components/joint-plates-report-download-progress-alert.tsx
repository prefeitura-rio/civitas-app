import { useQuery } from '@tanstack/react-query'
import { formatDate } from 'date-fns'
import React, { useEffect, useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { useCarPathsSearchParams } from '@/hooks/useParams/useCarPathsSearchParams'
import { useNCarsBeforeAfter } from '@/hooks/useQueries/cars/useNBeforeAfter'
import { generatePDFReport } from '@/http/cars/n-before-after/get-n-cars-before-after'
import { exportToCSV } from '@/utils/csv'
import { downloadFile } from '@/utils/download-file'

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
      return generatePDFReport({
        reportData: data!.groups,
        params: {
          plate: formattedSearchParams.plate,
          startTime: formattedSearchParams.from,
          endTime: formattedSearchParams.to,
          nMinutes,
          nPlates,
        },
        ranking: data!.ranking,
      })
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
      const monitoredPlateDetectionTime = formatDate(
        new Date(new Date(formattedSearchParams.from).getTime() + diff / 2),
        'dd/MM/yyyy HH:mm:ss',
      )

      const metadataLines = [
        `Gerado em: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
        `Placa pesquisada: ${formattedSearchParams.plate}`,
        `Período da busca: De ${formatDate(
          new Date(formattedSearchParams.from),
          'dd/MM/yyyy HH:mm:ss',
        )} até ${formatDate(
          new Date(formattedSearchParams.to),
          'dd/MM/yyyy HH:mm:ss',
        )}`,
        `Intervalo de interesse ao redor das detecções: ${nMinutes} min`,
        `Número máximo de placas ao redor das detecções: ${nPlates}`,
      ]

      type JointPlates = (typeof data.groups)[number]
      type JointPlatesDetection = JointPlates['detections'][number]
      type JointPlatesCsvColumnContext = {
        group: JointPlates
        groupIndex: number
        detection: JointPlatesDetection
        detectionIndex: number
      }

      const jointPlatesCsvColumns = [
        {
          header: 'Índice Grupo',
          getValue: ({ groupIndex }: JointPlatesCsvColumnContext) =>
            groupIndex + 1,
        },
        {
          header: 'Índice Detecção',
          getValue: ({ detectionIndex }: JointPlatesCsvColumnContext) =>
            detectionIndex + 1,
        },
        {
          header: 'Data Hora Detecção Placa Monitorada',
          getValue: () => monitoredPlateDetectionTime,
        },
        {
          header: 'Início Período Analisado',
          getValue: ({ group }: JointPlatesCsvColumnContext) =>
            formatDate(group.start_time, 'dd/MM/yyyy HH:mm:ss'),
        },
        {
          header: 'Fim Período Analisado',
          getValue: ({ group }: JointPlatesCsvColumnContext) =>
            formatDate(group.end_time, 'dd/MM/yyyy HH:mm:ss'),
        },
        {
          header: 'Radares',
          getValue: ({ group }: JointPlatesCsvColumnContext) =>
            group.radars.join(', '),
        },
        {
          header: 'Latitude',
          getValue: ({ group }: JointPlatesCsvColumnContext) =>
            group.latitude.toString().replace('.', ','),
        },
        {
          header: 'Longitude',
          getValue: ({ group }: JointPlatesCsvColumnContext) =>
            group.longitude.toString().replace('.', ','),
        },
        {
          header: 'Endereço',
          getValue: ({ group }: JointPlatesCsvColumnContext) => group.location,
        },
        {
          header: 'Total Detecções Grupo',
          getValue: ({ group }: JointPlatesCsvColumnContext) =>
            group.total_detections,
        },
        {
          header: 'Data e Hora Detecção',
          getValue: ({ detection }: JointPlatesCsvColumnContext) =>
            detection.timestamp,
        },
        {
          header: 'Placa',
          getValue: ({ detection }: JointPlatesCsvColumnContext) =>
            detection.plate,
        },
        {
          header: 'Radar',
          getValue: ({ detection }: JointPlatesCsvColumnContext) =>
            detection.codcet,
        },
        {
          header: 'Faixa',
          getValue: ({ detection }: JointPlatesCsvColumnContext) =>
            detection.lane,
        },
        {
          header: 'Velocidade (km/h)',
          getValue: ({ detection }: JointPlatesCsvColumnContext) =>
            detection.speed,
        },
        {
          header: 'Nº Ocorrências',
          getValue: ({ detection }: JointPlatesCsvColumnContext) =>
            detection.count,
        },
      ] as const
      const jointPlatesCsvHeaders = jointPlatesCsvColumns.map(
        (column) => column.header,
      )
      const jointPlatesCsvDataRows = data.groups.flatMap((group, groupIndex) =>
        group.detections.map((detection, detectionIndex) =>
          jointPlatesCsvColumns.map((column) =>
            column.getValue({
              group,
              groupIndex,
              detection,
              detectionIndex,
            }),
          ),
        ),
      )

      exportToCSV(`placas_conjuntas_${formattedSearchParams.plate}`, {
        topRows: [
          [
            [
              'Nome do relatório: Relatório de Placas Conjuntas',
              ...metadataLines,
            ].join('\n'),
          ],
          [],
        ],
        headers: jointPlatesCsvHeaders,
        dataRows: jointPlatesCsvDataRows,
      })

      const jointPlatesRankingCsvHeaders = ['Placa', 'Contagem']
      const jointPlatesRankingCsvDataRows = data.ranking.map((r) => [
        r.plate,
        r.count,
      ])

      exportToCSV(`placas_conjuntas_${formattedSearchParams.plate}_ranking`, {
        topRows: [
          [
            [
              'Nome do relatório: Relatório de Placas Conjuntas (Ranking)',
              ...metadataLines,
            ].join('\n'),
          ],
          [],
        ],
        headers: jointPlatesRankingCsvHeaders,
        dataRows: jointPlatesRankingCsvDataRows,
      })

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
