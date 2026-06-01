'use client'

import { format } from 'date-fns'
import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  type DemandVolumeFilterIn,
  getDemandVolumeTickets,
} from '@/http/tickets/get-demand-volume'
import { dateConfig } from '@/lib/date-config'
import { downloadFile } from '@/utils/download-file'
import { getApiErrorMessage } from '@/utils/error-handlers'

import {
  buildDemandVolumeTicketsCsv,
  demandVolumeTicketsExportFilename,
} from './demand-volume-export'
import { formatDemandVolumeAdvancedFiltersSummary } from './demand-volume-filter-utils'
import styles from './demand-volume-top.module.css'

interface DemandVolumeExportDialogProps {
  appliedFilters: DemandVolumeFilterIn
  disabled?: boolean
}

function formatBrDate(iso: string | undefined): string {
  if (!iso?.trim()) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(y, m - 1, d)
  return format(date, dateConfig.formats.date, { locale: dateConfig.locale })
}

export function DemandVolumeExportDialog({
  appliedFilters,
  disabled,
}: DemandVolumeExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const advancedFilterLines =
    formatDemandVolumeAdvancedFiltersSummary(appliedFilters)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const { items } = await getDemandVolumeTickets(appliedFilters)
      if (items.length === 0) {
        toast.message('Nenhum chamado para exportar com os filtros atuais.')
        return
      }
      const exportedAt = new Date()
      const csv = buildDemandVolumeTicketsCsv(items)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      downloadFile(blob, demandVolumeTicketsExportFilename(exportedAt))
      toast.success(`Exportação concluída (${items.length} linhas).`)
      setOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsExporting(false)
    }
  }, [appliedFilters])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Exportar chamados"
          title="Exportar"
          disabled={disabled}
        >
          <Upload className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent
        className="border-[#4a5d6d] bg-[#101d28] text-[#f9fafa] sm:max-w-md"
        style={{ maxWidth: '440px' }}
      >
        <DialogHeader>
          <DialogTitle className="text-[#f9fafa]">
            Exportar chamados
          </DialogTitle>
          <DialogDescription className="text-[#97a2ab]">
            Gera um arquivo CSV com a lista de chamados do período e filtros
            aplicados, pronto para abrir no Excel ou Google Planilhas.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-col gap-3 rounded-lg border border-[#4a5d6d] bg-[#152534] p-4 text-sm"
          role="region"
          aria-label="Parâmetros da exportação"
        >
          <div className="flex items-start gap-3">
            <FileSpreadsheet
              className="mt-0.5 h-5 w-5 shrink-0 text-[#06b2bb]"
              aria-hidden
            />
            <div className="min-w-0 space-y-2">
              <p className="font-medium text-[#f9fafa]">Conteúdo incluído</p>
              <ul className="list-inside list-disc space-y-1 text-[#97a2ab]">
                <li>Nº interno, data, status e priority</li>
                <li>Demandante, operação e tipo de chamado</li>
                <li>Natureza, equipe e chamado pai (quando houver)</li>
              </ul>
            </div>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-[#1d3449] pt-3 text-[13px]">
            <dt className="text-[#97a2ab]">Período da busca</dt>
            <dd className="text-[#f9fafa]">
              {formatBrDate(appliedFilters.date_from)} —{' '}
              {formatBrDate(appliedFilters.date_to)}
            </dd>
            {advancedFilterLines.length > 0 ? (
              <>
                <dt className="text-[#97a2ab]">Filtros</dt>
                <dd className="text-[#f9fafa]">
                  <ul className="list-inside list-disc space-y-0.5">
                    {advancedFilterLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </dd>
              </>
            ) : null}
          </dl>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-[#4a5d6d] bg-transparent text-[#f9fafa] hover:bg-[#1d3449]"
            onClick={() => setOpen(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="gap-2 bg-[#1d3449] text-[#f9fafa] hover:bg-[#254a66]"
            onClick={() => {
              handleExport()
            }}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Spinner className="h-4 w-4" />
                Exportando…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Baixar CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
