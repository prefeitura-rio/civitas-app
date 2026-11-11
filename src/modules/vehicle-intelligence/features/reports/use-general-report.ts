import { useCallback, useEffect, useRef, useState } from 'react'

import {
  downloadGeneralReport,
  getGeneralReportStatus,
  type ReportFormat,
  type ReportStatus,
  startGeneralReport,
} from '@/modules/vehicle-intelligence/features/reports/api'

const POLL_INTERVAL_MS = 4000

export interface GeneralReportState {
  status: ReportStatus | null
  running: boolean
  error: string | null
  start: () => void
  download: (format: ReportFormat) => void
}

export function useGeneralReport(): GeneralReportState {
  const [status, setStatus] = useState<ReportStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const running = status?.estado === 'gerando'

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const next = await getGeneralReportStatus(signal)
      if (mounted.current) setStatus(next)
    } catch (cause) {
      if (signal?.aborted || !mounted.current) return
      setError(
        cause instanceof Error
          ? cause.message
          : 'Falha ao consultar o relatório',
      )
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void refresh(controller.signal)
    return () => controller.abort()
  }, [refresh])

  useEffect(() => {
    if (!running) return
    const controller = new AbortController()
    const timer = window.setInterval(() => {
      void refresh(controller.signal)
    }, POLL_INTERVAL_MS)
    return () => {
      window.clearInterval(timer)
      controller.abort()
    }
  }, [running, refresh])

  const start = useCallback(() => {
    setError(null)
    void (async () => {
      try {
        const next = await startGeneralReport()
        if (mounted.current) setStatus(next)
      } catch (cause) {
        if (!mounted.current) return
        setError(
          cause instanceof Error ? cause.message : 'Falha ao iniciar a geração',
        )
      }
    })()
  }, [])

  const download = useCallback((format: ReportFormat) => {
    setError(null)
    void (async () => {
      try {
        await downloadGeneralReport(format)
      } catch (cause) {
        if (!mounted.current) return
        setError(
          cause instanceof Error
            ? cause.message
            : 'Falha ao baixar o relatório',
        )
      }
    })()
  }, [])

  return { status, running, error, start, download }
}
