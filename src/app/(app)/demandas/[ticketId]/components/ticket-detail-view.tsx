'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserRoundCog,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  getTeamMembersByRole,
  type TeamMemberUserOut,
} from '@/http/teams/get-team-members-by-role'
import {
  getTeamsByRole,
  type TeamIdNameOut,
} from '@/http/teams/get-teams-by-role'
import {
  applyTicketWorkflowAction,
  type ApplyTicketWorkflowActionOut,
} from '@/http/tickets/apply-ticket-workflow-action'
import { fetchTicketAttachmentBlob } from '@/http/tickets/download-ticket-attachment'
import { getTicketAllowedActions } from '@/http/tickets/get-ticket-allowed-actions'
import { getTicketCabecalho } from '@/http/tickets/get-ticket-cabecalho'
import { getTicketRelatorioCompleto } from '@/http/tickets/get-ticket-relatorio-completo'
import { type TicketReassignPriority } from '@/http/tickets/reassign-ticket'
import { getTicketAttachments } from '@/http/tickets/ticket-attachments'
import { cn } from '@/lib/utils'
import { getApiErrorMessage, isNotFoundError } from '@/utils/error-handlers'

import {
  shouldShowTicketRespostaTab,
  TICKET_DETAIL_BASE_TABS,
  TICKET_RESPOSTA_TAB,
  type TicketDetailTabId,
} from '../ticket-detail.constants'
import styles from '../ticket-detail.module.css'
import { TicketDetailTabChamado } from './ticket-detail-tab-chamado'
import { TicketDetailTabDocumentos } from './ticket-detail-tab-documentos'
import { TicketDetailTabHistorico } from './ticket-detail-tab-historico'
import { TicketDetailTabParecerInterno } from './ticket-detail-tab-parecer-interno'
import { TicketDetailTabRelatorioDemanda } from './ticket-detail-tab-relatorio-demanda'
import { TicketDetailTabResposta } from './ticket-detail-tab-resposta'
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

function formatStatusText(value?: string | null) {
  const status = displayText(value)
  if (status === '—') return status
  return status.replaceAll('_', ' ')
}

function formatReassignPriorityLabel(priority: TicketReassignPriority) {
  if (priority === 'URGENTE') return 'Urgente'
  if (priority === 'ALTA') return 'Alto'
  return 'Rotina'
}

type Props = {
  ticketId: string
}

type TicketWorkflowConfirmableAction =
  | 'FINALIZAR_SEM_ENCAMINHAR'
  | 'ENVIAR_EMAIL'
  | 'BLOQUEAR'
  | 'DESBLOQUEAR'
  | 'ENVIAR_PARA_REVISAO'
  | 'REABRIR_DEMANDA'

export function TicketDetailView({ ticketId }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TicketDetailTabId>('solicitante')
  const [oficioOpen, setOficioOpen] = useState(false)
  const [oficioAttachmentIndex, setOficioAttachmentIndex] = useState(0)
  const [oficioPreviewUrl, setOficioPreviewUrl] = useState<string | null>(null)
  const [relatorioOpen, setRelatorioOpen] = useState(false)
  const [relatorioPreviewUrl, setRelatorioPreviewUrl] = useState<string | null>(
    null,
  )
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [finalizeComment, setFinalizeComment] = useState('')
  const [workflowCommentAction, setWorkflowCommentAction] =
    useState<TicketWorkflowConfirmableAction | null>(null)
  const [workflowComment, setWorkflowComment] = useState('')
  const [reassignOpen, setReassignOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedResponsibleIds, setSelectedResponsibleIds] = useState<
    string[]
  >([])
  const [selectedPriority, setSelectedPriority] =
    useState<TicketReassignPriority | null>(null)
  const [reassignComment, setReassignComment] = useState('')
  const [responsiblePopoverOpen, setResponsiblePopoverOpen] = useState(false)

  const query = useQuery({
    queryKey: ['ticket', ticketId, 'cabecalho'],
    queryFn: () => getTicketCabecalho(ticketId),
  })

  const cab = query.data
  const allowedActionsQuery = useQuery({
    queryKey: ['ticket', ticketId, 'allowed-actions'],
    queryFn: () => getTicketAllowedActions(ticketId),
    retry: false,
  })

  const showRespostaTab = shouldShowTicketRespostaTab(
    allowedActionsQuery.data?.state_id,
    cab?.status,
  )
  const visibleTabs = useMemo(() => {
    if (!showRespostaTab) return TICKET_DETAIL_BASE_TABS
    const idx = TICKET_DETAIL_BASE_TABS.findIndex(
      (tab) => tab.id === 'historico',
    )
    if (idx < 0) return TICKET_DETAIL_BASE_TABS
    return [
      ...TICKET_DETAIL_BASE_TABS.slice(0, idx),
      TICKET_RESPOSTA_TAB,
      ...TICKET_DETAIL_BASE_TABS.slice(idx),
    ]
  }, [showRespostaTab])

  const allowedActionIds = allowedActionsQuery.data?.allowed_action_ids ?? []
  const canFinalizeTicket = allowedActionIds.includes('FINALIZAR_CHAMADO')
  const canReassignTicket = allowedActionIds.includes('REATRIBUIR_CHAMADO')
  const canSendEmail = allowedActionIds.includes('ENVIAR_EMAIL')
  const canSendToReview = allowedActionIds.includes('ENVIAR_PARA_REVISAO')
  const canBlockTicket = allowedActionIds.includes('BLOQUEAR')
  const canUnblockTicket = allowedActionIds.includes('DESBLOQUEAR')
  const canFinalizeWithoutForwarding = allowedActionIds.includes(
    'FINALIZAR_SEM_ENCAMINHAR',
  )
  const canReopenDemand = allowedActionIds.includes('REABRIR_DEMANDA')

  const teamsByRoleQuery = useQuery({
    queryKey: ['teams', 'by-role'],
    queryFn: getTeamsByRole,
    enabled: reassignOpen,
    retry: false,
  })

  const teamMembersByRoleQuery = useQuery({
    queryKey: ['teams', 'members', 'by-role', selectedTeamId || '__none__'],
    queryFn: () =>
      getTeamMembersByRole(
        selectedTeamId ? { team_id: selectedTeamId } : undefined,
      ),
    enabled: reassignOpen && selectedTeamId.length > 0,
    retry: false,
  })

  const finalizeMutation = useMutation({
    mutationFn: (comment: string) =>
      applyTicketWorkflowAction(ticketId, 'FINALIZAR_CHAMADO', {
        comentario: comment,
      }),
    onSuccess: () => {
      toast.success('Demanda finalizada e enviada para revisão.')
      setFinalizeOpen(false)
      setFinalizeComment('')
      setTimeout(() => {
        router.push('/demandas')
      }, 1500)
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const reassignMutation = useMutation({
    mutationFn: () =>
      applyTicketWorkflowAction(ticketId, 'REATRIBUIR_CHAMADO', {
        comentario: reassignComment.trim(),
        reatribuicao: {
          equipe_id: selectedTeamId,
          responsavel_ids: selectedResponsibleIds,
          prioridade: selectedPriority,
          comentario: reassignComment.trim(),
        },
      }),
    onSuccess: () => {
      toast.success('Demanda reatribuída com sucesso.')
      setReassignOpen(false)
      setReassignComment('')
      setTimeout(() => {
        router.push('/demandas')
      }, 1500)
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const workflowActionMutation = useMutation({
    mutationFn: ({
      actionId,
      comentario,
    }: {
      actionId: string
      comentario?: string | null
    }) =>
      applyTicketWorkflowAction(ticketId, actionId, {
        comentario: comentario ?? null,
      }),
    onSuccess: (
      _response: ApplyTicketWorkflowActionOut,
      variables: { actionId: string; comentario?: string | null },
    ) => {
      if (variables.actionId === 'ENVIAR_EMAIL') {
        toast.success('E-mail enviado com sucesso.')
      } else if (variables.actionId === 'ENVIAR_PARA_REVISAO') {
        toast.success('Demanda enviada para revisão com sucesso.')
      } else if (variables.actionId === 'BLOQUEAR') {
        toast.success('Demanda bloqueada com sucesso.')
      } else if (variables.actionId === 'DESBLOQUEAR') {
        toast.success('Demanda desbloqueada com sucesso.')
      } else if (variables.actionId === 'FINALIZAR_SEM_ENCAMINHAR') {
        toast.success('Demanda finalizada sem encaminhamento.')
      } else if (variables.actionId === 'REABRIR_DEMANDA') {
        toast.success('Demanda reaberta com sucesso.')
      } else {
        toast.success('Ação aplicada com sucesso.')
      }
      setWorkflowCommentAction(null)
      setWorkflowComment('')
      setTimeout(() => {
        router.push('/demandas')
      }, 1500)
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

  useEffect(() => {
    if (!reassignOpen) return
    setSelectedTeamId('')
    setSelectedResponsibleIds([])
    setSelectedPriority(null)
    setReassignComment('')
    setResponsiblePopoverOpen(false)
  }, [reassignOpen])

  useEffect(() => {
    if (!reassignOpen || selectedTeamId || teamsByRoleQuery.isLoading) return
    const teams = teamsByRoleQuery.data ?? []
    if (teams.length === 1 && teams[0]) {
      setSelectedTeamId(teams[0].id)
    }
  }, [
    reassignOpen,
    selectedTeamId,
    teamsByRoleQuery.data,
    teamsByRoleQuery.isLoading,
  ])

  useEffect(() => {
    setSelectedResponsibleIds([])
  }, [selectedTeamId])

  useEffect(() => {
    if (showRespostaTab || activeTab !== 'resposta') return
    setActiveTab('solicitante')
  }, [showRespostaTab, activeTab])

  const selectedResponsibleNames = (teamMembersByRoleQuery.data ?? [])
    .filter((member: TeamMemberUserOut) =>
      selectedResponsibleIds.includes(member.user_id),
    )
    .map((member: TeamMemberUserOut) => member.user_name)

  const canSubmitReassignment =
    selectedTeamId.length > 0 &&
    selectedResponsibleIds.length > 0 &&
    reassignComment.trim().length > 0 &&
    !reassignMutation.isPending

  if (query.isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.loading}>Carregando demanda…</p>
        </div>
      </div>
    )
  }

  if (query.isError || !cab) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.error}>
            Não foi possível carregar esta demanda. Tente novamente mais tarde.
          </p>
          <Link
            href="/demandas"
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
                href="/demandas"
                className={styles.backLink}
                aria-label="Voltar para lista de demandas"
              >
                <ChevronLeft size={18} />
              </Link>
              <p className={styles.title} role="heading" aria-level={1}>
                {`Demanda #${cab.internal_number} - ${displayText(cab.tipo_chamado_nome)}`}
              </p>
            </div>
            <span className={styles.statusBadge}>
              {formatStatusText(cab.status).toLocaleUpperCase('pt-BR')}
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
                  Tempo da demanda em aberto:
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
          {canFinalizeTicket ? (
            <button
              type="button"
              className={`${styles.actionSlot} ${styles.actionSecondary}`}
              onClick={() => setFinalizeOpen(true)}
              disabled={finalizeMutation.isPending}
            >
              {finalizeMutation.isPending
                ? 'Finalizando…'
                : 'Finalizar Demanda'}
            </button>
          ) : null}
          {canFinalizeWithoutForwarding ? (
            <button
              type="button"
              className={`${styles.actionSlot} ${styles.actionSecondary}`}
              onClick={() =>
                setWorkflowCommentAction('FINALIZAR_SEM_ENCAMINHAR')
              }
              disabled={workflowActionMutation.isPending}
            >
              {workflowActionMutation.isPending
                ? 'Aplicando ação…'
                : 'Finalizar sem Encaminhar'}
            </button>
          ) : null}
          {canSendEmail ? (
            <button
              type="button"
              className={`${styles.actionSlot} ${styles.actionSecondary}`}
              onClick={() => setWorkflowCommentAction('ENVIAR_EMAIL')}
              disabled={workflowActionMutation.isPending}
            >
              {workflowActionMutation.isPending
                ? 'Aplicando ação…'
                : 'Enviar E-mail'}
            </button>
          ) : null}
          {canSendToReview ? (
            <button
              type="button"
              className={`${styles.actionSlot} ${styles.actionSecondary}`}
              onClick={() => setWorkflowCommentAction('ENVIAR_PARA_REVISAO')}
              disabled={workflowActionMutation.isPending}
            >
              {workflowActionMutation.isPending
                ? 'Aplicando ação…'
                : 'Enviar para Revisão'}
            </button>
          ) : null}
          {canBlockTicket ? (
            <button
              type="button"
              className={`${styles.actionSlot} ${styles.actionSecondary}`}
              onClick={() => setWorkflowCommentAction('BLOQUEAR')}
              disabled={workflowActionMutation.isPending}
            >
              {workflowActionMutation.isPending
                ? 'Aplicando ação…'
                : 'Bloquear'}
            </button>
          ) : null}
          {canUnblockTicket ? (
            <button
              type="button"
              className={`${styles.actionSlot} ${styles.actionSecondary}`}
              onClick={() => setWorkflowCommentAction('DESBLOQUEAR')}
              disabled={workflowActionMutation.isPending}
            >
              {workflowActionMutation.isPending
                ? 'Aplicando ação…'
                : 'Desbloquear'}
            </button>
          ) : null}
          {canReopenDemand ? (
            <button
              type="button"
              className={`${styles.actionSlot} ${styles.actionSecondary}`}
              onClick={() => setWorkflowCommentAction('REABRIR_DEMANDA')}
              disabled={workflowActionMutation.isPending}
            >
              {workflowActionMutation.isPending
                ? 'Aplicando ação…'
                : 'Reabrir Demanda'}
            </button>
          ) : null}
          {canReassignTicket ? (
            <button
              type="button"
              className={`${styles.actionSlot} ${styles.actionPrimary}`}
              onClick={() => setReassignOpen(true)}
            >
              <UserRoundCog size={20} aria-hidden />
              Reatribuir Demanda
            </button>
          ) : null}
        </div>

        <div className={styles.tabsShell}>
          <div
            className={styles.tabBar}
            role="tablist"
            aria-label="Seções da demanda"
          >
            {visibleTabs.map((tab) => {
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
          ) : activeTab === 'resposta' ? (
            <div className={styles.panel} role="tabpanel">
              <TicketDetailTabResposta ticketId={ticketId} />
            </div>
          ) : (
            <div className={styles.panelPlaceholder} role="tabpanel">
              {`Conteúdo da aba "${visibleTabs.find((t) => t.id === activeTab)?.label}" será implementado em seguida.`}
            </div>
          )}
        </div>

        <Dialog
          open={finalizeOpen}
          onOpenChange={(open) => {
            setFinalizeOpen(open)
            if (!open) setFinalizeComment('')
          }}
        >
          <DialogContent className={styles.reassignDialogContent}>
            <div className={styles.reassignDialogInner}>
              <DialogHeader className={styles.reassignDialogHeader}>
                <DialogTitle className={styles.reassignDialogTitle}>
                  Finalizar demanda?
                </DialogTitle>
              </DialogHeader>
              <div className={styles.reassignFields}>
                <div className={styles.reassignField}>
                  <p className={styles.reassignFieldMessage}>
                    O sistema validará os dados obrigatórios e a completude dos
                    serviços. Se estiver tudo correto, o status passará para
                    aguardando revisão.
                  </p>
                </div>
                <div className={styles.reassignField}>
                  <span className={styles.reassignLabel}>Comentário</span>
                  <Textarea
                    value={finalizeComment}
                    onChange={(event) => setFinalizeComment(event.target.value)}
                    placeholder="Digite o comentário da finalização"
                    className={styles.reassignTextarea}
                    disabled={finalizeMutation.isPending}
                  />
                </div>
              </div>
              <DialogFooter className={styles.footerActions}>
                <button
                  type="button"
                  className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
                  onClick={() => setFinalizeOpen(false)}
                  disabled={finalizeMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
                  disabled={
                    finalizeMutation.isPending ||
                    finalizeComment.trim().length === 0
                  }
                  onClick={() =>
                    finalizeMutation.mutate(finalizeComment.trim())
                  }
                >
                  {finalizeMutation.isPending ? 'Finalizando…' : 'Confirmar'}
                </button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={workflowCommentAction !== null}
          onOpenChange={(open) => {
            if (!open) {
              setWorkflowCommentAction(null)
              setWorkflowComment('')
            }
          }}
        >
          <DialogContent className={styles.reassignDialogContent}>
            <div className={styles.reassignDialogInner}>
              <DialogHeader className={styles.reassignDialogHeader}>
                <DialogTitle className={styles.reassignDialogTitle}>
                  {workflowCommentAction === 'FINALIZAR_SEM_ENCAMINHAR'
                    ? 'Finalizar sem encaminhar?'
                    : workflowCommentAction === 'ENVIAR_EMAIL'
                      ? 'Enviar e-mail?'
                      : workflowCommentAction === 'BLOQUEAR'
                        ? 'Bloquear demanda?'
                        : workflowCommentAction === 'DESBLOQUEAR'
                          ? 'Desbloquear demanda?'
                          : workflowCommentAction === 'ENVIAR_PARA_REVISAO'
                            ? 'Enviar para revisão?'
                            : workflowCommentAction === 'REABRIR_DEMANDA'
                              ? 'Reabrir demanda?'
                              : 'Confirmar ação'}
                </DialogTitle>
              </DialogHeader>
              <div className={styles.reassignFields}>
                <div className={styles.reassignField}>
                  <p className={styles.reassignFieldMessage}>
                    {workflowCommentAction === 'FINALIZAR_SEM_ENCAMINHAR'
                      ? 'A demanda será encerrada sem envio de email. Essa ação segue as regras do fluxo configurado para o tipo de demanda.'
                      : workflowCommentAction === 'ENVIAR_EMAIL'
                        ? 'Será disparado o e-mail conforme o fluxo da demanda. Deseja continuar?'
                        : workflowCommentAction === 'BLOQUEAR'
                          ? 'A demanda ficará bloqueada conforme as regras do sistema. Deseja continuar?'
                          : workflowCommentAction === 'DESBLOQUEAR'
                            ? 'A demanda será desbloqueada e seguirá o fluxo configurado. Deseja continuar?'
                            : workflowCommentAction === 'ENVIAR_PARA_REVISAO'
                              ? 'Adicione um comentário para registrar o contexto da revisão.'
                              : workflowCommentAction === 'REABRIR_DEMANDA'
                                ? 'A demanda será reaberta e retornará ao fluxo de trabalho.'
                                : 'A ação será aplicada à demanda.'}
                  </p>
                </div>
                <div className={styles.reassignField}>
                  <span className={styles.reassignLabel}>Comentário</span>
                  <Textarea
                    value={workflowComment}
                    onChange={(event) => setWorkflowComment(event.target.value)}
                    placeholder="Digite o comentário"
                    className={styles.reassignTextarea}
                    disabled={workflowActionMutation.isPending}
                  />
                </div>
              </div>
              <DialogFooter className={styles.footerActions}>
                <button
                  type="button"
                  className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
                  onClick={() => {
                    setWorkflowCommentAction(null)
                    setWorkflowComment('')
                  }}
                  disabled={workflowActionMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
                  disabled={
                    workflowActionMutation.isPending ||
                    workflowComment.trim().length === 0
                  }
                  onClick={() => {
                    if (workflowCommentAction) {
                      workflowActionMutation.mutate({
                        actionId: workflowCommentAction,
                        comentario: workflowComment.trim(),
                      })
                    }
                  }}
                >
                  {workflowActionMutation.isPending
                    ? 'Aplicando ação…'
                    : 'Confirmar'}
                </button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

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
                  Não há anexos nesta demanda.
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
                    ? 'Relatório não disponível para esta demanda.'
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

        <Dialog
          open={reassignOpen}
          onOpenChange={(open) => {
            setReassignOpen(open)
            if (!open) setReassignComment('')
          }}
        >
          <DialogContent
            className={styles.reassignDialogContent}
            aria-describedby={undefined}
          >
            <div className={styles.reassignDialogInner}>
              <DialogHeader className={styles.reassignDialogHeader}>
                <DialogTitle className={styles.reassignDialogTitle}>
                  Reatribuir demanda
                </DialogTitle>
              </DialogHeader>

              <div className={styles.reassignFields}>
                <div className={styles.reassignField}>
                  <span className={styles.reassignLabel}>Equipe</span>
                  <Select
                    value={selectedTeamId || undefined}
                    onValueChange={setSelectedTeamId}
                    disabled={
                      teamsByRoleQuery.isLoading || reassignMutation.isPending
                    }
                  >
                    <SelectTrigger
                      className={`h-11 ${styles.detailSelectTrigger}`}
                    >
                      <SelectValue
                        placeholder={
                          teamsByRoleQuery.isLoading
                            ? 'Carregando…'
                            : 'Selecione'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className={styles.detailSelectContent}>
                      {(teamsByRoleQuery.data ?? []).map(
                        (team: TeamIdNameOut) => (
                          <SelectItem
                            key={team.id}
                            value={team.id}
                            className={styles.detailSelectItem}
                          >
                            {team.name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  {teamsByRoleQuery.isError ? (
                    <p className={styles.reassignFieldMessageError}>
                      {getApiErrorMessage(teamsByRoleQuery.error)}
                    </p>
                  ) : !teamsByRoleQuery.isLoading &&
                    (teamsByRoleQuery.data ?? []).length === 0 ? (
                    <p className={styles.reassignFieldMessage}>
                      Nenhuma equipe disponível para seu perfil.
                    </p>
                  ) : null}
                </div>

                <div className={styles.reassignField}>
                  <span className={styles.reassignLabel}>Responsável</span>
                  <Popover
                    open={responsiblePopoverOpen}
                    onOpenChange={setResponsiblePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={styles.reassignMultiTrigger}
                        disabled={
                          !selectedTeamId ||
                          teamMembersByRoleQuery.isLoading ||
                          reassignMutation.isPending
                        }
                      >
                        <span
                          className={
                            selectedResponsibleNames.length > 0
                              ? styles.reassignMultiValue
                              : styles.reassignMultiPlaceholder
                          }
                        >
                          {selectedResponsibleNames.length > 0
                            ? selectedResponsibleNames.join(', ')
                            : teamMembersByRoleQuery.isLoading
                              ? 'Carregando…'
                              : 'Selecione'}
                        </span>
                        <ChevronDown size={20} aria-hidden />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className={styles.reassignPopoverContent}
                    >
                      {teamMembersByRoleQuery.isLoading ? (
                        <p className={styles.reassignPopoverMessage}>
                          Carregando responsáveis…
                        </p>
                      ) : teamMembersByRoleQuery.isError ? (
                        <p
                          className={`${styles.reassignPopoverMessage} ${styles.reassignPopoverError}`}
                        >
                          {getApiErrorMessage(teamMembersByRoleQuery.error)}
                        </p>
                      ) : (teamMembersByRoleQuery.data ?? []).length === 0 ? (
                        <p className={styles.reassignPopoverMessage}>
                          Nenhum responsável disponível.
                        </p>
                      ) : (
                        <div className={styles.reassignOptions}>
                          {(teamMembersByRoleQuery.data ?? []).map(
                            (member: TeamMemberUserOut) => {
                              const checked = selectedResponsibleIds.includes(
                                member.user_id,
                              )
                              return (
                                <label
                                  key={member.user_id}
                                  className={styles.reassignOption}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(value) => {
                                      setSelectedResponsibleIds((prev) => {
                                        const enabled = value === true
                                        if (enabled) {
                                          return prev.includes(member.user_id)
                                            ? prev
                                            : [...prev, member.user_id]
                                        }
                                        return prev.filter(
                                          (id) => id !== member.user_id,
                                        )
                                      })
                                    }}
                                    disabled={reassignMutation.isPending}
                                  />
                                  <span>{member.user_name}</span>
                                </label>
                              )
                            },
                          )}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                <div className={styles.reassignPriorityWrap}>
                  <span className={styles.reassignLabel}>
                    Definir prioridade
                  </span>
                  <div className={styles.reassignPriorityRow}>
                    {(['URGENTE', 'ALTA', 'ROTINA'] as const).map(
                      (priority) => {
                        const active = selectedPriority === priority
                        return (
                          <button
                            key={priority}
                            type="button"
                            className={`${styles.reassignPriorityBtn} ${active ? styles.reassignPriorityBtnActive : ''}`}
                            onClick={() =>
                              setSelectedPriority((prev) =>
                                prev === priority ? null : priority,
                              )
                            }
                            disabled={reassignMutation.isPending}
                          >
                            {formatReassignPriorityLabel(priority)}
                          </button>
                        )
                      },
                    )}
                  </div>
                </div>

                <div className={styles.reassignField}>
                  <span className={styles.reassignLabel}>Comentário</span>
                  <Textarea
                    value={reassignComment}
                    onChange={(event) => setReassignComment(event.target.value)}
                    placeholder="Digite o comentário da reatribuição"
                    className={styles.reassignTextarea}
                    disabled={reassignMutation.isPending}
                  />
                </div>
              </div>

              <div className={styles.reassignSubmitRow}>
                <button
                  type="button"
                  className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
                  onClick={() => reassignMutation.mutate()}
                  disabled={!canSubmitReassignment}
                >
                  {reassignMutation.isPending
                    ? 'Reatribuindo…'
                    : 'Reatribuir Demanda'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
