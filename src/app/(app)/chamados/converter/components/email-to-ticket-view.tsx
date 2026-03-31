'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  Mail,
  Pencil,
  Phone,
  Plus,
  Square,
  SquareCheck,
  Trash,
  Upload,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { type EmailOut, getEmailById } from '@/http/emails/get-email'
import { markEmailAsAguardandoResposta } from '@/http/emails/mark-email-aguardando-resposta'
import { getFirstFormErrorMessage } from '@/utils/form-errors'
import { maskDigitsOnly, maskPhoneBR } from '@/utils/string-formatters'

import { CorrelataListForm } from '../../criar/components/services/correlata-list-form'
import { ServiceModal } from '../../criar/components/services/service-modal'
import { DataBaseDatePicker } from '../../criar/components/shared/data-base-date-picker'
import { useTicketCreateController } from '../../criar/hooks/use-create-controller'
import type { OpenServiceKey } from '../../criar/ticket-create/ticket-create.constant'
import {
  SERVICE_CONFIG,
  TICKET_CREATE_STRING_LIMITS as L,
} from '../../criar/ticket-create/ticket-create.constant'
import { useAttachmentPreviewUrl } from '../hooks/use-attachment-preview-url'
import { downloadEmailAttachmentAsFile } from '../utils/download-email-attachment-file'
import styles from './email-to-ticket-view.module.css'

function fileSelectionKey(file: File) {
  return `${file.name}|${file.size}|${file.lastModified}`
}

function resolveEmailDate(email: EmailOut): Date | null {
  if (email.date) {
    const d = new Date(email.date)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (email.internal_date != null) {
    return new Date(email.internal_date)
  }
  return null
}

function formatEmailMetaDate(email: EmailOut): string {
  const d = resolveEmailDate(email)
  if (!d) return '—'
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

const SERVICE_ORDER: Exclude<OpenServiceKey, null>[] = [
  'busca_por_placa',
  'busca_por_radar',
  'cerco_eletronico',
  'busca_por_imagem',
  'placas_correlatas',
  'placas_conjuntas',
  'reserva_de_imagem',
  'analise_de_imagem',
  'outros',
]

function nullIfEmpty(value?: string | null) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function FieldStringError({
  value,
  max,
  message,
}: {
  value: string | null | undefined
  max: number
  message?: string
}) {
  if ((value ?? '').length > max) {
    return (
      <p className="text-xs text-destructive">Máximo de {max} caracteres</p>
    )
  }
  if (message) {
    return <p className="text-xs text-destructive">{message}</p>
  }
  return null
}

function ConverterPanelSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={styles.panelSection}>
      <div className={styles.panelSectionHeader}>
        <span className={styles.panelSectionTitle}>{title}</span>
        <button
          type="button"
          className={styles.sectionToggleBtn}
          onClick={onToggle}
          aria-label={`Alternar seção ${title}`}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
      {isOpen && <div className={styles.panelSectionInner}>{children}</div>}
    </div>
  )
}

function CompactServiceList<T extends { id: string }>({
  label,
  fields,
  onRemove,
  onEdit,
  renderRow,
  disabled = false,
  openModalDisabled,
}: {
  label: string
  fields: T[]
  onRemove: (index: number) => void
  onEdit?: (index: number) => void
  renderRow: (index: number) => React.ReactNode
  disabled?: boolean
  openModalDisabled?: boolean
}) {
  if (fields.length === 0) return null

  const isCompact = onEdit != null
  const compactOpenDisabled = openModalDisabled ?? disabled

  return (
    <div className={styles.listCard}>
      <div className={styles.listHeader}>
        <p className="text-sm font-medium text-[var(--tc-text)]">{label}</p>
        <p className="text-xs text-muted-foreground">
          {fields.length} item(ns)
        </p>
      </div>

      <div className={styles.serviceItemList}>
        {fields.map((f, idx) => (
          <div
            key={f.id}
            className={
              isCompact
                ? styles.serviceItemBadgeCard
                : styles.serviceItemFormCard
            }
          >
            {isCompact ? (
              <>
                <button
                  type="button"
                  className={styles.serviceItemBadgeButton}
                  onClick={() => onEdit?.(idx)}
                  disabled={compactOpenDisabled}
                  title="Abrir para editar"
                >
                  <span className={styles.serviceItemBadge}>
                    {label} · Item {idx + 1}
                  </span>
                  <Pencil className={styles.serviceItemBadgeIcon} />
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  className={styles.serviceItemDeleteBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(idx)
                  }}
                  disabled={disabled}
                  title="Remover"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="mb-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onRemove(idx)}
                    disabled={disabled}
                    title="Remover"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {renderRow(idx)}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmailToTicketView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const emailId = searchParams.get('email_id')?.trim() || null

  const vm = useTicketCreateController()
  const [activeSubmit, setActiveSubmit] = useState<
    'save' | 'save-and-new' | null
  >(null)
  const [currentAttachment, setCurrentAttachment] = useState(0)
  const [emailInfoCollapsed, setEmailInfoCollapsed] = useState(false)
  const [emailAttachmentSelectedIds, setEmailAttachmentSelectedIds] = useState<
    Set<number>
  >(() => new Set())
  const [manualFileSelected, setManualFileSelected] = useState<
    Record<string, boolean>
  >({})

  const {
    data: emailResponse,
    isLoading: emailLoading,
    isError: emailError,
  } = useQuery({
    queryKey: ['email-detail', emailId],
    queryFn: () => getEmailById(emailId!),
    enabled: Boolean(emailId),
  })

  const email = emailResponse?.data

  useEffect(() => {
    if (!emailId) return

    let cancelled = false

    markEmailAsAguardandoResposta(emailId)
      .then(() => {
        if (cancelled) return
        queryClient.invalidateQueries({ queryKey: ['emails-inbox-nao-lidos'] })
        queryClient.invalidateQueries({
          queryKey: ['emails-inbox-aguardando-resposta'],
        })
        queryClient.invalidateQueries({ queryKey: ['email-detail', emailId] })
      })
      .catch(() => {
        if (cancelled) return
        toast.error(
          'Não foi possível marcar o e-mail como aguardando resposta.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [emailId, queryClient])

  useEffect(() => {
    if (!vm.isLoading) setActiveSubmit(null)
  }, [vm.isLoading])

  const associarChamadoId = vm.watch('associar_chamado_id')
  const isAssociarConvertMode = Boolean(nullIfEmpty(associarChamadoId))
  const fieldDisabled = isAssociarConvertMode || vm.isLoading
  const attachmentDisabled =
    vm.isConvertingToConventional ||
    vm.isApplyingAssociatedTicket ||
    (!isAssociarConvertMode && vm.isLoading)

  useEffect(() => {
    if (!email) return
    const nome = email.from_name?.trim() || email.from_address?.trim() || ''
    vm.setValue('requisitante.requisitante_nome', nome)
    vm.setValue(
      'requisitante.requisitante_email',
      email.from_address?.trim() || '',
    )
    const subj = email.subject?.trim() || ''
    const body = (email.body_preview || email.snippet || '').trim()
    vm.setValue('comentario_inicial', subj ? `${subj}\n\n${body}` : body)
  }, [email, vm.setValue])

  const attachments = email?.attachments ?? []

  useEffect(() => {
    setCurrentAttachment(0)
    setEmailAttachmentSelectedIds(new Set())
  }, [emailId])

  useEffect(() => {
    if (vm.files.length === 0) setManualFileSelected({})
  }, [vm.files.length])

  useEffect(() => {
    if (attachments.length === 0) {
      setCurrentAttachment(0)
      return
    }
    setCurrentAttachment((i) => Math.min(i, attachments.length - 1))
  }, [attachments.length])

  const currentAttachmentItem = attachments[currentAttachment]
  const { url: attachmentPreviewUrl, loading: attachmentPreviewLoading } =
    useAttachmentPreviewUrl(currentAttachmentItem, emailId)

  const emailDisplay = useMemo(() => {
    if (!email) return null
    const senderName =
      email.from_name?.trim() || email.from_address?.trim() || '—'
    return {
      subject: email.subject?.trim() || 'Sem assunto',
      senderName,
      senderEmail: email.from_address?.trim() || '',
      body: (email.body_preview || email.snippet || '').trim() || '—',
      date: formatEmailMetaDate(email),
      avatarChar: senderName.charAt(0).toUpperCase() || '?',
    }
  }, [email])

  const initialBuscaPorPlaca =
    vm.serviceModalOpen === 'busca_por_placa' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().busca_por_placa?.[vm.serviceModalEditIndex]
      : undefined

  const initialBuscaPorRadar =
    vm.serviceModalOpen === 'busca_por_radar' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().busca_por_radar?.[vm.serviceModalEditIndex]
      : undefined

  const initialCerco =
    vm.serviceModalOpen === 'cerco_eletronico' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().cerco_eletronico?.[vm.serviceModalEditIndex]
      : undefined

  const initialBuscaPorImagem =
    vm.serviceModalOpen === 'busca_por_imagem' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().busca_por_imagem?.[vm.serviceModalEditIndex]
      : undefined

  const initialPlacasCorrelatas =
    vm.serviceModalOpen === 'placas_correlatas' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().placas_correlatas?.[vm.serviceModalEditIndex]
      : undefined

  const initialPlacasConjuntas =
    vm.serviceModalOpen === 'placas_conjuntas' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().placas_conjuntas?.[vm.serviceModalEditIndex]
      : undefined

  const initialReservaImagem =
    vm.serviceModalOpen === 'reserva_de_imagem' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().reserva_de_imagem?.[vm.serviceModalEditIndex]
      : undefined

  const initialAnaliseImagem =
    vm.serviceModalOpen === 'analise_de_imagem' &&
    vm.serviceModalEditIndex !== null
      ? vm.getValues().analise_de_imagem?.[vm.serviceModalEditIndex]
      : undefined

  const initialOutros =
    vm.serviceModalOpen === 'outros' && vm.serviceModalEditIndex !== null
      ? vm.getValues().outros?.[vm.serviceModalEditIndex]
      : undefined

  const isManualFileIncluded = useCallback(
    (file: File) => manualFileSelected[fileSelectionKey(file)] !== false,
    [manualFileSelected],
  )

  const toggleManualFileSelection = useCallback((file: File) => {
    const key = fileSelectionKey(file)
    setManualFileSelected((prev) => {
      const currentlyOn = prev[key] !== false
      if (currentlyOn) return { ...prev, [key]: false }
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const toggleEmailAttachmentSelection = useCallback((attachmentId: number) => {
    setEmailAttachmentSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(attachmentId)) next.delete(attachmentId)
      else next.add(attachmentId)
      return next
    })
  }, [])

  const buildFilesForTicketSubmit = useCallback(async (): Promise<File[]> => {
    const manual = vm.files.filter((f) => isManualFileIncluded(f))
    if (!emailId) return manual

    const selectedEmail = attachments.filter((a) =>
      emailAttachmentSelectedIds.has(a.id),
    )
    if (selectedEmail.length === 0) return manual

    try {
      const fromEmail = await Promise.all(
        selectedEmail.map((a) => downloadEmailAttachmentAsFile(emailId, a)),
      )
      return [...manual, ...fromEmail]
    } catch {
      toast.error('Não foi possível baixar um ou mais anexos do e-mail.')
      throw new Error('Falha ao preparar anexos do e-mail')
    }
  }, [
    attachments,
    emailAttachmentSelectedIds,
    emailId,
    isManualFileIncluded,
    vm.files,
  ])

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <span className={styles.topBarTitle}>Converter em Chamado</span>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          {!emailId && (
            <div className={styles.emailInfoSection}>
              <p className={styles.emailBodyText}>
                Abra um e-mail na Caixa de Entrada e use &quot;Converter em
                Chamado&quot; para carregar o conteúdo aqui.
              </p>
            </div>
          )}

          {emailId && emailLoading && (
            <div className={styles.emailInfoSection}>
              <p className={styles.emailBodyText}>Carregando e-mail...</p>
            </div>
          )}

          {emailId && emailError && !emailLoading && (
            <div className={styles.emailInfoSection}>
              <p className={styles.emailBodyText}>
                Não foi possível carregar este e-mail.
              </p>
            </div>
          )}

          {emailId && emailDisplay && (
            <>
              <div
                className={`${styles.emailInfoSection} ${
                  emailInfoCollapsed
                    ? styles.emailInfoSectionClosed
                    : styles.emailInfoSectionOpen
                }`}
              >
                <div className={styles.emailHeader}>
                  <h2 className={styles.emailSubject}>
                    {emailDisplay.subject}
                  </h2>
                  <div className={styles.emailMeta}>
                    <div className={styles.avatar}>
                      {emailDisplay.avatarChar}
                    </div>
                    <div className={styles.senderInfo}>
                      <p className={styles.senderName}>
                        {emailDisplay.senderName}
                      </p>
                      {emailDisplay.senderEmail ? (
                        <p className={styles.senderEmail}>
                          &lt;{emailDisplay.senderEmail}&gt;
                        </p>
                      ) : null}
                    </div>
                    <span className={styles.emailDate}>
                      {emailDisplay.date}
                    </span>
                  </div>
                </div>

                <div className={styles.emailBody}>
                  <p className={styles.emailBodyText}>{emailDisplay.body}</p>
                </div>
              </div>

              <button
                type="button"
                className={styles.collapseBar}
                onClick={() => setEmailInfoCollapsed((prev) => !prev)}
              >
                {emailInfoCollapsed ? (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Mostrar detalhes do email
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Ocultar detalhes do email
                  </>
                )}
              </button>
            </>
          )}

          {emailId && emailDisplay && attachments.length > 0 && (
            <div className={styles.attachmentBar}>
              <div className={styles.attachmentName}>
                <FileText className="h-4 w-4" />
                <span>{currentAttachmentItem?.filename}</span>
              </div>
              <div className={styles.attachmentNav}>
                <button
                  type="button"
                  className={styles.attachmentNavButton}
                  disabled={currentAttachment === 0}
                  onClick={() =>
                    setCurrentAttachment((i) => Math.max(0, i - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className={styles.attachmentNavText}>
                  {currentAttachment + 1} / {attachments.length}
                </span>
                <button
                  type="button"
                  className={styles.attachmentNavButton}
                  disabled={currentAttachment >= attachments.length - 1}
                  onClick={() =>
                    setCurrentAttachment((i) =>
                      Math.min(attachments.length - 1, i + 1),
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className={styles.pdfViewer}>
            {emailId &&
            emailDisplay &&
            attachments.length > 0 &&
            attachmentPreviewUrl ? (
              <iframe
                key={attachmentPreviewUrl + currentAttachment}
                src={attachmentPreviewUrl}
                title={currentAttachmentItem?.filename ?? 'Anexo'}
                className="h-full w-full border-0"
              />
            ) : emailId &&
              emailDisplay &&
              attachments.length > 0 &&
              attachmentPreviewLoading ? (
              <div className={styles.pdfPlaceholder}>
                <FileText className="h-16 w-16 opacity-30" />
                <span>Carregando anexo...</span>
              </div>
            ) : (
              <div className={styles.pdfPlaceholder}>
                <FileText className="h-16 w-16 opacity-30" />
                <span>Nenhum PDF para exibir</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.rightPanel}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              const sub = (e.nativeEvent as SubmitEvent).submitter as
                | HTMLButtonElement
                | undefined
              const intent =
                sub?.dataset?.intent === 'save-and-new'
                  ? 'save-and-new'
                  : 'save'
              setActiveSubmit(intent)
              vm.handleSubmit(
                async (data) => {
                  try {
                    const isConvert = Boolean(
                      nullIfEmpty(data.associar_chamado_id),
                    )
                    const filesToSend = await buildFilesForTicketSubmit()
                    const saveAndNew = intent === 'save-and-new' && !isConvert
                    await vm.onSubmitFromEmail(data, emailId, filesToSend, {
                      saveAndNew,
                    })
                    if (intent === 'save' || isConvert) {
                      router.push('/chamados/caixa-entrada')
                    } else {
                      setEmailAttachmentSelectedIds(new Set())
                      setManualFileSelected({})
                    }
                  } finally {
                    setActiveSubmit(null)
                  }
                },
                (errors) => {
                  setActiveSubmit(null)
                  toast.error(
                    getFirstFormErrorMessage(errors) ??
                      'Existem campos com pendências. Verifique os avisos abaixo de cada campo.',
                  )
                },
              )(e)
            }}
          >
            <div className={styles.rightPanelScroll}>
              <h3 className={styles.rightPanelTitle}>Dados do Chamado</h3>

              <div className="space-y-4">
                <div className={styles.firstFieldsCard}>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>
                        Associar chamado
                      </Label>

                      <Controller
                        control={vm.control}
                        name="associar_chamado_id"
                        render={({ field }) => (
                          <Popover
                            open={vm.ticketPopoverOpen}
                            onOpenChange={vm.setTicketPopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={vm.isLoading}
                                className={`h-11 w-full justify-between ${styles.inputBg} font-normal`}
                              >
                                <span className="truncate">
                                  {vm.selectedTicketLabel ||
                                    'Digite para buscar um chamado'}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent
                              className={`w-[var(--radix-popover-trigger-width)] p-0 ${styles.associarChamadoPopover}`}
                            >
                              <Command
                                shouldFilter={false}
                                className={styles.associarChamadoCommand}
                              >
                                <CommandInput
                                  placeholder="Buscar chamado..."
                                  value={vm.ticketSearch}
                                  onValueChange={vm.setTicketSearch}
                                />

                                <CommandList>
                                  {vm.isTicketsLoading && (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                      Buscando chamados...
                                    </div>
                                  )}

                                  {!vm.isTicketsLoading &&
                                    vm.ticketSearch.trim().length === 0 && (
                                      <div className="px-3 py-2 text-sm text-muted-foreground">
                                        Digite para pesquisar.
                                      </div>
                                    )}

                                  {!vm.isTicketsLoading &&
                                    vm.ticketSearch.trim().length > 0 &&
                                    vm.tickets.length === 0 && (
                                      <CommandEmpty>
                                        Nenhum chamado encontrado.
                                      </CommandEmpty>
                                    )}

                                  <CommandGroup>
                                    {vm.tickets.map((ticket) => (
                                      <CommandItem
                                        key={ticket.id}
                                        value={`${ticket.id} ${ticket.titulo}`}
                                        onSelect={() => {
                                          vm.applyAssociatedTicketFromSearch(
                                            ticket.id,
                                            ticket.titulo,
                                          ).catch(() => {})
                                          vm.setTicketPopoverOpen(false)
                                        }}
                                      >
                                        <div className="flex w-full items-center justify-between gap-2">
                                          <span className="truncate">
                                            {ticket.titulo}
                                          </span>
                                          {field.value === ticket.id && (
                                            <span className="text-xs text-muted-foreground">
                                              Selecionado
                                            </span>
                                          )}
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>

                                  {field.value && (
                                    <div className="border-t p-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => {
                                          field.onChange(null)
                                          vm.setSelectedTicketLabel('')
                                          vm.setTicketSearch('')
                                          vm.setTicketPopoverOpen(false)
                                        }}
                                      >
                                        Limpar seleção
                                      </Button>
                                    </div>
                                  )}
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>
                        Tipo de chamado
                      </Label>
                      <Controller
                        control={vm.control}
                        name="tipo_chamado_id"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={fieldDisabled || vm.isTicketTypesLoading}
                          >
                            <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className={styles.selectContentForm}>
                              {vm.ticketTypes.map((ticketType) => (
                                <SelectItem
                                  key={ticketType.id}
                                  value={ticketType.id}
                                  className={styles.selectItemForm}
                                >
                                  {ticketType.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {vm.errors.tipo_chamado_id?.message && (
                        <p className="text-xs text-destructive">
                          {vm.errors.tipo_chamado_id.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <ConverterPanelSection
                  title="Informações do chamado"
                  isOpen={vm.openSections.info}
                  onToggle={() => vm.toggleSection('info')}
                >
                  <fieldset
                    disabled={fieldDisabled}
                    className="min-w-0 border-0 p-0 [&:disabled]:opacity-100"
                  >
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1.5">
                        <Label className={styles.fieldLabel}>
                          Órgão procedimento
                        </Label>
                        <Controller
                          control={vm.control}
                          name="orgao_procedimento_id"
                          render={({ field }) => (
                            <Select
                              value={field.value ?? ''}
                              onValueChange={(v) => field.onChange(v || null)}
                              disabled={vm.isLoading || vm.isOperationsLoading}
                            >
                              <SelectTrigger
                                className={`h-11 ${styles.inputBg}`}
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent
                                className={styles.selectContentForm}
                              >
                                {vm.operations.map((op) => (
                                  <SelectItem
                                    key={op.id}
                                    value={op.id}
                                    className={styles.selectItemForm}
                                  >
                                    {op.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {vm.errors.orgao_procedimento_id?.message && (
                          <p className="text-xs text-destructive">
                            {vm.errors.orgao_procedimento_id.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className={styles.fieldLabel}>
                          Nº de procedimento
                        </Label>
                        <Controller
                          control={vm.control}
                          name="numero_procedimento"
                          render={({ field }) => (
                            <Input
                              className={`h-11 ${styles.inputBg}`}
                              disabled={vm.isLoading}
                              inputMode="numeric"
                              autoComplete="off"
                              value={field.value ?? ''}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              onChange={(e) =>
                                field.onChange(
                                  maskDigitsOnly(
                                    e.target.value,
                                    Number.POSITIVE_INFINITY,
                                  ),
                                )
                              }
                            />
                          )}
                        />
                        <FieldStringError
                          value={vm.watch('numero_procedimento')}
                          max={L.numero_procedimento}
                          message={vm.errors.numero_procedimento?.message}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className={styles.fieldLabel}>
                          Nº do ofício
                        </Label>
                        <Input
                          className={`h-11 ${styles.inputBg}`}
                          disabled={vm.isLoading}
                          {...vm.register('numero_oficio')}
                        />
                        <FieldStringError
                          value={vm.watch('numero_oficio')}
                          max={L.numero_oficio}
                          message={vm.errors.numero_oficio?.message}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className={styles.fieldLabel}>Data base</Label>
                        <Controller
                          control={vm.control}
                          name="data_base"
                          render={({ field }) => (
                            <DataBaseDatePicker
                              value={field.value ?? ''}
                              onChange={field.onChange}
                              disabled={vm.isLoading}
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className={styles.fieldLabel}>Natureza</Label>
                        <Controller
                          control={vm.control}
                          name="natureza_id"
                          render={({ field }) => (
                            <Select
                              value={field.value ?? ''}
                              onValueChange={(v) => field.onChange(v || null)}
                              disabled={
                                vm.isLoading || vm.isTicketNaturesLoading
                              }
                            >
                              <SelectTrigger
                                className={`h-11 ${styles.inputBg}`}
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent
                                className={styles.selectContentForm}
                              >
                                {vm.ticketNatures.map((nature) => (
                                  <SelectItem
                                    key={nature.id}
                                    value={nature.id}
                                    className={styles.selectItemForm}
                                  >
                                    {nature.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Label className={styles.fieldLabel}>
                          Possui apelido pela imprensa?
                        </Label>
                        <Controller
                          control={vm.control}
                          name="possui_apelido_imprensa"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <Switch
                                id="conv_possui_apelido"
                                size="sm"
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                                disabled={vm.isLoading}
                                className={styles.apelidoToggle}
                              />
                              <span className={styles.toggleLabel}>
                                {field.value ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          )}
                        />
                      </div>

                      {vm.possuiApelido && (
                        <>
                          <div className="space-y-1.5">
                            <Label className={styles.fieldLabel}>
                              Apelido pela imprensa
                            </Label>
                            <Input
                              className={`h-11 ${styles.inputBg}`}
                              disabled={vm.isLoading}
                              {...vm.register('apelido_imprensa')}
                            />
                            <FieldStringError
                              value={vm.watch('apelido_imprensa')}
                              max={L.apelido_imprensa}
                              message={vm.errors.apelido_imprensa?.message}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className={styles.fieldLabel}>
                              Link da matéria
                            </Label>
                            <Input
                              className={`h-11 ${styles.inputBg}`}
                              disabled={vm.isLoading}
                              placeholder="https://..."
                              {...vm.register('link_materia')}
                            />
                            <FieldStringError
                              value={vm.watch('link_materia')}
                              max={L.link_materia}
                              message={vm.errors.link_materia?.message}
                            />
                          </div>
                        </>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Label className={styles.fieldLabel}>
                          Possui endereço de correspondência?
                        </Label>
                        <Controller
                          control={vm.control}
                          name="possui_endereco_correspondencia"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <Switch
                                id="conv_possui_endereco"
                                size="sm"
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                                disabled={vm.isLoading}
                                className={styles.apelidoToggle}
                              />
                              <span className={styles.toggleLabel}>
                                {field.value ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          )}
                        />
                      </div>

                      {vm.possuiEnderecoCorrespondencia && (
                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1.5">
                            <Label className={styles.fieldLabel}>Bairro</Label>
                            <Input
                              className={`h-11 ${styles.inputBg}`}
                              disabled={vm.isLoading}
                              {...vm.register('bairro_correspondencia')}
                            />
                            <FieldStringError
                              value={vm.watch('bairro_correspondencia')}
                              max={L.bairro_correspondencia}
                              message={
                                vm.errors.bairro_correspondencia?.message
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className={styles.fieldLabel}>Rua</Label>
                            <Input
                              className={`h-11 ${styles.inputBg}`}
                              disabled={vm.isLoading}
                              {...vm.register('rua_correspondencia')}
                            />
                            <FieldStringError
                              value={vm.watch('rua_correspondencia')}
                              max={L.rua_correspondencia}
                              message={vm.errors.rua_correspondencia?.message}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className={styles.fieldLabel}>Número</Label>
                            <Input
                              className={`h-11 ${styles.inputBg}`}
                              disabled={vm.isLoading}
                              {...vm.register('numero_correspondencia')}
                            />
                            <FieldStringError
                              value={vm.watch('numero_correspondencia')}
                              max={L.numero_correspondencia}
                              message={
                                vm.errors.numero_correspondencia?.message
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </fieldset>
                </ConverterPanelSection>

                <ConverterPanelSection
                  title="Requisitante"
                  isOpen={vm.openSections.requester}
                  onToggle={() => vm.toggleSection('requester')}
                >
                  <fieldset
                    disabled={fieldDisabled}
                    className="min-w-0 border-0 p-0 [&:disabled]:opacity-100"
                  >
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className={styles.fieldLabel}>Demandante</Label>
                        <Controller
                          control={vm.control}
                          name="operation_id"
                          render={({ field }) => (
                            <Select
                              value={field.value ?? ''}
                              onValueChange={(v) => field.onChange(v || null)}
                              disabled={vm.isLoading || vm.isOperationsLoading}
                            >
                              <SelectTrigger
                                className={`h-11 ${styles.inputBg}`}
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent
                                className={styles.selectContentForm}
                              >
                                {vm.operations.map((op) => (
                                  <SelectItem
                                    key={op.id}
                                    value={op.id}
                                    className={styles.selectItemForm}
                                  >
                                    {op.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {vm.errors.operation_id?.message && (
                          <p className="text-xs text-destructive">
                            {vm.errors.operation_id.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1.5">
                          <Label className={styles.fieldLabel}>
                            Requisitante
                          </Label>
                          <Input
                            className={`h-11 ${styles.inputBg}`}
                            disabled={vm.isLoading}
                            {...vm.register('requisitante.requisitante_nome')}
                          />
                          <FieldStringError
                            value={vm.watch('requisitante.requisitante_nome')}
                            max={L.requisitante_nome}
                            message={
                              vm.errors.requisitante?.requisitante_nome?.message
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className={styles.fieldLabel}>Telefone</Label>
                          <Controller
                            control={vm.control}
                            name="requisitante.requisitante_telefone"
                            render={({ field }) => (
                              <div className={styles.inputWithIconRight}>
                                <Input
                                  className="h-full min-h-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                  disabled={vm.isLoading}
                                  inputMode="tel"
                                  autoComplete="tel"
                                  value={field.value ?? ''}
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                  onChange={(e) =>
                                    field.onChange(maskPhoneBR(e.target.value))
                                  }
                                />
                                <Phone
                                  className="h-4 w-4 shrink-0 opacity-50"
                                  aria-hidden
                                />
                              </div>
                            )}
                          />
                          <FieldStringError
                            value={vm.watch(
                              'requisitante.requisitante_telefone',
                            )}
                            max={L.requisitante_telefone}
                            message={
                              vm.errors.requisitante?.requisitante_telefone
                                ?.message
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className={styles.fieldLabel}>Email</Label>
                          <div className={styles.inputWithIconRight}>
                            <Input
                              className="h-full min-h-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              type="email"
                              disabled={vm.isLoading}
                              autoComplete="email"
                              {...vm.register(
                                'requisitante.requisitante_email',
                              )}
                            />
                            <Mail
                              className="h-4 w-4 shrink-0 opacity-50"
                              aria-hidden
                            />
                          </div>
                          <FieldStringError
                            value={vm.watch('requisitante.requisitante_email')}
                            max={L.requisitante_email}
                            message={
                              vm.errors.requisitante?.requisitante_email
                                ?.message
                            }
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={
                          vm.isLoading || vm.focalPoints.fields.length >= 20
                        }
                        onClick={() =>
                          vm.focalPoints.append({
                            nome: '',
                            telefone: '',
                            email: null,
                          })
                        }
                        className={styles.addPointFocalButton}
                      >
                        <Plus className="h-5 w-5 shrink-0" aria-hidden />
                        Adicionar Ponto Focal
                      </button>

                      <div className="space-y-3">
                        {vm.focalPoints.fields.map((fp, idx) => (
                          <div key={fp.id} className="grid grid-cols-1 gap-3">
                            <div className="space-y-1.5">
                              <Label className={styles.fieldLabel}>
                                Ponto focal
                              </Label>
                              <Input
                                className={`h-11 ${styles.inputBg}`}
                                disabled={vm.isLoading}
                                {...vm.register(`pontos_focais.${idx}.nome`)}
                              />
                              <FieldStringError
                                value={vm.watch(`pontos_focais.${idx}.nome`)}
                                max={L.ponto_focal_nome}
                                message={
                                  vm.errors.pontos_focais?.[idx]?.nome?.message
                                }
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className={styles.fieldLabel}>
                                Telefone
                              </Label>
                              <Controller
                                control={vm.control}
                                name={`pontos_focais.${idx}.telefone`}
                                render={({ field }) => (
                                  <div className={styles.inputWithIconRight}>
                                    <Input
                                      className="h-full min-h-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                      disabled={vm.isLoading}
                                      inputMode="tel"
                                      autoComplete="tel"
                                      value={field.value ?? ''}
                                      onBlur={field.onBlur}
                                      ref={field.ref}
                                      onChange={(e) =>
                                        field.onChange(
                                          maskPhoneBR(e.target.value),
                                        )
                                      }
                                    />
                                    <Phone
                                      className="h-4 w-4 shrink-0 opacity-50"
                                      aria-hidden
                                    />
                                  </div>
                                )}
                              />
                              <FieldStringError
                                value={vm.watch(
                                  `pontos_focais.${idx}.telefone`,
                                )}
                                max={L.ponto_focal_telefone}
                                message={
                                  vm.errors.pontos_focais?.[idx]?.telefone
                                    ?.message
                                }
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className={styles.fieldLabel}>Email</Label>
                              <div className="flex min-w-0 items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className={styles.inputWithIconRight}>
                                    <Input
                                      className="h-full min-h-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                      type="email"
                                      disabled={vm.isLoading}
                                      autoComplete="email"
                                      {...vm.register(
                                        `pontos_focais.${idx}.email`,
                                      )}
                                    />
                                    <Mail
                                      className="h-4 w-4 shrink-0 opacity-50"
                                      aria-hidden
                                    />
                                  </div>
                                  <FieldStringError
                                    value={vm.watch(
                                      `pontos_focais.${idx}.email`,
                                    )}
                                    max={L.ponto_focal_email}
                                    message={
                                      vm.errors.pontos_focais?.[idx]?.email
                                        ?.message
                                    }
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-11 w-11 shrink-0 p-0"
                                  disabled={vm.isLoading}
                                  onClick={() => vm.focalPoints.remove(idx)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </fieldset>
                </ConverterPanelSection>

                <ConverterPanelSection
                  title="Serviços"
                  isOpen={vm.openSections.services}
                  onToggle={() => vm.toggleSection('services')}
                >
                  <div className={styles.serviceGridFull}>
                    {SERVICE_ORDER.map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={styles.serviceCardCta}
                        disabled={fieldDisabled}
                        onClick={() => vm.handleOpenService(key)}
                      >
                        <span className={styles.serviceCardCtaTitle}>
                          {SERVICE_CONFIG[key].label}
                        </span>
                        <span className={styles.plusBox}>
                          <Plus className="h-3 w-3" />
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 space-y-3">
                    <CompactServiceList
                      label="Busca por placa"
                      fields={vm.buscaPorPlaca.fields}
                      onRemove={vm.buscaPorPlaca.remove}
                      onEdit={(idx) =>
                        vm.openServiceModalForEdit('busca_por_placa', idx)
                      }
                      renderRow={() => null}
                      disabled={fieldDisabled}
                      openModalDisabled={vm.isLoading}
                    />

                    <CompactServiceList
                      label="Busca por radar"
                      fields={vm.buscaPorRadar.fields}
                      onRemove={vm.buscaPorRadar.remove}
                      onEdit={(idx) =>
                        vm.openServiceModalForEdit('busca_por_radar', idx)
                      }
                      renderRow={() => null}
                      disabled={fieldDisabled}
                      openModalDisabled={vm.isLoading}
                    />

                    <CompactServiceList
                      label="Cerco eletrônico"
                      fields={vm.cercoEletronico.fields}
                      onRemove={vm.cercoEletronico.remove}
                      onEdit={(idx) =>
                        vm.openServiceModalForEdit('cerco_eletronico', idx)
                      }
                      renderRow={() => null}
                      disabled={fieldDisabled}
                      openModalDisabled={vm.isLoading}
                    />

                    <CompactServiceList
                      label="Busca por imagem"
                      fields={vm.buscaPorImagem.fields}
                      onRemove={vm.buscaPorImagem.remove}
                      onEdit={(idx) =>
                        vm.openServiceModalForEdit('busca_por_imagem', idx)
                      }
                      renderRow={() => null}
                      disabled={fieldDisabled}
                      openModalDisabled={vm.isLoading}
                    />

                    <CompactServiceList
                      label="Placas correlatas"
                      fields={vm.placasCorrelatas.fields}
                      onRemove={vm.placasCorrelatas.remove}
                      onEdit={(idx) =>
                        vm.openServiceModalForEdit('placas_correlatas', idx)
                      }
                      renderRow={(idx) => (
                        <CorrelataListForm
                          control={vm.control}
                          setValue={vm.setValue}
                          index={idx}
                          name="placas_correlatas"
                          disabled={fieldDisabled}
                        />
                      )}
                      disabled={fieldDisabled}
                      openModalDisabled={vm.isLoading}
                    />

                    <CompactServiceList
                      label="Placas conjuntas"
                      fields={vm.placasConjuntas.fields}
                      onRemove={vm.placasConjuntas.remove}
                      onEdit={(idx) =>
                        vm.openServiceModalForEdit('placas_conjuntas', idx)
                      }
                      renderRow={(idx) => (
                        <CorrelataListForm
                          control={vm.control}
                          setValue={vm.setValue}
                          index={idx}
                          name="placas_conjuntas"
                          disabled={fieldDisabled}
                        />
                      )}
                      disabled={fieldDisabled}
                      openModalDisabled={vm.isLoading}
                    />

                    <CompactServiceList
                      label="Reserva de imagem"
                      fields={vm.reservaDeImagem.fields}
                      onRemove={vm.reservaDeImagem.remove}
                      onEdit={(idx) =>
                        vm.openServiceModalForEdit('reserva_de_imagem', idx)
                      }
                      renderRow={() => null}
                      disabled={fieldDisabled}
                      openModalDisabled={vm.isLoading}
                    />

                    <CompactServiceList
                      label="Análise de imagem"
                      fields={vm.analiseDeImagem.fields}
                      onRemove={vm.analiseDeImagem.remove}
                      onEdit={(idx) =>
                        vm.openServiceModalForEdit('analise_de_imagem', idx)
                      }
                      renderRow={() => null}
                      disabled={fieldDisabled}
                      openModalDisabled={vm.isLoading}
                    />

                    <CompactServiceList
                      label="Outros"
                      fields={vm.outros.fields}
                      onRemove={vm.outros.remove}
                      onEdit={(idx) =>
                        vm.openServiceModalForEdit('outros', idx)
                      }
                      renderRow={() => null}
                      disabled={fieldDisabled}
                      openModalDisabled={vm.isLoading}
                    />
                  </div>
                </ConverterPanelSection>

                <ConverterPanelSection
                  title="Locação interna"
                  isOpen={vm.openSections.internal}
                  onToggle={() => vm.toggleSection('internal')}
                >
                  <fieldset
                    disabled={fieldDisabled}
                    className="min-w-0 border-0 p-0 [&:disabled]:opacity-100"
                  >
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className={styles.fieldLabel}>Equipe</Label>
                        <Controller
                          control={vm.control}
                          name="equipe_id"
                          render={({ field }) => (
                            <Select
                              value={field.value ?? ''}
                              onValueChange={(v) => field.onChange(v || null)}
                              disabled={vm.isLoading}
                            >
                              <SelectTrigger
                                className={`h-11 ${styles.inputBg}`}
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent
                                className={styles.selectContentForm}
                              >
                                {vm.teams.map((t) => (
                                  <SelectItem
                                    key={t.id}
                                    value={t.id}
                                    className={styles.selectItemForm}
                                  >
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {vm.errors.equipe_id?.message && (
                          <p className="text-xs text-destructive">
                            {vm.errors.equipe_id.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className={styles.fieldLabel}>Prioridade</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={vm.isLoading}
                            className={`${styles.priorityButton} ${
                              vm.watch('prioridade') === 'URGENTE'
                                ? styles.priorityActive
                                : ''
                            }`}
                            onClick={() => {
                              const current = vm.getValues('prioridade')
                              vm.setValue(
                                'prioridade',
                                current === 'URGENTE' ? null : 'URGENTE',
                              )
                            }}
                          >
                            Urgente
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={vm.isLoading}
                            className={`${styles.priorityButton} ${
                              vm.watch('prioridade') === 'ALTA'
                                ? styles.priorityActive
                                : ''
                            }`}
                            onClick={() => {
                              const current = vm.getValues('prioridade')
                              vm.setValue(
                                'prioridade',
                                current === 'ALTA' ? null : 'ALTA',
                              )
                            }}
                          >
                            Alta
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={vm.isLoading}
                            className={`${styles.priorityButton} ${
                              vm.watch('prioridade') === 'ROTINA'
                                ? styles.priorityActive
                                : ''
                            }`}
                            onClick={() => {
                              const current = vm.getValues('prioridade')
                              vm.setValue(
                                'prioridade',
                                current === 'ROTINA' ? null : 'ROTINA',
                              )
                            }}
                          >
                            Rotina
                          </Button>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </ConverterPanelSection>

                <ConverterPanelSection
                  title="Adicionar comentário"
                  isOpen={vm.openSections.comment}
                  onToggle={() => vm.toggleSection('comment')}
                >
                  <fieldset
                    disabled={fieldDisabled}
                    className="min-w-0 border-0 p-0 [&:disabled]:opacity-100"
                  >
                    <Textarea
                      placeholder="Escreva um comentário"
                      disabled={fieldDisabled}
                      className={`${styles.fakeEditor} ${styles.inputBg}`}
                      {...vm.register('comentario_inicial')}
                    />
                    <FieldStringError
                      value={vm.watch('comentario_inicial')}
                      max={L.comentario_inicial}
                      message={vm.errors.comentario_inicial?.message}
                    />
                  </fieldset>
                </ConverterPanelSection>

                <ConverterPanelSection
                  title="Anexar documentos"
                  isOpen={vm.openSections.attachments}
                  onToggle={() => vm.toggleSection('attachments')}
                >
                  <div className={styles.attachmentsLayout}>
                    <div className={styles.attachmentsDocumentList}>
                      {attachments.length === 0 && vm.files.length === 0 ? (
                        <p className={styles.uploadBoxHint}>
                          Nenhum arquivo anexado.
                        </p>
                      ) : (
                        <div className={styles.fileList}>
                          {emailId
                            ? attachments.map((att) => {
                                const selected = emailAttachmentSelectedIds.has(
                                  att.id,
                                )
                                return (
                                  <div
                                    key={`email-att-${att.id}`}
                                    className={styles.fileRow}
                                  >
                                    <button
                                      type="button"
                                      className={styles.fileRowCheckBtn}
                                      onClick={() =>
                                        toggleEmailAttachmentSelection(att.id)
                                      }
                                      disabled={attachmentDisabled}
                                      aria-pressed={selected}
                                      aria-label={
                                        selected
                                          ? `Desmarcar anexo do e-mail ${att.filename}`
                                          : `Incluir anexo do e-mail ${att.filename}`
                                      }
                                      title={
                                        selected
                                          ? 'Desmarcar para não enviar no chamado'
                                          : 'Marcar para enviar no chamado'
                                      }
                                    >
                                      {selected ? (
                                        <SquareCheck
                                          className={`${styles.fileRowCheckIcon} ${styles.fileRowCheckIconOn} shrink-0`}
                                          aria-hidden
                                        />
                                      ) : (
                                        <Square
                                          className={`${styles.fileRowCheckIcon} shrink-0`}
                                          aria-hidden
                                        />
                                      )}
                                    </button>
                                    <p
                                      className={styles.fileRowFileName}
                                      title={att.filename}
                                    >
                                      {att.filename}
                                    </p>
                                    <span
                                      className={styles.fileRowSourceBadge}
                                      title="Anexo do e-mail"
                                    >
                                      E-mail
                                    </span>
                                  </div>
                                )
                              })
                            : null}
                          {vm.files.map((f, idx) => {
                            const included = isManualFileIncluded(f)
                            return (
                              <div
                                key={`${fileSelectionKey(f)}-${idx}`}
                                className={styles.fileRow}
                              >
                                <button
                                  type="button"
                                  className={styles.fileRowCheckBtn}
                                  onClick={() => toggleManualFileSelection(f)}
                                  disabled={attachmentDisabled}
                                  aria-pressed={included}
                                  aria-label={
                                    included
                                      ? `Desmarcar ${f.name}`
                                      : `Incluir ${f.name}`
                                  }
                                  title={
                                    included
                                      ? 'Desmarcar para não enviar no chamado'
                                      : 'Marcar para enviar no chamado'
                                  }
                                >
                                  {included ? (
                                    <SquareCheck
                                      className={`${styles.fileRowCheckIcon} ${styles.fileRowCheckIconOn} shrink-0`}
                                      aria-hidden
                                    />
                                  ) : (
                                    <Square
                                      className={`${styles.fileRowCheckIcon} shrink-0`}
                                      aria-hidden
                                    />
                                  )}
                                </button>
                                <p
                                  className={styles.fileRowFileName}
                                  title={f.name}
                                >
                                  {f.name}
                                </p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className={`${styles.fileRowDeleteBtn} h-8 w-8 shrink-0 p-0`}
                                  onClick={() => vm.removeFile(idx)}
                                  disabled={attachmentDisabled}
                                  title="Excluir anexo"
                                >
                                  <Trash className="h-4 w-4" aria-hidden />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className={styles.uploadColumn}>
                      <label className={styles.uploadBox}>
                        <input
                          className="hidden"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            vm.onDropFiles(e.target.files)
                            e.target.value = ''
                          }}
                          disabled={attachmentDisabled}
                        />
                        <Upload className="h-5 w-5 shrink-0 text-[var(--tc-icon-subtle)]" />
                        <span className={styles.uploadBoxText}>
                          Clique para fazer upload ou arraste o arquivo
                        </span>
                        <span className={styles.uploadBoxHint}>
                          PDF, DOC, DOCX (máx. 10MB)
                        </span>
                      </label>
                    </div>
                  </div>
                </ConverterPanelSection>
              </div>
            </div>

            <div className={styles.formFooter}>
              <button
                type="submit"
                data-intent="save"
                className={styles.footerBtnPrimary}
                disabled={vm.isLoading}
              >
                {vm.isLoading && activeSubmit === 'save'
                  ? vm.isConvertingToConventional
                    ? 'Convertendo...'
                    : 'Salvando...'
                  : isAssociarConvertMode
                    ? 'Converter chamado'
                    : 'Salvar Chamado'}
              </button>
              <button
                type="submit"
                data-intent="save-and-new"
                className={styles.footerBtnSecondary}
                disabled={vm.isLoading}
              >
                {vm.isLoading && activeSubmit === 'save-and-new'
                  ? vm.isConvertingToConventional
                    ? 'Convertendo...'
                    : 'Salvando...'
                  : isAssociarConvertMode
                    ? 'Converter e criar novo chamado'
                    : 'Salvar e Criar Novo Chamado'}
              </button>
              <button
                type="button"
                className={styles.footerBtnTertiary}
                disabled={vm.isLoading}
                onClick={() => vm.resetFormToDefaults()}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <ServiceModal
        variant="drawer"
        readOnly={isAssociarConvertMode}
        serviceModalOpen={vm.serviceModalOpen}
        editIndex={vm.serviceModalEditIndex}
        closeServiceModal={vm.closeServiceModal}
        initialBuscaPorPlaca={initialBuscaPorPlaca}
        initialBuscaPorRadar={initialBuscaPorRadar}
        initialCerco={initialCerco}
        initialBuscaPorImagem={initialBuscaPorImagem}
        initialPlacasCorrelatas={initialPlacasCorrelatas}
        initialPlacasConjuntas={initialPlacasConjuntas}
        initialReservaImagem={initialReservaImagem}
        initialAnaliseImagem={initialAnaliseImagem}
        initialOutros={initialOutros}
        onSaveBuscaPorPlaca={(value, editIndex) => {
          const normalized = {
            plates: (value.plates ?? [])
              .map((p) => p.trim())
              .filter((p) => p.length > 0),
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
          }
          if (editIndex !== null) {
            vm.buscaPorPlaca.update(editIndex, normalized)
          } else {
            vm.buscaPorPlaca.append(normalized)
          }
          vm.closeServiceModal()
        }}
        onSaveBuscaPorRadar={(value, editIndex) => {
          const normalized = {
            plates: (value.plates ?? [])
              .map((p) => p.trim())
              .filter((p) => p.length > 0),
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            orientation: nullIfEmpty(value.orientation),
          }
          if (editIndex !== null) {
            vm.buscaPorRadar.update(editIndex, normalized)
          } else {
            vm.buscaPorRadar.append(normalized)
          }
          vm.closeServiceModal()
        }}
        onSaveCerco={(value, editIndex) => {
          const normalized = {
            plate: value.plate,
            vehicle_observations: nullIfEmpty(value.vehicle_observations),
          }
          if (editIndex !== null) {
            vm.cercoEletronico.update(editIndex, normalized)
          } else {
            vm.cercoEletronico.append(normalized)
          }
          vm.closeServiceModal()
        }}
        onSaveBuscaPorImagem={(value, editIndex) => {
          const normalized = {
            plate: nullIfEmpty(value.plate),
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            address: nullIfEmpty(value.address),
            description: nullIfEmpty(value.description),
          }
          if (editIndex !== null) {
            vm.buscaPorImagem.update(editIndex, normalized)
          } else {
            vm.buscaPorImagem.append(normalized)
          }
          vm.closeServiceModal()
        }}
        onSavePlacasCorrelatas={(value, editIndex) => {
          const normalized = {
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            interest_interval_minutes: value.interest_interval_minutes,
            detection_count: value.detection_count,
            detection: value.detection,
            plates: value.plates.map((item) => ({
              plate: item.plate,
            })),
          }
          if (editIndex !== null) {
            vm.placasCorrelatas.update(editIndex, normalized)
          } else {
            vm.placasCorrelatas.append(normalized)
          }
          vm.closeServiceModal()
        }}
        onSavePlacasConjuntas={(value, editIndex) => {
          const normalized = {
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            interest_interval_minutes: value.interest_interval_minutes,
            detection_count: value.detection_count,
            detection: value.detection,
            plates: value.plates.map((item) => ({
              plate: item.plate,
            })),
          }
          if (editIndex !== null) {
            vm.placasConjuntas.update(editIndex, normalized)
          } else {
            vm.placasConjuntas.append(normalized)
          }
          vm.closeServiceModal()
        }}
        onSaveReservaImagem={(value, editIndex) => {
          const normalized = {
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            orientation: nullIfEmpty(value.orientation),
          }
          if (editIndex !== null) {
            vm.reservaDeImagem.update(editIndex, normalized)
          } else {
            vm.reservaDeImagem.append(normalized)
          }
          vm.closeServiceModal()
        }}
        onSaveAnaliseImagem={(value, editIndex) => {
          const normalized = {
            period_start: nullIfEmpty(value.period_start),
            period_end: nullIfEmpty(value.period_end),
            orientation: nullIfEmpty(value.orientation),
          }
          if (editIndex !== null) {
            vm.analiseDeImagem.update(editIndex, normalized)
          } else {
            vm.analiseDeImagem.append(normalized)
          }
          vm.closeServiceModal()
        }}
        onSaveOutros={(value, editIndex) => {
          const normalized = {
            orientation: nullIfEmpty(value.orientation),
          }
          if (editIndex !== null) {
            vm.outros.update(editIndex, normalized)
          } else {
            vm.outros.append(normalized)
          }
          vm.closeServiceModal()
        }}
      />
    </div>
  )
}
