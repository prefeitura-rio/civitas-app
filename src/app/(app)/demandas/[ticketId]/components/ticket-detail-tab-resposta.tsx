'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bold, Italic, Link2, Paperclip, Underline, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import tcStyles from '@/app/(app)/demandas/criar/ticket-create/ticket-create-form.module.css'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getStandardizedResponseById,
  listStandardizedResponses,
} from '@/http/standardized-responses/standardized-responses'
import { fetchTicketServiceAttachmentBlob } from '@/http/tickets/download-ticket-attachment'
import { getTicketAllServicoAnexos } from '@/http/tickets/get-ticket-all-servico-anexos'
import { getTicketServicoAnexos } from '@/http/tickets/get-ticket-servico-anexos'
import {
  getTicketServicosIndice,
  type TicketServicoIndiceItem,
} from '@/http/tickets/get-ticket-servicos-indice'
import { getTicketServiceAttachmentPlaybackUrl } from '@/http/tickets/ticket-attachments'
import {
  getTicketResposta,
  putTicketResposta,
  type TicketAttachmentWithPlaybackOut,
} from '@/http/tickets/ticket-resposta'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/utils/error-handlers'

import responderStyles from '../../caixa-entrada/responder/[emailId]/components/responder-email-view.module.css'
import detailStyles from '../ticket-detail.module.css'
import { usesGcsSignedUrlAttachment } from './ticket-gcs-upload'

const EMPTY_POP_VALUE = '__civitas_pop_empty__'
const EMPTY_SERVICE_VALUE = '__civitas_service_empty__'
const EMPTY_ANEXO_VALUE = '__civitas_anexo_empty__'
/** Validade do link ao abrir vídeo/ZIP na aba Resposta (15 min). */
const RESPOSTA_PLAYBACK_EXPIRATION_MINUTES = 15

type RespostaAnexoSelecionado = TicketAttachmentWithPlaybackOut & {
  servico_label: string
}

function respostaAnexoServicoLabel(
  indice: TicketServicoIndiceItem[] | undefined,
  serviceType: string | null | undefined,
  serviceId: string | null | undefined,
) {
  if (serviceType && serviceId) {
    const row = indice?.find(
      (s) => s.service_type === serviceType && s.service_id === serviceId,
    )
    if (row) return row.label
  }
  if (serviceType && String(serviceType).trim() !== '') {
    return String(serviceType).replaceAll('_', ' ')
  }
  return 'Serviço'
}

function toRespostaAnexosSelecionados(
  items: TicketAttachmentWithPlaybackOut[],
  indice: TicketServicoIndiceItem[] | undefined,
): RespostaAnexoSelecionado[] {
  return items.map((a) => ({
    ...a,
    servico_label: respostaAnexoServicoLabel(
      indice,
      a.service_type,
      a.service_id,
    ),
  }))
}

function formatBytes(n: number) {
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function formatDateTimePt(iso?: string | null) {
  if (iso == null || iso === '') return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

type Props = {
  ticketId: string
}

const RESPOSTA_QUERY_KEY = (ticketId: string) =>
  ['ticket', ticketId, 'resposta'] as const

export function TicketDetailTabResposta({ ticketId }: Props) {
  const queryClient = useQueryClient()
  const [selectedPopId, setSelectedPopId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [dirty, setDirty] = useState(false)
  const [selectedServiceValue, setSelectedServiceValue] =
    useState(EMPTY_SERVICE_VALUE)
  const [selectedAnexoId, setSelectedAnexoId] = useState(EMPTY_ANEXO_VALUE)
  const [attachmentsResposta, setAnexosResposta] = useState<
    RespostaAnexoSelecionado[]
  >([])
  const [isSelectingAllAnexos, setIsSelectingAllAnexos] = useState(false)
  const [viewingAnexoId, setViewingAnexoId] = useState<string | null>(null)

  const respostaQuery = useQuery({
    queryKey: RESPOSTA_QUERY_KEY(ticketId),
    queryFn: () => getTicketResposta(ticketId),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      putTicketResposta(ticketId, {
        html_content: replyBody,
        service_attachment_ids: attachmentsResposta.map((a) => a.id),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(RESPOSTA_QUERY_KEY(ticketId), data)
      queryClient
        .invalidateQueries({ queryKey: ['ticket', ticketId] })
        .catch(() => {})
      queryClient
        .invalidateQueries({
          queryKey: ['ticket', ticketId, 'allowed-actions'],
        })
        .catch(() => {})
      queryClient.invalidateQueries({ queryKey: ['tickets'] }).catch(() => {})
      setDirty(false)
      toast.success('Resposta gravada.')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const { data: popsRes, isLoading: popsLoading } = useQuery({
    queryKey: [
      'standardized-responses',
      'list',
      { isActive: true, category: 'RESPOSTAS_POSITIVAS' as const },
    ],
    queryFn: async () => {
      const r = await listStandardizedResponses({
        isActive: true,
        category: 'RESPOSTAS_POSITIVAS',
      })
      return r.data
    },
  })

  const pops = popsRes?.items ?? []

  const servicosIndiceQuery = useQuery({
    queryKey: ['ticket', ticketId, 'servicos-indice'],
    queryFn: () => getTicketServicosIndice(ticketId),
    retry: false,
  })

  const selectedServico = useMemo(() => {
    if (selectedServiceValue === EMPTY_SERVICE_VALUE) return null
    const item = servicosIndiceQuery.data?.find(
      (s) => `${s.service_type}|${s.service_id}` === selectedServiceValue,
    )
    return item ?? null
  }, [selectedServiceValue, servicosIndiceQuery.data])

  const attachmentsServicoQuery = useQuery({
    queryKey: [
      'ticket',
      ticketId,
      'servico-attachments',
      selectedServico?.service_type,
      selectedServico?.service_id,
    ],
    queryFn: () =>
      getTicketServicoAnexos(
        ticketId,
        selectedServico!.service_type,
        selectedServico!.service_id,
      ),
    enabled: Boolean(selectedServico),
    retry: false,
  })

  useEffect(() => {
    setSelectedAnexoId(EMPTY_ANEXO_VALUE)
  }, [selectedServiceValue])

  useEffect(() => {
    if (servicosIndiceQuery.isError) {
      toast.error('Não foi possível carregar a lista de serviços do chamado.')
    }
  }, [servicosIndiceQuery.isError])

  useEffect(() => {
    if (attachmentsServicoQuery.isError) {
      toast.error('Não foi possível carregar os attachments deste serviço.')
    }
  }, [attachmentsServicoQuery.isError])

  const handleIncluirAnexo = useCallback(() => {
    if (!selectedServico) return
    if (selectedAnexoId === EMPTY_ANEXO_VALUE) return
    const lista = attachmentsServicoQuery.data ?? []
    const att = lista.find((a) => a.id === selectedAnexoId)
    if (!att) return
    if (attachmentsResposta.some((a) => a.id === att.id)) {
      toast.info('Este anexo já está na lista.')
      return
    }
    setAnexosResposta((prev) => [
      ...prev,
      { ...att, servico_label: selectedServico.label },
    ])
    setSelectedAnexoId(EMPTY_ANEXO_VALUE)
    setDirty(true)
  }, [
    attachmentsResposta,
    attachmentsServicoQuery.data,
    selectedAnexoId,
    selectedServico,
  ])

  const handleRemoverAnexo = useCallback((id: string) => {
    setAnexosResposta((prev) => prev.filter((a) => a.id !== id))
    setDirty(true)
  }, [])

  const handleAbrirAnexo = useCallback(
    async (att: RespostaAnexoSelecionado) => {
      if (usesGcsSignedUrlAttachment(att)) {
        try {
          setViewingAnexoId(att.id)
          const { signed_url: signedUrl } =
            await getTicketServiceAttachmentPlaybackUrl(
              ticketId,
              att.id,
              RESPOSTA_PLAYBACK_EXPIRATION_MINUTES,
            )
          window.open(signedUrl, '_blank', 'noopener,noreferrer')
        } catch {
          toast.error('Não foi possível abrir o anexo.')
        } finally {
          setViewingAnexoId(null)
        }
        return
      }

      try {
        setViewingAnexoId(att.id)
        const { blob, contentType } = await fetchTicketServiceAttachmentBlob(
          ticketId,
          att.id,
        )
        const previewBlob = new Blob([blob], { type: contentType })
        const previewUrl = URL.createObjectURL(previewBlob)
        window.open(previewUrl, '_blank', 'noopener,noreferrer')
        window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000)
      } catch {
        toast.error('Não foi possível abrir o anexo.')
      } finally {
        setViewingAnexoId(null)
      }
    },
    [ticketId],
  )

  const handleSelecionarTodosAnexos = useCallback(async () => {
    setIsSelectingAllAnexos(true)
    try {
      const todos = await getTicketAllServicoAnexos(ticketId)
      const existingIds = new Set(attachmentsResposta.map((a) => a.id))
      const novos = toRespostaAnexosSelecionados(
        todos,
        servicosIndiceQuery.data,
      ).filter((a) => !existingIds.has(a.id))

      if (novos.length === 0) {
        if (todos.length === 0) {
          toast.info('Nenhum anexo encontrado nos serviços deste chamado.')
        } else {
          toast.info('Todos os attachments já estão na lista.')
        }
        return
      }

      setAnexosResposta((prev) => [...prev, ...novos])
      setDirty(true)
      toast.success(
        novos.length === 1
          ? '1 anexo incluído na lista.'
          : `${novos.length} attachments incluídos na lista.`,
      )
    } catch {
      toast.error('Não foi possível carregar os attachments dos serviços.')
    } finally {
      setIsSelectingAllAnexos(false)
    }
  }, [ticketId, servicosIndiceQuery.data, attachmentsResposta])

  useEffect(() => {
    if (respostaQuery.isLoading || respostaQuery.isError || dirty) return
    const initialBody = respostaQuery.data?.html_content ?? ''
    setReplyBody(initialBody)
  }, [
    respostaQuery.isLoading,
    respostaQuery.isError,
    respostaQuery.data?.html_content,
    dirty,
  ])

  useEffect(() => {
    if (respostaQuery.isLoading || respostaQuery.isError || dirty) return
    const items = respostaQuery.data?.service_attachments ?? []
    setAnexosResposta(
      toRespostaAnexosSelecionados(items, servicosIndiceQuery.data),
    )
  }, [
    respostaQuery.isLoading,
    respostaQuery.isError,
    respostaQuery.data,
    servicosIndiceQuery.data,
    dirty,
  ])

  const {
    data: popDetailRes,
    isFetching: popDetailLoading,
    isError: popDetailError,
  } = useQuery({
    queryKey: ['standardized-response', selectedPopId],
    queryFn: async () => {
      const r = await getStandardizedResponseById(selectedPopId!)
      return r.data
    },
    enabled: Boolean(selectedPopId),
    retry: false,
  })

  useEffect(() => {
    if (popDetailError) {
      toast.error('Não foi possível carregar a resposta padronizada.')
    }
  }, [popDetailError])

  useEffect(() => {
    if (!selectedPopId) {
      return
    }
    if (popDetailRes?.body != null) {
      // Regra: selecionar POP preenche automaticamente o editor.
      setReplyBody(popDetailRes.body)
      setDirty(true)
    }
  }, [selectedPopId, popDetailRes?.body])

  const canSave = replyBody.trim().length > 0 && !saveMutation.isPending

  const handleSave = useCallback(() => {
    if (!replyBody.trim()) return
    saveMutation.mutate()
  }, [replyBody, saveMutation])

  if (respostaQuery.isLoading) {
    return <p className={detailStyles.loading}>Carregando resposta…</p>
  }

  if (respostaQuery.isError) {
    return (
      <p className={detailStyles.error}>
        Não foi possível carregar a resposta.
      </p>
    )
  }

  return (
    <div className={cn(responderStyles.root, detailStyles.respostaEmbedRoot)}>
      <div className={responderStyles.main}>
        <div className={detailStyles.respostaBody}>
          <div className={`${responderStyles.popField} space-y-1.5`}>
            <Label className={tcStyles.fieldLabel}>POP de respostas</Label>
            <Select
              value={selectedPopId ?? EMPTY_POP_VALUE}
              onValueChange={(v) =>
                setSelectedPopId(v === EMPTY_POP_VALUE ? null : v)
              }
              disabled={popsLoading}
            >
              <SelectTrigger
                className={cn(
                  tcStyles.inputBg,
                  responderStyles.popSelectTrigger,
                )}
                aria-label="Resposta padronizada (POP)"
              >
                <SelectValue placeholder="Selecione um pop" />
              </SelectTrigger>
              <SelectContent className={tcStyles.selectContentForm}>
                <SelectItem
                  value={EMPTY_POP_VALUE}
                  className={tcStyles.selectItemForm}
                >
                  Selecione um pop
                </SelectItem>
                {pops.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    className={tcStyles.selectItemForm}
                  >
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={detailStyles.respostaAnexosBlock}>
            <div className={detailStyles.respostaAnexosHeader}>
              <div className="min-w-0 space-y-1.5">
                <Label className={tcStyles.fieldLabel}>
                  Anexos de serviços (para enviar com a resposta)
                </Label>
                <p className={detailStyles.respostaAnexosHint}>
                  Escolha o serviço do chamado, depois um anexo, e inclua na
                  lista. A ordem na lista é a ordem enviada ao gravar a
                  resposta.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                disabled={isSelectingAllAnexos}
                onClick={handleSelecionarTodosAnexos}
              >
                {isSelectingAllAnexos
                  ? 'Carregando attachments…'
                  : 'Selecionar todos os attachments'}
              </Button>
            </div>

            {servicosIndiceQuery.isError ? (
              <p className={detailStyles.error}>
                Não foi possível carregar os serviços deste chamado.
              </p>
            ) : servicosIndiceQuery.isSuccess &&
              (servicosIndiceQuery.data?.length ?? 0) === 0 ? (
              <p className={detailStyles.respostaAnexosHint}>
                Não há serviços listados para este chamado.
              </p>
            ) : (
              <div className={detailStyles.respostaAnexosFields}>
                <div className="space-y-1.5">
                  <Label className={tcStyles.fieldLabel}>Serviço</Label>
                  <Select
                    value={selectedServiceValue}
                    onValueChange={setSelectedServiceValue}
                    disabled={servicosIndiceQuery.isLoading}
                  >
                    <SelectTrigger
                      className={cn(
                        tcStyles.inputBg,
                        responderStyles.popSelectTrigger,
                      )}
                      aria-label="Serviço do chamado"
                    >
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent className={tcStyles.selectContentForm}>
                      <SelectItem
                        value={EMPTY_SERVICE_VALUE}
                        className={tcStyles.selectItemForm}
                      >
                        Selecione um serviço
                      </SelectItem>
                      {(servicosIndiceQuery.data ?? []).map((s) => (
                        <SelectItem
                          key={`${s.service_type}-${s.service_id}`}
                          value={`${s.service_type}|${s.service_id}`}
                          className={tcStyles.selectItemForm}
                        >
                          {s.index}. {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className={tcStyles.fieldLabel}>
                    Anexo do serviço
                  </Label>
                  <Select
                    value={selectedAnexoId}
                    onValueChange={setSelectedAnexoId}
                    disabled={
                      !selectedServico ||
                      attachmentsServicoQuery.isLoading ||
                      attachmentsServicoQuery.isError
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        tcStyles.inputBg,
                        responderStyles.popSelectTrigger,
                      )}
                      aria-label="Anexo do serviço selecionado"
                    >
                      <SelectValue placeholder="Selecione um anexo" />
                    </SelectTrigger>
                    <SelectContent className={tcStyles.selectContentForm}>
                      <SelectItem
                        value={EMPTY_ANEXO_VALUE}
                        className={tcStyles.selectItemForm}
                      >
                        Selecione um anexo
                      </SelectItem>
                      {(attachmentsServicoQuery.data ?? []).map((a) => (
                        <SelectItem
                          key={a.id}
                          value={a.id}
                          className={tcStyles.selectItemForm}
                        >
                          {a.filename}
                          {a.size_bytes != null
                            ? ` · ${formatBytes(a.size_bytes)}`
                            : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0"
                  disabled={
                    !selectedServico ||
                    selectedAnexoId === EMPTY_ANEXO_VALUE ||
                    attachmentsServicoQuery.isLoading
                  }
                  onClick={handleIncluirAnexo}
                >
                  Incluir anexo
                </Button>
              </div>
            )}

            {selectedServico &&
              !attachmentsServicoQuery.isLoading &&
              !attachmentsServicoQuery.isError &&
              (attachmentsServicoQuery.data?.length ?? 0) === 0 && (
                <p className={detailStyles.respostaAnexosHint}>
                  Este serviço ainda não tem attachments.
                </p>
              )}

            {attachmentsResposta.length > 0 && (
              <div className="space-y-1.5">
                <Label className={tcStyles.fieldLabel}>
                  Anexos incluídos ({attachmentsResposta.length})
                </Label>
                <ul className={detailStyles.respostaAnexosLista}>
                  {attachmentsResposta.map((a) => (
                    <li
                      key={a.id}
                      className={detailStyles.respostaAnexosListaItem}
                    >
                      <div className={detailStyles.respostaAnexosListaMeta}>
                        {usesGcsSignedUrlAttachment(a) ? (
                          <button
                            type="button"
                            className={detailStyles.respostaAnexosListaNomeLink}
                            disabled={viewingAnexoId === a.id}
                            onClick={() => {
                              handleAbrirAnexo(a).catch(() => {})
                            }}
                          >
                            {a.filename}
                          </button>
                        ) : a.playback?.signed_url?.trim() ? (
                          <a
                            href={a.playback.signed_url.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={detailStyles.respostaAnexosListaNomeLink}
                          >
                            {a.filename}
                          </a>
                        ) : (
                          <button
                            type="button"
                            className={detailStyles.respostaAnexosListaNomeLink}
                            disabled={viewingAnexoId === a.id}
                            onClick={() => {
                              handleAbrirAnexo(a).catch(() => {})
                            }}
                          >
                            {a.filename}
                          </button>
                        )}
                        <span className={detailStyles.respostaAnexosListaSub}>
                          {a.servico_label}
                          {' · '}
                          {formatBytes(a.size_bytes)}
                          {' · '}
                          {formatDateTimePt(a.created_at)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--td-muted)] transition-colors hover:bg-[var(--td-badge-bg)] hover:text-[var(--td-text)]"
                        aria-label={`Remover ${a.filename}`}
                        onClick={() => handleRemoverAnexo(a.id)}
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={responderStyles.editorWrap}>
            <div className={responderStyles.toolbar} aria-hidden>
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Underline size={16} />
              </button>
              <span className={responderStyles.toolbarDivider} />
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Link2 size={16} />
              </button>
              <span className={detailStyles.respostaToolbarSpacer} />
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Paperclip size={16} />
              </button>
            </div>
            <textarea
              className={responderStyles.textarea}
              value={replyBody}
              onChange={(e) => {
                setReplyBody(e.target.value)
                setDirty(true)
              }}
              placeholder={
                popDetailLoading && selectedPopId
                  ? 'Carregando texto do POP…'
                  : 'Digite sua resposta ou selecione um POP acima'
              }
              disabled={
                saveMutation.isPending ||
                (popDetailLoading && Boolean(selectedPopId))
              }
              spellCheck
            />
          </div>
        </div>

        <div className={responderStyles.footer}>
          <button
            type="button"
            className={responderStyles.btnSend}
            disabled={!canSave}
            title={
              !replyBody.trim()
                ? 'Digite ou carregue o texto da resposta'
                : undefined
            }
            onClick={handleSave}
          >
            {saveMutation.isPending ? 'Gravando…' : 'Gravar resposta'}
          </button>
        </div>
      </div>
    </div>
  )
}
