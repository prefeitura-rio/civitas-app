'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, UserRoundCog } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchTicketAttachmentBlob } from '@/http/tickets/download-ticket-attachment'
import { finalizeTicket } from '@/http/tickets/finalize-ticket'
import { getTicketCabecalho } from '@/http/tickets/get-ticket-cabecalho'
import { getTicketRelatorioCompleto } from '@/http/tickets/get-ticket-relatorio-completo'
import { getTicketAttachments } from '@/http/tickets/ticket-attachments'
import { queryClient } from '@/lib/react-query'
import { cn } from '@/lib/utils'
import { getApiErrorMessage, isNotFoundError } from '@/utils/error-handlers'

import {
  TICKET_DETAIL_TABS,
  type TicketDetailTabId,
} from './ticket-detail.constants'
import styles from './ticket-detail.module.css'
import { TicketDetailTabChamado } from './ticket-detail-tab-chamado'
import { TicketDetailTabDocumentos } from './ticket-detail-tab-documentos'
import { TicketDetailTabHistorico } from './ticket-detail-tab-historico'
import { TicketDetailTabParecerInterno } from './ticket-detail-tab-parecer-interno'
import { TicketDetailTabRelatorioDemanda } from './ticket-detail-tab-relatorio-demanda'
import { TicketDetailTabServicos } from './ticket-detail-tab-servicos'
import { TicketDetailTabSolicitante } from './ticket-detail-tab-solicitante'

function normalizePriority(priority?: string | null) {
  if (!priority) return '—'
  const value = priority.trim().toUpperCase()
  if (value === 'URGENTE') return 'Urgente'
  if (value === 'ALTA') return 'Alta'
  if (value === 'ROTINA') return 'Rotina'
  return priority.trim()
}

function formatDateBR(value?: string | null) {
  if (value == null || value === '') return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-')
    return `${d}/${m}/${y}`
  }
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dt)
}

function displayText(value?: string | null) {
  if (value == null) return '—'
  const t = value.trim()
  return t.length ? t : '—'
}

type Props = {
  ticketId: string
}

export function TicketDetailView({ ticketId }: Props) {
  const [activeTab, setActiveTab] = useState<TicketDetailTabId>('solicitante')
  const [oficioOpen, setOficioOpen] = useState(false)
  const [oficioAttachmentIndex, setOficioAttachmentIndex] = useState(0)
  const [oficioPreviewUrl, setOficioPreviewUrl] = useState<string | null>(null)
  const [relatorioOpen, setRelatorioOpen] = useState(false)
  const [relatorioPreviewUrl, setRelatorioPreviewUrl] = useState<string | null>(
    null,
  )
  const [finalizeOpen, setFinalizeOpen] = useState(false)

  const query = useQuery({
    queryKey: ['ticket', ticketId, 'cabecalho'],
    queryFn: () => getTicketCabecalho(ticketId),
  })

  const cab = query.data

  const finalizeMutation = useMutation({
    mutationFn: () => finalizeTicket(ticketId),
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['ticket', ticketId] })
        .catch(() => {})
      toast.success('Chamado finalizado e enviado para revisão.')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const oficioAttachmentsQuery = useQuery({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: () => getTicketAttachments(ticketId),
    enabled: oficioOpen,
    retry: false,
  })

  const oficioAnexos = oficioAttachmentsQuery.data ?? []
  const oficioCurrentAttachment = oficioAnexos[oficioAttachmentIndex] ?? null

  const oficioBlobQuery = useQuery({
    queryKey: [
      'ticket',
      ticketId,
      'attachment-preview',
      oficioCurrentAttachment?.id,
    ],
    queryFn: () =>
      fetchTicketAttachmentBlob(ticketId, oficioCurrentAttachment!.id),
    enabled:
      oficioOpen &&
      Boolean(oficioCurrentAttachment?.id) &&
      oficioAnexos.length > 0,
    retry: false,
  })

  useEffect(() => {
    if (!oficioOpen || oficioAnexos.length === 0) return
    setOficioAttachmentIndex((i) => Math.min(i, oficioAnexos.length - 1))
  }, [oficioOpen, oficioAnexos.length])

  useEffect(() => {
    let created: string | null = null

    if (oficioOpen && oficioBlobQuery.data) {
      const { blob, contentType } = oficioBlobQuery.data
      const typed =
        blob.type && blob.type.length > 0
          ? blob
          : new Blob([blob], { type: contentType })
      created = URL.createObjectURL(typed)
    }

    setOficioPreviewUrl(created)

    return () => {
      if (created) URL.revokeObjectURL(created)
    }
  }, [oficioOpen, oficioBlobQuery.data])

  const relatorioQuery = useQuery({
    queryKey: ['ticket', ticketId, 'relatorio-completo'],
    queryFn: () => getTicketRelatorioCompleto(ticketId),
    enabled: relatorioOpen,
    retry: false,
  })

  useEffect(() => {
    let created: string | null = null

    if (relatorioOpen && relatorioQuery.data) {
      const { blob, contentType } = relatorioQuery.data
      const typed =
        blob.type && blob.type.length > 0
          ? blob
          : new Blob([blob], { type: contentType })
      created = URL.createObjectURL(typed)
    }

    setRelatorioPreviewUrl(created)

    return () => {
      if (created) URL.revokeObjectURL(created)
    }
  }, [relatorioOpen, relatorioQuery.data])

  if (query.isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.loading}>Carregando chamado…</p>
        </div>
      </div>
    )
  }

  if (query.isError || !cab) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.error}>
            Não foi possível carregar este chamado. Tente novamente mais tarde.
          </p>
          <Link
            href="/chamados"
            className={styles.backLink}
            aria-label="Voltar"
          >
            <ChevronLeft size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBlock}>
          <div className={styles.headerBar}>
            <div className={styles.titleRow}>
              <Link
                href="/chamados"
                className={styles.backLink}
                aria-label="Voltar para lista de chamados"
              >
                <ChevronLeft size={18} />
              </Link>
              <p className={styles.title} role="heading" aria-level={1}>
                {`Chamado #${cab.internal_number}`}
              </p>
            </div>
            <span className={styles.statusBadge}>
              {displayText(cab.status).toLocaleUpperCase('pt-BR')}
            </span>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <div className={styles.metaCell}>
                <span className={styles.metaLabel}>Prioridade:</span>
                <span className={styles.metaValue}>
                  {normalizePriority(cab.prioridade)}
                </span>
              </div>
              <div className={styles.metaCell}>
                <span className={styles.metaLabel}>Equipe:</span>
                <span className={styles.metaValue}>
                  {displayText(cab.equipe)}
                </span>
              </div>
              <div className={styles.metaCell}>
                <span className={styles.metaLabel}>Responsável:</span>
                <span className={styles.metaValue}>
                  {displayText(cab.responsavel).toLocaleUpperCase('pt-BR')}
                </span>
              </div>
            </div>
            <div className={styles.metaRow}>
              <div className={styles.metaCell}>
                <span className={styles.metaLabel}>Data Base:</span>
                <span className={styles.metaValue}>
                  {formatDateBR(cab.data_base)}
                </span>
              </div>
              <div className={styles.metaCell}>
                <span className={styles.metaLabel}>Data da Entrada:</span>
                <span className={styles.metaValue}>
                  {formatDateBR(cab.created_at)}
                </span>
              </div>
              <div className={styles.metaCell}>
                <span className={styles.metaLabel}>
                  Tempo do chamado em aberto:
                </span>
                <span className={styles.metaValue}>
                  {displayText(cab.tempo_aberto)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={`${styles.actionSlot} ${styles.actionTertiary}`}
            onClick={() => {
              setOficioAttachmentIndex(0)
              setOficioOpen(true)
            }}
          >
            Visualizar Documentos
          </button>
          <button
            type="button"
            className={`${styles.actionSlot} ${styles.actionTertiary}`}
            onClick={() => setRelatorioOpen(true)}
          >
            Gerar Relatório
          </button>
          <button
            type="button"
            className={`${styles.actionSlot} ${styles.actionSecondary}`}
            onClick={() => setFinalizeOpen(true)}
            disabled={finalizeMutation.isPending}
          >
            {finalizeMutation.isPending ? 'Finalizando…' : 'Finalizar Chamado'}
          </button>
          <button
            type="button"
            className={`${styles.actionSlot} ${styles.actionPrimary}`}
            disabled
          >
            <UserRoundCog size={20} aria-hidden />
            Reatribuir Chamado
          </button>
        </div>

        <div className={styles.tabsShell}>
          <div
            className={styles.tabBar}
            role="tablist"
            aria-label="Seções do chamado"
          >
            {TICKET_DETAIL_TABS.map((tab) => {
              const isActive = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'solicitante' ? (
            <TicketDetailTabSolicitante ticketId={ticketId} />
          ) : activeTab === 'chamado' ? (
            <TicketDetailTabChamado ticketId={ticketId} />
          ) : activeTab === 'documentos' ? (
            <div className={styles.panel} role="tabpanel">
              <TicketDetailTabDocumentos ticketId={ticketId} />
            </div>
          ) : activeTab === 'servicos' ? (
            <div className={styles.panel} role="tabpanel">
              <TicketDetailTabServicos ticketId={ticketId} />
            </div>
          ) : activeTab === 'parecer_interno' ? (
            <div className={styles.panel} role="tabpanel">
              <TicketDetailTabParecerInterno ticketId={ticketId} />
            </div>
          ) : activeTab === 'relatorio_demanda' ? (
            <div className={styles.panel} role="tabpanel">
              <TicketDetailTabRelatorioDemanda
                key={ticketId}
                ticketId={ticketId}
              />
            </div>
          ) : activeTab === 'historico' ? (
            <div className={styles.panel} role="tabpanel">
              <TicketDetailTabHistorico ticketId={ticketId} />
            </div>
          ) : (
            <div className={styles.panelPlaceholder} role="tabpanel">
              {`Conteúdo da aba "${TICKET_DETAIL_TABS.find((t) => t.id === activeTab)?.label}" será implementado em seguida.`}
            </div>
          )}
        </div>

        <AlertDialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finalizar chamado?</AlertDialogTitle>
              <AlertDialogDescription>
                O sistema validará os dados obrigatórios e a completude dos
                serviços. Se estiver tudo correto, o status passará para
                aguardando revisão.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={finalizeMutation.isPending}
                onClick={() => finalizeMutation.mutate()}
              >
                {finalizeMutation.isPending ? 'Finalizando…' : 'Confirmar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog
          open={oficioOpen}
          onOpenChange={(open) => {
            setOficioOpen(open)
            if (open) setOficioAttachmentIndex(0)
          }}
        >
          <DialogContent
            className={cn(
              styles.oficioDialogContent,
              'translate-x-[-50%] translate-y-[-50%] sm:max-w-[min(96vw,1100px)]',
            )}
            aria-describedby={undefined}
          >
            <DialogHeader className={styles.oficioDialogHeader}>
              <DialogTitle className={styles.oficioDialogTitle}>
                Ofício
              </DialogTitle>
            </DialogHeader>
            <div className={styles.oficioDialogBody}>
              {oficioAttachmentsQuery.isLoading ? (
                <p className={styles.oficioDialogMessage}>Carregando anexos…</p>
              ) : oficioAttachmentsQuery.isError ? (
                <p
                  className={`${styles.oficioDialogMessage} ${styles.oficioDialogError}`}
                >
                  {getApiErrorMessage(oficioAttachmentsQuery.error)}
                </p>
              ) : oficioAnexos.length === 0 ? (
                <p className={styles.oficioDialogMessage}>
                  Não há anexos neste chamado.
                </p>
              ) : oficioBlobQuery.isLoading ||
                (oficioBlobQuery.data &&
                  !oficioPreviewUrl &&
                  !oficioBlobQuery.isError) ? (
                <p className={styles.oficioDialogMessage}>
                  Carregando arquivo…
                </p>
              ) : oficioBlobQuery.isError ? (
                <p
                  className={`${styles.oficioDialogMessage} ${styles.oficioDialogError}`}
                >
                  {isNotFoundError(oficioBlobQuery.error)
                    ? 'Este anexo não está mais disponível.'
                    : getApiErrorMessage(oficioBlobQuery.error)}
                </p>
              ) : oficioPreviewUrl ? (
                <>
                  <div className={styles.oficioAttachmentToolbar}>
                    <button
                      type="button"
                      className={styles.oficioAttachmentNavBtn}
                      aria-label="Anexo anterior"
                      disabled={oficioAttachmentIndex <= 0}
                      onClick={() =>
                        setOficioAttachmentIndex((i) => Math.max(0, i - 1))
                      }
                    >
                      <ChevronLeft size={22} aria-hidden />
                    </button>
                    <div className={styles.oficioAttachmentMeta}>
                      <span
                        className={styles.oficioAttachmentName}
                        title={oficioCurrentAttachment?.filename}
                      >
                        {oficioCurrentAttachment?.filename ?? '—'}
                      </span>
                      <span className={styles.oficioAttachmentCounter}>
                        {oficioAttachmentIndex + 1} / {oficioAnexos.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.oficioAttachmentNavBtn}
                      aria-label="Próximo anexo"
                      disabled={
                        oficioAttachmentIndex >= oficioAnexos.length - 1
                      }
                      onClick={() =>
                        setOficioAttachmentIndex((i) =>
                          Math.min(oficioAnexos.length - 1, i + 1),
                        )
                      }
                    >
                      <ChevronRight size={22} aria-hidden />
                    </button>
                  </div>
                  <iframe
                    title={`Visualização: ${oficioCurrentAttachment?.filename ?? 'anexo'}`}
                    src={oficioPreviewUrl}
                    className={styles.oficioFrame}
                  />
                </>
              ) : (
                <p className={styles.oficioDialogMessage}>
                  Não foi possível exibir o arquivo neste navegador.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={relatorioOpen} onOpenChange={setRelatorioOpen}>
          <DialogContent
            className={cn(
              styles.oficioDialogContent,
              'translate-x-[-50%] translate-y-[-50%] sm:max-w-[min(96vw,1100px)]',
            )}
            aria-describedby={undefined}
          >
            <DialogHeader className={styles.oficioDialogHeader}>
              <DialogTitle className={styles.oficioDialogTitle}>
                Relatório completo
              </DialogTitle>
            </DialogHeader>
            <div className={styles.oficioDialogBody}>
              {relatorioQuery.isLoading ||
              (relatorioQuery.data &&
                !relatorioPreviewUrl &&
                !relatorioQuery.isError) ? (
                <p className={styles.oficioDialogMessage}>Gerando relatório…</p>
              ) : relatorioQuery.isError ? (
                <p
                  className={`${styles.oficioDialogMessage} ${styles.oficioDialogError}`}
                >
                  {isNotFoundError(relatorioQuery.error)
                    ? 'Relatório não disponível para este chamado.'
                    : getApiErrorMessage(relatorioQuery.error)}
                </p>
              ) : relatorioPreviewUrl ? (
                <iframe
                  title="Visualização do relatório completo"
                  src={relatorioPreviewUrl}
                  className={styles.oficioFrame}
                />
              ) : (
                <p className={styles.oficioDialogMessage}>
                  Não foi possível exibir o arquivo neste navegador.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
