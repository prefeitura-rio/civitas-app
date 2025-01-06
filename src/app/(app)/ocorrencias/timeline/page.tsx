'use client'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CircleAlert } from 'lucide-react'

import { Spinner } from '@/components/custom/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Pagination } from '@/components/ui/pagination'
import { useReportsSearchParams } from '@/hooks/use-params/use-reports-search-params'
import { getReports } from '@/http/reports/get-reports'
import { GENERIC_ERROR_MESSAGE } from '@/utils/error-handlers'

import { ReportCard } from './components/report-card'

export default function Timeline() {
  const { handlePaginate, queryKey, formattedSearchParams } =
    useReportsSearchParams()
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getReports(formattedSearchParams),
  })

  return (
    <div className="mt-10 h-[calc(100%-4.75rem)] min-w-screen-lg space-y-4 overflow-y-scroll">
      <h3>Histórico de ocorrências:</h3>
      <div className="pt-10">
        {isLoading ? (
          <div className="flex justify-center">
            <Spinner className="size-6" />
          </div>
        ) : error ? (
          <div className="flex justify-center">
            <Alert className="w-96" variant="destructive">
              <CircleAlert className="h-4 w-4" />
              <AlertTitle>Erro!</AlertTitle>
              <AlertDescription>{GENERIC_ERROR_MESSAGE}</AlertDescription>
            </Alert>
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="flex justify-center">
            <span className="text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </span>
          </div>
        ) : (
          data && (
            <div>
              {data?.items.map((item, index) => (
                <div key={index} className="flex h-full">
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
              <Pagination
                className="mb-2 mt-4"
                page={data?.page}
                total={data?.total}
                size={data?.size}
                onPageChange={handlePaginate}
              />
            </div>
          )
        )}
      </div>
    </div>
  )
}
