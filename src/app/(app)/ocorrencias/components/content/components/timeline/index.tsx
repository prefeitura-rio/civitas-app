import { format } from 'date-fns'
import { CircleAlert } from 'lucide-react'

import { Spinner } from '@/components/custom/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useReportsMap } from '@/hooks/use-contexts/use-reports-map-context'
import { cn } from '@/lib/utils'
import { genericErrorMessage } from '@/utils/error-handlers'

import { ReportCard } from './components/report-card'

interface TimelineProps {
  className?: string
}

export function Timeline({ className }: TimelineProps) {
  const {
    layers: {
      reports: {
        data,
        layerStates: { isLoading },
        failed,
      },
    },
  } = useReportsMap()

  return (
    <div className={cn(className, 'mt-10 space-y-4')}>
      <h3>Histórico de ocorrências:</h3>
      <div className="pt-10">
        {isLoading ? (
          <div className="flex justify-center">
            <Spinner className="size-6" />
          </div>
        ) : failed ? (
          <div className="flex justify-center">
            <Alert className="w-96" variant="destructive">
              <CircleAlert className="h-4 w-4" />
              <AlertTitle>Erro!</AlertTitle>
              <AlertDescription>{genericErrorMessage}</AlertDescription>
            </Alert>
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center">
            <span className="text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </span>
          </div>
        ) : (
          data.map((item, index) => (
            <div className="flex h-full">
              <div className="flex w-40 justify-end gap-4 px-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold leading-4 text-primary">
                    {format(item.date, 'dd.MM.y')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(item.date, 'HH:mm')}
                  </span>
                </div>
                <div className="relative flex h-full flex-col items-center px-2">
                  <div className="z-10 h-6 w-6 shrink-0 rounded-full bg-muted opacity-50"></div>
                  <div className="z-20 mt-[-1.125rem] h-3 w-3 shrink-0 rounded-full bg-primary" />

                  <div className="-mt-1 h-[60%] w-0 border-[2px] border-muted" />
                  <div className="h-full w-0 border-[2px] border-dashed border-muted" />
                </div>
              </div>

              <ReportCard {...item} key={index} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
