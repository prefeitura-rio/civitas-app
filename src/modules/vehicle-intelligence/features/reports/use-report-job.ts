import { useCallback, useEffect, useRef, useState } from 'react'

import {
  downloadReport,
  getReportStatus,
  type ReportPaths,
  type ReportStatus,
  startReport,
} from '@/modules/vehicle-intelligence/features/reports/api'

const POLL_INTERVAL_MS = 2500

export interface ReportJobState<T extends ReportStatus> {
  status: T | null
  running: boolean
  error: string | null
  /** Baixa o PDF pronto destes parâmetros; sem ele, gera e baixa quando terminar. */
  request: () => void
}

/**
 * Um relatório em PDF de uma placa (correlações ou tendências) nos parâmetros do caminho (`paths.status`). O banco não
 * muda com o painel no ar, então um relatório pronto para os mesmos parâmetros é só baixado; trocar um parâmetro pede
 * outro. A geração segue em segundo plano com o menu fechado e baixa sozinha quando termina.
 */
export function useReportJob<T extends ReportStatus = ReportStatus>(
  paths: ReportPaths,
): ReportJobState<T> {
  const [status, setStatus] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pendingDownload = useRef(false)
  const running = status?.estado === 'gerando'
  // Os caminhos são recriados a cada renderização; o estado do relatório só muda com eles.
  const key = paths.status
  const pathsRef = useRef(paths)
  pathsRef.current = paths

  const download = useCallback(async () => {
    try {
      await downloadReport(pathsRef.current, 'pdf')
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Falha ao baixar o relatório',
      )
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setError(null)
    pendingDownload.current = false
    getReportStatus<T>(pathsRef.current, controller.signal)
      .then(setStatus)
      .catch((cause) => {
        if (controller.signal.aborted) return
        setStatus(null)
        setError(
          cause instanceof Error
            ? cause.message
            : 'Falha ao consultar o relatório',
        )
      })
    return () => controller.abort()
  }, [key])

  useEffect(() => {
    if (!running) return
    const controller = new AbortController()
    const timer = window.setInterval(() => {
      getReportStatus<T>(pathsRef.current, controller.signal)
        .then(setStatus)
        .catch((cause) => {
          if (!controller.signal.aborted)
            setError(
              cause instanceof Error
                ? cause.message
                : 'Falha ao consultar o relatório',
            )
        })
    }, POLL_INTERVAL_MS)
    return () => {
      window.clearInterval(timer)
      controller.abort()
    }
  }, [key, running])

  // Pediu e terminou: baixa sem outro clique.
  useEffect(() => {
    if (status?.estado === 'concluido' && pendingDownload.current) {
      pendingDownload.current = false
      void download()
    }
    if (status?.estado === 'falhou') pendingDownload.current = false
  }, [download, status])

  const request = useCallback(() => {
    setError(null)
    if (status?.estado === 'concluido' && status.formatos?.includes('pdf')) {
      void download()
      return
    }
    pendingDownload.current = true
    startReport<T>(pathsRef.current)
      .then(setStatus)
      .catch((cause) => {
        pendingDownload.current = false
        setError(
          cause instanceof Error
            ? cause.message
            : 'Falha ao iniciar o relatório',
        )
      })
  }, [download, status])

  return { status, running, error, request }
}
