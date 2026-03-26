'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { getTicketNatures } from '@/http/get-ticket-natures/get-ticket-natures'
import { getOperations } from '@/http/operations/get-operations'
import { getTeamsList } from '@/http/teams/get-teams'
import { getTicketTypes } from '@/http/ticket-types/get-ticket.types'
import { createTicket } from '@/http/tickets/create-ticket'
import { getTicketsSelect } from '@/http/tickets/get-tickets-list'
import { genericErrorMessage } from '@/utils/error-handlers'

import type {
  OpenServiceKey,
  SectionKey,
} from '../ticket-create/ticket-create.constant'
import { buildTicketCreatePayload } from '../ticket-create/ticket-create.mapper'
import {
  type TicketCreateForm,
  ticketCreateSchema,
} from '../ticket-create/ticket-create-schema'

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
const ALLOWED_ATTACHMENT_EXT = new Set(['.pdf', '.doc', '.docx'])

function attachmentExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  if (dot === -1) return ''
  return name.slice(dot).toLowerCase()
}

export function useTicketCreateController() {
  const [files, setFiles] = useState<File[]>([])
  const [serviceModalOpen, setServiceModalOpen] = useState<OpenServiceKey>(null)
  const [serviceModalEditIndex, setServiceModalEditIndex] = useState<
    number | null
  >(null)

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      info: true,
      requester: true,
      services: true,
      internal: true,
      comment: true,
      attachments: true,
    },
  )

  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketPopoverOpen, setTicketPopoverOpen] = useState(false)
  const [selectedTicketLabel, setSelectedTicketLabel] = useState('')

  const defaultValues = useMemo<TicketCreateForm>(
    () => ({
      associar_chamado_id: null,
      tipo_chamado_id: '',
      operation_id: '',
      numero_procedimento: null,
      numero_oficio: null,
      data_base: null,
      natureza_id: null,
      possui_apelido_imprensa: false,
      apelido_imprensa: null,
      link_materia: null,
      possui_endereco_correspondencia: false,
      bairro_correspondencia: null,
      rua_correspondencia: null,
      numero_correspondencia: null,
      requisitante: {
        requisitante_nome: '',
        requisitante_telefone: '',
        requisitante_email: null,
      },
      pontos_focais: [],
      equipe_id: '',
      prioridade: null,
      comentario_inicial: null,
      busca_por_placa: [],
      busca_por_radar: [],
      cerco_eletronico: [],
      busca_por_imagem: [],
      placas_correlatas: [],
      placas_conjuntas: [],
      reserva_de_imagem: [],
      analise_de_imagem: [],
      outros: [],
    }),
    [],
  )

  const form = useForm<TicketCreateForm>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues,
  })

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    formState: { isSubmitting, errors },
  } = form

  const possuiApelido = watch('possui_apelido_imprensa')
  const possuiEnderecoCorrespondencia = watch('possui_endereco_correspondencia')

  const focalPoints = useFieldArray({ control, name: 'pontos_focais' })
  const buscaPorPlaca = useFieldArray({ control, name: 'busca_por_placa' })
  const buscaPorRadar = useFieldArray({ control, name: 'busca_por_radar' })
  const cercoEletronico = useFieldArray({ control, name: 'cerco_eletronico' })
  const buscaPorImagem = useFieldArray({ control, name: 'busca_por_imagem' })
  const placasCorrelatas = useFieldArray({ control, name: 'placas_correlatas' })
  const placasConjuntas = useFieldArray({ control, name: 'placas_conjuntas' })
  const reservaDeImagem = useFieldArray({ control, name: 'reserva_de_imagem' })
  const analiseDeImagem = useFieldArray({ control, name: 'analise_de_imagem' })
  const outros = useFieldArray({ control, name: 'outros' })

  const operationsQuery = useQuery({
    queryKey: ['operations', 'select'],
    queryFn: () => getOperations({ page: 1, size: 100 }),
  })

  const ticketTypesQuery = useQuery({
    queryKey: ['ticket-types', 'select'],
    queryFn: () => getTicketTypes({ isActive: true }),
  })

  const ticketNaturesQuery = useQuery({
    queryKey: ['ticket-natures', 'select'],
    queryFn: () => getTicketNatures({ isActive: true }),
  })

  const ticketsQuery = useQuery({
    queryKey: ['tickets', 'search', ticketSearch],
    queryFn: () => getTicketsSelect({ search: ticketSearch }),
    enabled: ticketPopoverOpen && ticketSearch.trim().length > 0,
  })

  const teamsQuery = useQuery({
    queryKey: ['teams', 'list', 'select'],
    queryFn: () => getTeamsList(),
  })

  const createMutation = useMutation({
    mutationFn: async (payload: unknown) => createTicket(payload, files),
    onSuccess: () => {
      toast.success('Chamado criado com sucesso.')
      reset(defaultValues)
      setFiles([])
      setSelectedTicketLabel('')
      setTicketSearch('')
      closeServiceModal()
    },
    onError: () => toast.error(genericErrorMessage),
  })

  const operations = operationsQuery.data?.data?.items ?? []
  const ticketTypes = ticketTypesQuery.data?.data?.items ?? []
  const ticketNatures = ticketNaturesQuery.data?.data?.items ?? []
  const tickets = ticketsQuery.data?.data ?? []
  const teams = teamsQuery.data?.data ?? []

  const isOperationsLoading = operationsQuery.isLoading
  const isTicketTypesLoading = ticketTypesQuery.isLoading
  const isTicketNaturesLoading = ticketNaturesQuery.isLoading
  const isTicketsLoading = ticketsQuery.isLoading
  const isTeamsLoading = teamsQuery.isLoading
  const isLoading = isSubmitting || createMutation.isPending || isTeamsLoading

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  function onDropFiles(inputFiles: FileList | null) {
    if (!inputFiles?.length) return

    const accepted: File[] = []
    const invalidType: string[] = []
    const invalidSize: string[] = []

    for (const file of Array.from(inputFiles)) {
      const ext = attachmentExtension(file.name)
      if (!ALLOWED_ATTACHMENT_EXT.has(ext)) {
        invalidType.push(file.name)
        continue
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        invalidSize.push(file.name)
        continue
      }
      accepted.push(file)
    }

    if (invalidType.length > 0) {
      toast.error('Formato de arquivo não permitido.', {
        description:
          'Anexe apenas PDF, DOC ou DOCX. ' +
          (invalidType.length <= 3
            ? invalidType.join(', ')
            : `${invalidType.slice(0, 3).join(', ')} e mais ${invalidType.length - 3}`),
      })
    }

    if (invalidSize.length > 0) {
      toast.error('Arquivo acima do limite de 10MB.', {
        description:
          invalidSize.length <= 3
            ? invalidSize.join(', ')
            : `${invalidSize.slice(0, 3).join(', ')} e mais ${invalidSize.length - 3}`,
      })
    }

    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted])
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: TicketCreateForm) {
    const payload = buildTicketCreatePayload(data)
    await createMutation.mutateAsync(payload)
  }

  async function onSubmitFromEmail(
    data: TicketCreateForm,
    emailId?: string | null,
  ) {
    const basePayload = buildTicketCreatePayload(data)
    const payload = emailId
      ? { ...basePayload, email_id: emailId }
      : basePayload
    await createMutation.mutateAsync(payload)
  }

  function handleOpenService(service: OpenServiceKey) {
    setServiceModalEditIndex(null)
    setServiceModalOpen(service)
  }

  function openServiceModalForEdit(service: OpenServiceKey, index: number) {
    setServiceModalEditIndex(index)
    setServiceModalOpen(service)
  }

  function closeServiceModal() {
    setServiceModalOpen(null)
    setServiceModalEditIndex(null)
  }

  return {
    form,
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    errors,
    possuiApelido,
    possuiEnderecoCorrespondencia,
    isLoading,
    isOperationsLoading,
    isTicketTypesLoading,
    isTicketNaturesLoading,
    isTicketsLoading,
    isTeamsLoading,
    operations,
    ticketTypes,
    ticketNatures,
    tickets,
    teams,
    files,
    openSections,
    serviceModalOpen,
    serviceModalEditIndex,
    ticketSearch,
    ticketPopoverOpen,
    selectedTicketLabel,

    focalPoints,
    buscaPorPlaca,
    buscaPorRadar,
    cercoEletronico,
    buscaPorImagem,
    placasCorrelatas,
    placasConjuntas,
    reservaDeImagem,
    analiseDeImagem,
    outros,

    defaultValues,

    setTicketSearch,
    setTicketPopoverOpen,
    setSelectedTicketLabel,

    toggleSection,
    onDropFiles,
    removeFile,
    onSubmit,
    onSubmitFromEmail,
    handleOpenService,
    openServiceModalForEdit,
    closeServiceModal,
  }
}
