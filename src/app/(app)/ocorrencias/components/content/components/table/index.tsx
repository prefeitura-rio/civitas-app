import { format } from 'date-fns'

import { useReportsMap } from '@/hooks/use-contexts/use-reports-map-context'
import { cn } from '@/lib/utils'

import { ReportCard } from './components/report-card'

interface TableProps {
  className?: string
}

export function Table({ className }: TableProps) {
  const {
    layers: {
      reports: { data },
    },
  } = useReportsMap()

  return (
    <div className={cn(className, 'mt-10 space-y-4')}>
      <h3>Histórico de ocorrências:</h3>
      <div className="pt-10">
        {data.map((item, index) => (
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
        ))}
      </div>
    </div>
  )
}
