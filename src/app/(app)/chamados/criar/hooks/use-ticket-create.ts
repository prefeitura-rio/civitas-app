'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { getTicketNatures } from '@/http/get-ticket-natures/get-ticket-natures'
import { getOperations } from '@/http/operations/get-operations'
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

export function useTicketCreate() {
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
      requisitante: {
        requisitante_nome: '',
        requisitante_telefone: '',
        requisitante_email: null,
      },
      pontos_focais: [],
      equipe_id: '',
      prioridade: 'ROTINA',
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

  const createMutation = useMutation({
    mutationFn: async (payload: TicketCreateForm) =>
      createTicket(payload, files),
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

  const isOperationsLoading = operationsQuery.isLoading
  const isTicketTypesLoading = ticketTypesQuery.isLoading
  const isTicketNaturesLoading = ticketNaturesQuery.isLoading
  const isTicketsLoading = ticketsQuery.isLoading
  const isLoading = isSubmitting || createMutation.isPending

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  function onDropFiles(inputFiles: FileList | null) {
    if (!inputFiles) return
    const next = Array.from(inputFiles)
    setFiles((prev) => [...prev, ...next])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: TicketCreateForm) {
    const payload = buildTicketCreatePayload(data)
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
    isLoading,
    isOperationsLoading,
    isTicketTypesLoading,
    isTicketNaturesLoading,
    isTicketsLoading,
    operations,
    ticketTypes,
    ticketNatures,
    tickets,
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
    handleOpenService,
    openServiceModalForEdit,
    closeServiceModal,
  }
}
