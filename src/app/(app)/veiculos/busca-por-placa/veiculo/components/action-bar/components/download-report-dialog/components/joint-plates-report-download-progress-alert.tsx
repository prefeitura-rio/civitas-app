import { pdf } from '@react-pdf/renderer'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { useNCarsBeforeAfter } from '@/hooks/use-queries/cars/use-n-before-after'
import { downloadFile } from '@/utils/download-file'

import { ReportDocument } from '../../reports-by-detection-point/components/report/document'

interface DownloadReportsByDetectionPointButtonProps {
  open: boolean
  setOpen: (open: boolean) => void
  nMinutes: number
  nPlates: number
}

export default function JointPlatesReportDownloadProgressAlert({
  open,
  setOpen,
  nMinutes,
  nPlates,
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
    enabled: initialized2,
  })

  useEffect(() => {
    if (open) {
      setInitialized(true)
    }
    if (open && data && !isPending) {
      setInitialized2(true)
    }
    if (open && data && !isPending && doc && !isGeneratingDocument) {
      downloadFile(doc, `placas_conjuntas_${formattedSearchParams.plate}.pdf`)
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
