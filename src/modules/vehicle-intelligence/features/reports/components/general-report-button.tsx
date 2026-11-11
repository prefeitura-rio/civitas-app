import { AlertTriangle, Check, Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/vehicle-intelligence/components/ui/popover'
import { Separator } from '@/modules/vehicle-intelligence/components/ui/separator'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import type { ReportStatus } from '@/modules/vehicle-intelligence/features/reports/api'
import { useGeneralReport } from '@/modules/vehicle-intelligence/features/reports/use-general-report'
import { formatDateTime } from '@/modules/vehicle-intelligence/lib/dates'

const STAGE_LABELS: Record<string, string> = {
  preparando: 'Preparando a execução',
  validando_snapshot: 'Validando o snapshot publicado',
  calculando_rankings: recorte.report?.rankingStage ?? 'Calculando os rankings',
  renderizando_relatorio: 'Renderizando o HTML e o PDF',
}

function stageLabel(status: ReportStatus | null): string {
  if (!status?.etapa) return 'Gerando o relatório'
  return STAGE_LABELS[status.etapa] ?? 'Gerando o relatório'
}

function formatInstant(value: string | null | undefined): string | null {
  return formatDateTime(value, '') || null
}

export function GeneralReportButton() {
  const [open, setOpen] = useState(false)
  const { status, running, error, start, download } = useGeneralReport()
  const done = status?.estado === 'concluido'
  const failed = status?.estado === 'falhou'
  const formats = status?.formatos ?? []
  const finishedAt = formatInstant(status?.concluido_em)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="general-report-trigger"
          aria-label={recorte.report?.buttonLabel}
          title="Gerar relatório"
        >
          {running ? (
            <Loader2
              className="animate-spin motion-reduce:animate-none"
              size={15}
              aria-hidden="true"
            />
          ) : (
            <Download size={15} aria-hidden="true" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="general-report-popover grid w-80 gap-3"
      >
        <div className="grid gap-1">
          <h3 className="m-0 text-sm font-semibold tracking-tight">
            Relatório geral de correlações
          </h3>
          <p className="m-0 text-xs leading-5 text-muted-foreground">
            {recorte.report?.description}
          </p>
        </div>

        <span role="status" aria-live="polite" className="text-xs">
          {running && (
            <span className="flex items-center gap-2 text-foreground">
              <Loader2
                className="animate-spin motion-reduce:animate-none"
                size={14}
                aria-hidden="true"
              />
              {stageLabel(status)}…
            </span>
          )}
          {done && (
            <span className="flex items-center gap-2 text-foreground">
              <Check size={14} aria-hidden="true" />
              Pronto{finishedAt ? ` em ${finishedAt}` : ''}
            </span>
          )}
          {failed && (
            <span className="flex items-start gap-2 text-destructive">
              <AlertTriangle
                size={14}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              {status?.detalhe ?? 'A geração anterior falhou.'}
            </span>
          )}
          {!running && !done && !failed && (
            <span className="text-muted-foreground">
              Nenhum relatório gerado ainda.
            </span>
          )}
        </span>

        {done && status?.detalhe && (
          <p className="m-0 text-xs leading-5 text-muted-foreground">
            {status.detalhe}
          </p>
        )}

        <Button type="button" size="sm" disabled={running} onClick={start}>
          {running
            ? 'Gerando…'
            : done || failed
              ? 'Gerar novamente'
              : 'Gerar relatório'}
        </Button>

        {done && formats.length > 0 && (
          <>
            <Separator />
            <div className="grid gap-2">
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-primary">
                Baixar
              </span>
              <div className="flex flex-wrap gap-2">
                {formats.includes('pdf') && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => download('pdf')}
                  >
                    <Download size={15} aria-hidden="true" />
                    PDF
                  </Button>
                )}
                {formats.includes('html') && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => download('html')}
                  >
                    <Download size={15} aria-hidden="true" />
                    HTML
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="m-0 text-xs leading-5 text-destructive">{error}</p>
        )}
      </PopoverContent>
    </Popover>
  )
}
