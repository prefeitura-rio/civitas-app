import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Spinner } from '@/components/custom/spinner'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { useCarPathsSearchParams } from '@/hooks/useParams/useCarPathsSearchParams'
import { generateCloningReport } from '@/http/cars/cloning-report/generate-cloning-report'
import { downloadFile } from '@/utils/download-file'

interface CloningReportDownloadProgressAlertProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CloningReportDownloadProgressAlert({
  open,
  setOpen,
}: CloningReportDownloadProgressAlertProps) {
  const { formattedSearchParams } = useCarPathsSearchParams()
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasTriggeredRequest, setHasTriggeredRequest] = useState(false)

  useEffect(() => {
    if (!open) {
      setHasTriggeredRequest(false)
      setIsGenerating(false)
      return
    }

    if (!formattedSearchParams) {
      toast.error('Parâmetros inválidos para gerar relatório de clonagem.')
      setOpen(false)
      return
    }

    if (hasTriggeredRequest) return

    const generate = async () => {
      try {
        setIsGenerating(true)
        const blob = await generateCloningReport({
          plate: formattedSearchParams.plate,
          dateStart: formattedSearchParams.from,
          dateEnd: formattedSearchParams.to,
        })

        const formattedStart = format(
          new Date(formattedSearchParams.from),
          'yyyyMMdd',
        )
        const formattedEnd = format(
          new Date(formattedSearchParams.to),
          'yyyyMMdd',
        )

        downloadFile(
          blob,
          `relatorio_clonagem_${formattedSearchParams.plate}_${formattedStart}_${formattedEnd}.zip`,
        )
        setOpen(false)
      } catch (error) {
        console.error('Failed to generate cloning report', error)
        toast.error('Não foi possível gerar o relatório de clonagem.')
        setOpen(false)
      } finally {
        setIsGenerating(false)
      }
    }

    setHasTriggeredRequest(true)
    generate()
  }, [open, formattedSearchParams, setOpen, hasTriggeredRequest])

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <div className="flex flex-col items-center justify-center gap-2">
          <Spinner className="size-8" />
          <p className="text-center">
            {isGenerating
              ? 'Gerando relatório de clonagem...'
              : 'Preparando download do relatório...'}
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
