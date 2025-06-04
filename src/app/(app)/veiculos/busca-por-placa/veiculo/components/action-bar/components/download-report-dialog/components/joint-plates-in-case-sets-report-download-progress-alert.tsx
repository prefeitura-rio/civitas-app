// joint-plates-in-case-sets-report-download-progress-alert.tsx
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import type { WideSearchFormData } from '@/app/(app)/veiculos/placas-correlatas-em-ccs/components/correlated-plates-in-case-sets-form'
import { Spinner } from '@/components/custom/spinner'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { generatePDFReport } from '@/http/cars/correlated-plates-in-case-sets/generate-pdf-report'
import { downloadFile } from '@/utils/download-file'

// Define the ReportResponse type locally
interface ReportFile {
  blob: Blob
  filename: string
}
interface ReportResponse {
  pdf?: ReportFile
  html?: ReportFile
}

enum FileType {
  'PDF' = 'PDF',
}

interface DownloadReportsButtonProps {
  open: boolean
  setOpen: (open: boolean) => void
  nMinutes: number
  minDifferentTargets: number
  keepBuses: boolean | undefined
  beforeAfter: 'before' | 'after' | 'both' | undefined
  fileType: FileType
  formData: WideSearchFormData
}

export default function JointPlatesInCaseSetsReportDownloadProgressAlert({
  open,
  setOpen,
  nMinutes,
  minDifferentTargets,
  keepBuses,
  beforeAfter,
  fileType,
  formData,
}: DownloadReportsButtonProps) {
  const { data, isPending, isError } = useQuery<ReportResponse>({
    queryKey: [
      'generate-pdf-report',
      nMinutes,
      minDifferentTargets,
      keepBuses,
      beforeAfter,
      formData,
    ],
    queryFn: async () => {
      const requestedPlatesData = formData.plate
        .map((plate, index) => {
          const fromDate = new Date(formData.date[index].from)
          const toDate = new Date(formData.date[index].to)

          const formatToUTCMinus3 = (date: Date) => {
            date.setHours(date.getHours() - 3)
            return date.toISOString().replace('.000Z', '')
          }

          return {
            plate,
            start: formatToUTCMinus3(fromDate),
            end: formatToUTCMinus3(toDate),
          }
        })
        .filter((item) => item.plate)

      return generatePDFReport({
        requestedPlatesData,
        nMinutes,
        minDifferentTargets,
        keepBuses,
        beforeAfter,
      })
    },
    enabled: open && fileType === FileType.PDF,
  })

  useEffect(() => {
    if (data && !isPending && open && !isError) {
      if (data.pdf) downloadFile(data.pdf.blob, data.pdf.filename)
      if (data.html) downloadFile(data.html.blob, data.html.filename)
      setOpen(false)
    }
  }, [data, isPending, open, isError, setOpen])

  if (!open) return null

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <div className="flex flex-col items-center justify-center">
          {isError ? (
            <>
              <p className="text-center text-red-500">
                Erro ao gerar relatório. Por favor, tente novamente.
              </p>
              <div className="mt-4 flex w-full justify-end">
                <Button
                  onClick={() => setOpen(false)}
                  type="submit"
                  className="flex items-center gap-2"
                >
                  Fechar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Spinner className="size-8" />
              <p className="text-center">
                {isPending ? 'Gerando relatório...' : 'Finalizando...'}
              </p>
            </>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
