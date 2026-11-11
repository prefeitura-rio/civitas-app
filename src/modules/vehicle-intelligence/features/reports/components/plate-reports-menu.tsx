import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  FileText,
  Loader2,
} from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/vehicle-intelligence/components/ui/popover'
import { Separator } from '@/modules/vehicle-intelligence/components/ui/separator'
import {
  plateReportPaths,
  type ReportStatus,
  type TrendPeriod,
  trendReportPaths,
  type TrendReportStatus,
} from '@/modules/vehicle-intelligence/features/reports/api'
import {
  type ReportJobState,
  useReportJob,
} from '@/modules/vehicle-intelligence/features/reports/use-report-job'
import {
  formatDate,
  formatDateTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import { useEventScope } from '@/modules/vehicle-intelligence/stores/event-scope'

/** Janelas do fato oferecidas para o relatório de correlações (a da tela entra se for outra). */
const REPORT_WINDOWS = [10, 20, 30]

const CORRELATION_STAGES: Record<string, string> = {
  preparando: 'Preparando o relatório',
  consultando_dados: 'Consultando as correlações e as leituras',
  desenhando_mapas: 'Desenhando os mapas de cada dia',
  renderizando_relatorio: 'Montando o PDF',
}
const TREND_STAGES: Record<string, string> = {
  preparando: 'Preparando o relatório',
  consultando_dados: 'Lendo as passagens do período',
  analisando: 'Calculando as análises e desenhando os mapas',
  renderizando_relatorio: 'Montando o PDF',
}

/**
 * Menu "Relatórios" do cabeçalho do perfil: o relatório de correlações (no recorte de fatos da tela, com a janela do
 * fato escolhida aqui; o padrão é a da tela) e o de tendências (no período escolhido aqui; o padrão é o da aba de
 * tendências, do primeiro ao último dia com leitura da placa). Cada um gera em segundo plano e baixa o PDF ao terminar.
 */
export function PlateReportsMenu({
  plate,
  scope,
  correlationsReady,
  linkedEvents,
}: {
  plate: string
  /** A query do recorte de fatos da tela (`usePlateScopeQuery`). */
  scope: string
  correlationsReady: boolean
  /** Ocorrências ligadas na janela da tela. */
  linkedEvents: number
}) {
  const [open, setOpen] = useState(false)
  const { scope: eventScope } = useEventScope()
  const screenWindow = eventScope.eventWindow

  // A janela escolhida vale enquanto a da tela não muda; trocar a da tela volta ao padrão.
  const [chosen, setChosen] = useState<{
    screen: number
    value: number
  } | null>(null)
  const eventWindow =
    chosen?.screen === screenWindow ? chosen.value : screenWindow
  const windows = useMemo(
    () => [...new Set([...REPORT_WINDOWS, screenWindow])].sort((a, b) => a - b),
    [screenWindow],
  )
  const correlationQuery = useMemo(() => {
    const params = new URLSearchParams(scope)
    params.set('janela_evento', String(eventWindow))
    return params.toString()
  }, [eventWindow, scope])
  const correlations = useReportJob(plateReportPaths(plate, correlationQuery))
  const correlationsBlocked =
    !correlationsReady || (linkedEvents === 0 && eventWindow === screenWindow)

  // Período em edição, da placa em que foi escolhido; nulo é o da aba. Só um período válido vai para o servidor.
  const [edited, setEdited] = useState<{
    plate: string
    period: TrendPeriod
  } | null>(null)
  const draft = edited?.plate === plate ? edited.period : null
  const setDraft = (period: TrendPeriod | null) =>
    setEdited(period && { plate, period })
  const invalidPeriod = Boolean(
    draft && (!draft.inicio || !draft.fim || draft.inicio > draft.fim),
  )
  const trends = useReportJob<TrendReportStatus>(
    trendReportPaths(plate, draft && !invalidPeriod ? draft : null),
  )
  const resolved = trends.status?.periodo
  const tabPeriod = resolved?.padrao
  const shown =
    draft ?? (resolved ? { inicio: resolved.inicio, fim: resolved.fim } : null)

  const running = correlations.running || trends.running
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="profile-export-cta"
          title="Relatórios em PDF desta placa: correlações e tendências"
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
          Relatórios
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="plate-reports-popover">
        <ReportSection
          title="Relatório de correlações"
          description="Quadro resumo, ROs e o dia a dia com o mapa e a sequência de leituras, no recorte de fatos da tela."
          job={correlations}
          stages={CORRELATION_STAGES}
          blocked={correlationsBlocked}
          blockedReason={
            correlationsReady
              ? `Nenhuma ocorrência ligada com a janela de ±${screenWindow} min da tela.`
              : 'Aguardando as correlações da placa.'
          }
        >
          <div className="plate-reports-field">
            <span className="plate-reports-label">Janela do fato</span>
            <div
              className="plate-reports-choices"
              role="radiogroup"
              aria-label="Janela do fato"
            >
              {windows.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={value === eventWindow}
                  className={value === eventWindow ? 'selected' : ''}
                  onClick={() => setChosen({ screen: screenWindow, value })}
                >
                  ±{value} min
                </button>
              ))}
            </div>
            <span className="plate-reports-hint">
              Padrão: a janela da tela (±{screenWindow} min).
            </span>
          </div>
        </ReportSection>

        <Separator />

        <ReportSection
          title="Relatório de tendências"
          description="Locais e horários de maior detecção, histórico diário, hiatos e viagens da placa no período."
          job={trends}
          stages={TREND_STAGES}
          blocked={invalidPeriod || !shown}
          blockedReason={
            invalidPeriod
              ? 'O início do período é depois do fim.'
              : 'Carregando o período da placa.'
          }
        >
          <div className="plate-reports-field">
            <span className="plate-reports-label">Período</span>
            <div className="plate-reports-dates">
              <label>
                <span>De</span>
                <input
                  type="date"
                  value={shown?.inicio ?? ''}
                  min={tabPeriod?.inicio}
                  max={tabPeriod?.fim}
                  disabled={!shown}
                  onChange={(event) =>
                    shown &&
                    setDraft({ inicio: event.target.value, fim: shown.fim })
                  }
                />
              </label>
              <label>
                <span>Até</span>
                <input
                  type="date"
                  value={shown?.fim ?? ''}
                  min={tabPeriod?.inicio}
                  max={tabPeriod?.fim}
                  disabled={!shown}
                  onChange={(event) =>
                    shown &&
                    setDraft({ inicio: shown.inicio, fim: event.target.value })
                  }
                />
              </label>
            </div>
            <span className="plate-reports-hint">
              {tabPeriod
                ? `Padrão: o da aba de tendências (${formatDate(tabPeriod.inicio)} a ${formatDate(tabPeriod.fim)}).`
                : 'Padrão: o período da aba de tendências.'}
              {draft && (
                <button
                  type="button"
                  className="plate-reports-reset"
                  onClick={() => setDraft(null)}
                >
                  Usar o padrão
                </button>
              )}
            </span>
          </div>
        </ReportSection>
      </PopoverContent>
    </Popover>
  )
}

function ReportSection<T extends ReportStatus>({
  title,
  description,
  job,
  stages,
  blocked,
  blockedReason,
  children,
}: {
  title: string
  description: string
  job: ReportJobState<T>
  stages: Record<string, string>
  blocked: boolean
  blockedReason: string
  children: ReactNode
}) {
  const { status, running, error, request } = job
  const done =
    status?.estado === 'concluido' && Boolean(status.formatos?.includes('pdf'))
  const failed = !running && status?.estado === 'falhou'
  const finishedAt = formatDateTime(status?.concluido_em, '')
  return (
    <section className="plate-reports-section">
      <div className="grid gap-1">
        <h3 className="m-0 text-sm font-semibold tracking-tight">{title}</h3>
        <p className="m-0 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
      <span role="status" aria-live="polite" className="plate-reports-status">
        {running && (
          <span className="flex items-center gap-2 text-foreground">
            <Loader2
              className="animate-spin motion-reduce:animate-none"
              size={14}
              aria-hidden="true"
            />
            {stages[status?.etapa ?? ''] ?? 'Gerando o relatório'}…
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
        {blocked && !running && !error && (
          <span className="text-muted-foreground">{blockedReason}</span>
        )}
      </span>
      <Button
        type="button"
        size="sm"
        disabled={blocked || running}
        onClick={request}
      >
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
  )
}
