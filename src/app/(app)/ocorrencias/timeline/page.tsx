'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CircleAlert } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Pagination } from '@/components/ui/pagination'
import { useTimelineStreaming } from '@/contexts/timeline-streaming-context'
import { useReportsSearchParams } from '@/hooks/useParams/useReportsSearchParams'
import type { ReportsResponse } from '@/http/reports/get-reports'
import { getReports } from '@/http/reports/get-reports'
import { genericErrorMessage } from '@/utils/error-handlers'

import { ReportCard } from './components/report-card'

export default function Timeline() {
  const { handlePaginate, queryKey, formattedSearchParams } =
    useReportsSearchParams()
  const queryClient = useQueryClient()
  const { isStreamingEnabled } = useTimelineStreaming()
  const hasExecutedFirstRequest = useRef(false)

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getReports(formattedSearchParams),
  })

  // Função para buscar e adicionar novas ocorrências
  const fetchNewOccurrences = useCallback(
    async (isFirstRequest: boolean = false) => {
      try {
        // Obter dados atuais do cache (sempre os mais atualizados)
        const currentData = queryClient.getQueryData<ReportsResponse>(queryKey)

        if (!currentData?.items || currentData.items.length === 0) {
          return
        }

        // Encontrar a ocorrência mais recente na lista atual
        const mostRecentDate = new Date(
          Math.max(
            ...currentData.items.map((item) => new Date(item.date).getTime()),
          ),
        )

        const now = new Date()
        let minDate: string
        const maxDate = now.toISOString()

        if (isFirstRequest) {
          // Primeiro request: buscar desde a data da ocorrência mais recente até agora
          minDate = mostRecentDate.toISOString()
        } else {
          // Requests subsequentes: buscar apenas dos últimos 5 minutos
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
          minDate = fiveMinutesAgo.toISOString()
        }

        // Criar parâmetros de busca mantendo os originais, mas atualizando as datas
        const streamingParams = {
          ...formattedSearchParams,
          minDate,
          maxDate,
          page: 1, // Sempre buscar na primeira página para novas ocorrências
        }

        // Buscar novas ocorrências
        const newData = await getReports(streamingParams)

        if (newData?.items && newData.items.length > 0) {
          // Obter dados atuais do cache novamente (pode ter mudado durante a busca)
          const latestData = queryClient.getQueryData<ReportsResponse>(queryKey)

          if (latestData) {
            // Criar um Set com os reportIds existentes para verificação rápida
            const existingReportIds = new Set(
              latestData.items.map((item) => item.reportId),
            )

            // Encontrar a data da ocorrência mais recente na lista atual (para comparação)
            const latestMostRecentDate = new Date(
              Math.max(
                ...latestData.items.map((item) =>
                  new Date(item.date).getTime(),
                ),
              ),
            )

            // Filtrar novas ocorrências:
            // 1. Que não sejam duplicatas (não existam no cache)
            // 2. Que sejam mais recentes que a ocorrência mais recente da lista atual
            //    (garantindo que só adicionamos ocorrências novas, não antigas)
            const newItems = newData.items.filter((item) => {
              const itemDate = new Date(item.date)
              const isDuplicate = existingReportIds.has(item.reportId)
              const isNewer =
                itemDate.getTime() > latestMostRecentDate.getTime()

              return !isDuplicate && isNewer
            })

            if (newItems.length > 0) {
              // Ordenar novas ocorrências por data (mais recente primeiro)
              newItems.sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )

              // Atualizar o cache usando função updater para garantir que a atualização seja detectada
              queryClient.setQueryData<ReportsResponse>(queryKey, (oldData) => {
                if (!oldData) return oldData

                // Verificar novamente se há duplicatas (pode ter mudado durante a atualização)
                const currentReportIds = new Set(
                  oldData.items.map((item) => item.reportId),
                )
                const finalNewItems = newItems.filter(
                  (item) => !currentReportIds.has(item.reportId),
                )

                if (finalNewItems.length === 0) {
                  return oldData
                }

                const finalCombinedItems = [...finalNewItems, ...oldData.items]

                return {
                  ...oldData,
                  items: finalCombinedItems,
                  total: oldData.total + finalNewItems.length,
                }
              })
            }
          }
        }
      } catch (error) {
        // Silenciosamente falhar para não interromper o streaming
      }
    },
    [queryKey, formattedSearchParams, queryClient],
  )

  useEffect(() => {
    if (!isStreamingEnabled) {
      // Resetar flag quando streaming é desativado
      hasExecutedFirstRequest.current = false
      return
    }

    // Executar imediatamente quando o streaming é ativado (primeiro request)
    if (!hasExecutedFirstRequest.current) {
      fetchNewOccurrences(true)
      hasExecutedFirstRequest.current = true
    }

    // Configurar intervalo para executar a cada 5 minutos (requests subsequentes)
    const intervalId = setInterval(
      () => {
        fetchNewOccurrences(false)
      },
      5 * 60 * 1000,
    ) // 5 minutos

    return () => {
      clearInterval(intervalId)
    }
  }, [isStreamingEnabled, fetchNewOccurrences])

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
              <AlertDescription>{genericErrorMessage}</AlertDescription>
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
