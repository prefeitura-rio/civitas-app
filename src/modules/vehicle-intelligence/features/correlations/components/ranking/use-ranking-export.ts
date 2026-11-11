import { useEffect, useState } from 'react'

import { getRanking } from '@/modules/vehicle-intelligence/features/correlations/api'
import {
  buildCorrelationRankingCsv,
  correlationRankingFilename,
} from '@/modules/vehicle-intelligence/features/correlations/ranking-export'
import type {
  CorrelationRankingSortTerm,
  CorrelationRankingView,
} from '@/modules/vehicle-intelligence/types/domain'

export type RankingExport = ReturnType<typeof useRankingExport>

/**
 * Exportação do Top N do ranking em CSV, com os mesmos filtros e a mesma ordenação da tabela. A mensagem some quando
 * o recorte, a vista, a busca ou a ordenação mudam.
 */
export function useRankingExport(
  view: CorrelationRankingView,
  scopeKey: string,
  plate: string,
  sortTerms: CorrelationRankingSortTerm[],
  pathFor: (size: number) => string,
) {
  const [exportSize, setExportSize] = useState<number>(10)
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  useEffect(() => {
    setExportStatus(null)
  }, [scopeKey, view, plate, sortTerms])

  const handleExport = async () => {
    setExporting(true)
    setExportStatus(null)
    try {
      const exportData = await getRanking(pathFor(exportSize))
      if (!exportData.ready || exportData.rows.length === 0) {
        setExportStatus('Nenhuma placa disponível para exportar neste recorte.')
        return
      }
      const href = URL.createObjectURL(
        new Blob([buildCorrelationRankingCsv(exportData.rows, view)], {
          type: 'text/csv;charset=utf-8',
        }),
      )
      const link = document.createElement('a')
      link.href = href
      link.download = correlationRankingFilename(view, exportData.rows.length)
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(href)
      const plates = new Set(exportData.rows.map((row) => row.plate)).size
      setExportStatus(
        plates === exportData.rows.length
          ? `CSV com ${plates} ${plates === 1 ? 'placa exportada' : 'placas exportadas'}.`
          : `CSV com ${exportData.rows.length} registros e ${plates} placas distintas.`,
      )
    } catch (reason) {
      setExportStatus(
        reason instanceof Error
          ? `Falha ao exportar: ${reason.message}`
          : 'Falha ao exportar o ranking.',
      )
    } finally {
      setExporting(false)
    }
  }

  return {
    exportSize,
    setExportSize,
    exporting,
    exportStatus,
    setExportStatus,
    handleExport,
  }
}
