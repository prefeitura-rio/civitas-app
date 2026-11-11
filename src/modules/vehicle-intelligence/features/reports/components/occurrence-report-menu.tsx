import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  FileText,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/vehicle-intelligence/components/ui/popover'
import { occurrenceReportPaths } from '@/modules/vehicle-intelligence/features/reports/api'
import { useReportJob } from '@/modules/vehicle-intelligence/features/reports/use-report-job'
import { formatDateTime } from '@/modules/vehicle-intelligence/lib/dates'

/** As etapas da geração (`relatorios/ro/montagem.py`). */
const STAGES: Record<string, string> = {
  preparando: 'Preparando o relatório',
  consultando_dados: 'Lendo o RO e as placas que passaram',
  desenhando_mapa: 'Desenhando o mapa',
  renderizando_relatorio: 'Montando o PDF',
}

/**
 * "Relatório do RO" no cabeçalho do perfil do RO: o PDF com os dados do RO, o mapa e as listas de placas, nas janelas,
 * nos filtros e na ordem da tela (`query`, a mesma do perfil). A geração segue em segundo plano com o menu fechado e
 * baixa o arquivo ao terminar; trocar um filtro ou a ordem pede outro relatório.
 */
export function OccurrenceReportMenu({
  ro,
  query,
}: {
  ro: string
  query: string
}) {
  const [open, setOpen] = useState(false)
  const { status, running, error, request } = useReportJob(
    occurrenceReportPaths(ro, query),
  )
  const done =
    status?.estado === 'concluido' && Boolean(status.formatos?.includes('pdf'))
  const failed = !running && status?.estado === 'falhou'
  const finishedAt = formatDateTime(status?.concluido_em, '')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="profile-export-cta"
          title="Relatório em PDF deste RO, com os filtros e a ordem da tela"
          aria-busy={running}
        >
          {running ? (
            <Loader2
              className="animate-spin motion-reduce:animate-none"
              size={15}
              aria-hidden="true"
            />
          ) : (
            <FileText size={15} aria-hidden="true" />
          )}
          Relatório do RO
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="plate-reports-popover">
        <section className="plate-reports-section">
          <div className="grid gap-1">
            <h3 className="m-0 text-sm font-semibold tracking-tight">
              Relatório do RO
            </h3>
            <p className="m-0 text-xs leading-5 text-muted-foreground">
              Os dados do RO, o mapa de onde passaram e as listas de placas com
              os sinais de cada uma, nas janelas, nos filtros e na ordem da
              tela.
            </p>
            <p className="m-0 text-xs leading-5 text-muted-foreground">
              A busca e o filtro “Com sinal” das listas ficam só na tela.
            </p>
          </div>
          <span
            role="status"
            aria-live="polite"
            className="plate-reports-status"
          >
            {running && (
              <span className="flex items-center gap-2 text-foreground">
                <Loader2
                  className="animate-spin motion-reduce:animate-none"
                  size={14}
                  aria-hidden="true"
                />
                {STAGES[status?.etapa ?? ''] ?? 'Gerando o relatório'}…
              </span>
            )}
            {done && !running && (
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
            {error && !failed && (
              <span className="flex items-start gap-2 text-destructive">
                <AlertTriangle
                  size={14}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
                {error}
              </span>
            )}
            {!running && !done && !failed && !error && (
              <span className="text-muted-foreground">
                O arquivo baixa sozinho ao terminar.
              </span>
            )}
          </span>
          <Button type="button" size="sm" disabled={running} onClick={request}>
            {running ? (
              'Gerando…'
            ) : done ? (
              <>
                <Download size={15} aria-hidden="true" />
                Baixar PDF
              </>
            ) : failed ? (
              'Tentar de novo'
            ) : (
              'Gerar PDF'
            )}
          </Button>
        </section>
      </PopoverContent>
    </Popover>
  )
}
