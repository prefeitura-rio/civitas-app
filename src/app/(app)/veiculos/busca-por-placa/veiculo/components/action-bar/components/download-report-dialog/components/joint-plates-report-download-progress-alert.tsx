import { pdf } from '@react-pdf/renderer'
import { useMutation } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { getNCarsBeforeAfter } from '@/http/cars/n-before-after/get-n-cars-before-after'
import type { DetectionGroup } from '@/models/entities'

import { ReportDocument } from '../../reports-by-detection-point/components/report/document'

interface DownloadReportsByDetectionPointButtonProps {
  open: boolean
  setOpen: (open: boolean) => void
  interval: number
}

export default function JointPlatesReportDownloadProgressAlert({
  open,
  setOpen,
  interval,
}: DownloadReportsByDetectionPointButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const downloadInitiatedRef = useRef(false)

  const { formattedSearchParams } = useCarPathsSearchParams()
  if (!formattedSearchParams)
    throw new Error('formattedSearchParams is required')

  const { mutateAsync: getNCarsBeforeAfterFn } = useMutation({
    mutationFn: () =>
      getNCarsBeforeAfter({
        plate: formattedSearchParams.plate,
        startTime: formattedSearchParams.from,
        endTime: formattedSearchParams.to,
        n: interval,
      }).then((data) => {
        const ranking = getRanking(data)

        return {
          groups: data,
          ranking,
        }
      }),
  })

  const getRanking = (data: DetectionGroup[]) => {
    // Remove detections with less than 2 instances
    const plateCount = data
      .map((group) => group.detections)
      .flat()
      .filter((detection) => (detection.count ?? 0) > 1)
      .map((detection) => ({
        plate: detection.plate,
        count: detection.count,
      }))

    // Get unique plates
    const uniquePlateIntances = plateCount.filter(
      (detection, index, self) =>
        index === self.findIndex((t) => t.plate === detection.plate),
    )

    // Sort by instances
    const ranking = uniquePlateIntances.sort((a, b) => b.count - a.count)

    return ranking
  }

  async function handleDownload() {
    if (!formattedSearchParams)
      throw new Error('formattedSearchParams is required')

    setIsLoading(true)
    const { groups, ranking } = await getNCarsBeforeAfterFn()

    setProgress(1)

    const blob = await pdf(
      <ReportDocument
        params={{
          plate: formattedSearchParams.plate,
          startTime: formattedSearchParams.from,
          endTime: formattedSearchParams.to,
        }}
        data={groups}
        ranking={ranking}
      />,
    ).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `placas_conjuntas_${formattedSearchParams.plate}.pdf`
    a.click()
    URL.revokeObjectURL(url)

    setIsLoading(false)
    setProgress(0)
    setOpen(false)
  }

  useEffect(() => {
    if (!downloadInitiatedRef.current) {
      downloadInitiatedRef.current = true
      console.log('debug')
      handleDownload()
    }
  }, [open])

  return (
    <div>
      <AlertDialog open={isLoading}>
        <AlertDialogContent>
          <div className="flex flex-col items-center justify-center">
            <Spinner className="size-8" />
            {progress < 1 ? (
              <p className="text-center">Gerando relatório...</p>
            ) : (
              <p className="text-center">Preparando documento...</p>
            )}
            <Progress value={progress * 100} className="w-full" />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
