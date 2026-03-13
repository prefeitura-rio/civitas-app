'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Slider from '@radix-ui/react-slider'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  SquareCheck,
  Trash,
  Upload,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Control, UseFormRegister } from 'react-hook-form'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  type TicketCreateForm as TicketCreateFormType,
  ticketCreateSchema,
} from '@/contexts/tickets-create-context'
import { getTicketNatures } from '@/http/get-ticket-natures/get-ticket-natures'
import { getOperations } from '@/http/operations/get-operations'
import { getTicketTypes } from '@/http/ticket-types/get-ticket.types'
import { createTicket } from '@/http/tickets/create-ticket'
import { getTicketsSelect } from '@/http/tickets/get-tickets-list'
import { dateConfig } from '@/lib/date-config'
import { genericErrorMessage } from '@/utils/error-handlers'

import styles from './ticket-create-form.module.css'

const MOCK_TEAMS = [
  { id: '1', title: 'Equipe A' },
  { id: '2', title: 'Equipe B' },
]

type OpenServiceKey =
  | 'busca_por_placa'
  | 'busca_por_radar'
  | 'cerco_eletronico'
  | 'busca_por_imagem'
  | 'placas_correlatas'
  | 'placas_conjuntas'
  | 'reserva_de_imagem'
  | 'analise_de_imagem'
  | 'outros'
  | null

type DetectionType = 'ANTES' | 'DEPOIS' | 'AMBOS' | null

type BuscaPorPlacaDraft = {
  period_start: string
  period_end: string
  plate: string
}

type BuscaPorRadarDraft = {
  period_start: string
  period_end: string
  plate: string
  radar_address: string
}

type CercoEletronicoDraft = {
  plate: string
  vehicle_observations: string
}

type BuscaPorImagemDraft = {
  period_start: string
  period_end: string
  plate: string
  address: string
  description: string
}

type CorrelataDraft = {
  period_start: string
  period_end: string
  plate: string
  interest_interval_minutes: number
  detection_count: number
  detection: DetectionType
}

type ReservaImagemDraft = {
  period_start: string
  period_end: string
  orientation: string
}

type AnaliseImagemDraft = {
  period_start: string
  period_end: string
  orientation: string
}

type OutrosDraft = {
  orientation: string
}

type SectionKey =
  | 'info'
  | 'requester'
  | 'services'
  | 'internal'
  | 'comment'
  | 'attachments'

function emptyBuscaPorPlacaDraft(): BuscaPorPlacaDraft {
  return {
    period_start: '',
    period_end: '',
    plate: '',
  }
}

function emptyBuscaPorRadarDraft(): BuscaPorRadarDraft {
  return {
    period_start: '',
    period_end: '',
    plate: '',
    radar_address: '',
  }
}

function emptyCercoDraft(): CercoEletronicoDraft {
  return {
    plate: '',
    vehicle_observations: '',
  }
}

function emptyBuscaPorImagemDraft(): BuscaPorImagemDraft {
  return {
    period_start: '',
    period_end: '',
    plate: '',
    address: '',
    description: '',
  }
}

function emptyCorrelataDraft(): CorrelataDraft {
  return {
    period_start: '',
    period_end: '',
    plate: '',
    interest_interval_minutes: 1,
    detection_count: 10,
    detection: null,
  }
}

function emptyReservaImagemDraft(): ReservaImagemDraft {
  return {
    period_start: '',
    period_end: '',
    orientation: '',
  }
}

function emptyAnaliseImagemDraft(): AnaliseImagemDraft {
  return {
    period_start: '',
    period_end: '',
    orientation: '',
  }
}

function emptyOutrosDraft(): OutrosDraft {
  return {
    orientation: '',
  }
}

function emptyToNull(value?: string | null) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function nullIfEmpty(value: string) {
  return emptyToNull(value)
}

function numberOrNull(value: string | number | null | undefined) {
  if (value == null || value === '') return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}

function toIsoDateTime(value?: string | null) {
  const normalized = emptyToNull(value)
  if (!normalized) return null

  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null

  return date.toISOString()
}

function buildTicketCreatePayload(
  data: TicketCreateFormType,
): TicketCreateFormType {
  return {
    ...data,
    associar_chamado_id: emptyToNull(data.associar_chamado_id),
    operation_id: data.operation_id,
    numero_procedimento: emptyToNull(data.numero_procedimento),
    numero_oficio: emptyToNull(data.numero_oficio),
    data_base: emptyToNull(data.data_base),
    natureza_id: emptyToNull(data.natureza_id),
    apelido_imprensa: emptyToNull(data.apelido_imprensa),
    link_materia: emptyToNull(data.link_materia),
    equipe_id: data.equipe_id,
    comentario_inicial: emptyToNull(data.comentario_inicial),

    requisitante: {
      requisitante_nome: data.requisitante.requisitante_nome.trim(),
      requisitante_telefone: emptyToNull(
        data.requisitante.requisitante_telefone,
      ),
      requisitante_email: emptyToNull(data.requisitante.requisitante_email),
    },

    pontos_focais: data.pontos_focais.map((fp) => ({
      nome: fp.nome.trim(),
      telefone: emptyToNull(fp.telefone),
      email: emptyToNull(fp.email),
    })),

    busca_por_placa: data.busca_por_placa.map((item) => ({
      plate: item.plate.trim(),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
    })),

    busca_por_radar: data.busca_por_radar.map((item) => ({
      plate: item.plate.trim(),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      radar_address: emptyToNull(item.radar_address),
    })),

    cerco_eletronico: data.cerco_eletronico.map((item) => ({
      plate: item.plate.trim(),
      vehicle_observations: emptyToNull(item.vehicle_observations),
    })),

    busca_por_imagem: data.busca_por_imagem.map((item) => ({
      plate: emptyToNull(item.plate),
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      address: emptyToNull(item.address),
      description: emptyToNull(item.description),
    })),

    placas_correlatas: data.placas_correlatas.map((group) => ({
      interest_interval_minutes: numberOrNull(group.interest_interval_minutes),
      detection_count: numberOrNull(group.detection_count),
      detection: group.detection ?? null,
      items: (group.items ?? []).map((item) => ({
        plate: item.plate.trim(),
        period_start: toIsoDateTime(item.period_start),
        period_end: toIsoDateTime(item.period_end),
      })),
    })),

    placas_conjuntas: data.placas_conjuntas.map((group) => ({
      interest_interval_minutes: numberOrNull(group.interest_interval_minutes),
      detection_count: numberOrNull(group.detection_count),
      detection: group.detection ?? null,
      items: (group.items ?? []).map((item) => ({
        plate: item.plate.trim(),
        period_start: toIsoDateTime(item.period_start),
        period_end: toIsoDateTime(item.period_end),
      })),
    })),

    reserva_de_imagem: data.reserva_de_imagem.map((item) => ({
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      orientation: emptyToNull(item.orientation),
    })),

    analise_de_imagem: data.analise_de_imagem.map((item) => ({
      period_start: toIsoDateTime(item.period_start),
      period_end: toIsoDateTime(item.period_end),
      orientation: emptyToNull(item.orientation),
    })),

    outros: data.outros.map((item) => ({
      orientation: emptyToNull(item.orientation),
    })),
  }
}

export function TicketCreateForm() {
  const [files, setFiles] = useState<File[]>([])
  const [serviceModalOpen, setServiceModalOpen] =
    useState<OpenServiceKey | null>(null)
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

  const [buscaPorPlacaDraft, setBuscaPorPlacaDraft] =
    useState<BuscaPorPlacaDraft>(emptyBuscaPorPlacaDraft())
  const [buscaPorRadarDraft, setBuscaPorRadarDraft] =
    useState<BuscaPorRadarDraft>(emptyBuscaPorRadarDraft())
  const [cercoDraft, setCercoDraft] =
    useState<CercoEletronicoDraft>(emptyCercoDraft())
  const [buscaPorImagemDraft, setBuscaPorImagemDraft] =
    useState<BuscaPorImagemDraft>(emptyBuscaPorImagemDraft())
  const [placasCorrelatasDraft, setPlacasCorrelatasDraft] =
    useState<CorrelataDraft>(emptyCorrelataDraft())
  const [placasConjuntasDraft, setPlacasConjuntasDraft] =
    useState<CorrelataDraft>(emptyCorrelataDraft())
  const [reservaImagemDraft, setReservaImagemDraft] =
    useState<ReservaImagemDraft>(emptyReservaImagemDraft())
  const [analiseImagemDraft, setAnaliseImagemDraft] =
    useState<AnaliseImagemDraft>(emptyAnaliseImagemDraft())
  const [outrosDraft, setOutrosDraft] =
    useState<OutrosDraft>(emptyOutrosDraft())

  const defaultValues = useMemo<TicketCreateFormType>(
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
        requisitante_telefone: null,
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

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TicketCreateFormType>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues,
  })

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

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: TicketCreateFormType) =>
      createTicket(payload, files),
    onSuccess: () => {
      toast.success('Chamado criado com sucesso.')
      reset(defaultValues)
      setFiles([])
      setServiceModalOpen(null)
      setServiceModalEditIndex(null)
      setBuscaPorPlacaDraft(emptyBuscaPorPlacaDraft())
      setBuscaPorRadarDraft(emptyBuscaPorRadarDraft())
      setCercoDraft(emptyCercoDraft())
      setBuscaPorImagemDraft(emptyBuscaPorImagemDraft())
      setPlacasCorrelatasDraft(emptyCorrelataDraft())
      setPlacasConjuntasDraft(emptyCorrelataDraft())
      setReservaImagemDraft(emptyReservaImagemDraft())
      setAnaliseImagemDraft(emptyAnaliseImagemDraft())
      setOutrosDraft(emptyOutrosDraft())
      setSelectedTicketLabel('')
    },
    onError: () => toast.error(genericErrorMessage),
  })

  const { data: operationsResponse, isLoading: isOperationsLoading } = useQuery(
    {
      queryKey: ['operations', 'select'],
      queryFn: () =>
        getOperations({
          page: 1,
          size: 100,
        }),
    },
  )

  const { data: ticketTypesResponse, isLoading: isTicketTypesLoading } =
    useQuery({
      queryKey: ['ticket-types', 'select'],
      queryFn: () =>
        getTicketTypes({
          isActive: true,
        }),
    })

  const { data: ticketNaturesResponse, isLoading: isTicketNaturesLoading } =
    useQuery({
      queryKey: ['ticket-natures', 'select'],
      queryFn: () =>
        getTicketNatures({
          isActive: true,
        }),
    })

  const ticketTypes = ticketTypesResponse?.data?.items ?? []
  const ticketNatures = ticketNaturesResponse?.data?.items ?? []

  const operations = operationsResponse?.data?.items ?? []
  const isLoading = isSubmitting || isPending

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

  async function onSubmit(data: TicketCreateFormType) {
    const payload = buildTicketCreatePayload(data)
    await mutateAsync(payload)
  }

  function handleOpenService(service: OpenServiceKey) {
    setServiceModalEditIndex(null)
    setServiceModalOpen(service)
    switch (service) {
      case 'busca_por_placa':
        setBuscaPorPlacaDraft(emptyBuscaPorPlacaDraft())
        break
      case 'busca_por_radar':
        setBuscaPorRadarDraft(emptyBuscaPorRadarDraft())
        break
      case 'cerco_eletronico':
        setCercoDraft(emptyCercoDraft())
        break
      case 'busca_por_imagem':
        setBuscaPorImagemDraft(emptyBuscaPorImagemDraft())
        break
      case 'placas_correlatas':
        setPlacasCorrelatasDraft(emptyCorrelataDraft())
        break
      case 'placas_conjuntas':
        setPlacasConjuntasDraft(emptyCorrelataDraft())
        break
      case 'reserva_de_imagem':
        setReservaImagemDraft(emptyReservaImagemDraft())
        break
      case 'analise_de_imagem':
        setAnaliseImagemDraft(emptyAnaliseImagemDraft())
        break
      case 'outros':
        setOutrosDraft(emptyOutrosDraft())
        break
      default:
        break
    }
  }

  function openServiceModalForEdit(service: OpenServiceKey, index: number) {
    const values = getValues()
    setServiceModalEditIndex(index)
    setServiceModalOpen(service)
    switch (service) {
      case 'busca_por_placa': {
        const item = values.busca_por_placa?.[index]
        if (item)
          setBuscaPorPlacaDraft({
            plate: item.plate ?? '',
            period_start: item.period_start ?? '',
            period_end: item.period_end ?? '',
          })
        break
      }
      case 'busca_por_radar': {
        const item = values.busca_por_radar?.[index]
        if (item)
          setBuscaPorRadarDraft({
            plate: item.plate ?? '',
            period_start: item.period_start ?? '',
            period_end: item.period_end ?? '',
            radar_address: item.radar_address ?? '',
          })
        break
      }
      case 'cerco_eletronico': {
        const item = values.cerco_eletronico?.[index]
        if (item)
          setCercoDraft({
            plate: item.plate ?? '',
            vehicle_observations: item.vehicle_observations ?? '',
          })
        break
      }
      case 'busca_por_imagem': {
        const item = values.busca_por_imagem?.[index]
        if (item)
          setBuscaPorImagemDraft({
            plate: item.plate ?? '',
            period_start: item.period_start ?? '',
            period_end: item.period_end ?? '',
            address: item.address ?? '',
            description: item.description ?? '',
          })
        break
      }
      case 'placas_correlatas': {
        const group = values.placas_correlatas?.[index]
        if (group) {
          const first = group.items?.[0]
          setPlacasCorrelatasDraft({
            period_start: first?.period_start ?? '',
            period_end: first?.period_end ?? '',
            plate: first?.plate ?? '',
            interest_interval_minutes: group.interest_interval_minutes ?? 1,
            detection_count: group.detection_count ?? 10,
            detection: group.detection ?? null,
          })
        }
        break
      }
      case 'placas_conjuntas': {
        const group = values.placas_conjuntas?.[index]
        if (group) {
          const first = group.items?.[0]
          setPlacasConjuntasDraft({
            period_start: first?.period_start ?? '',
            period_end: first?.period_end ?? '',
            plate: first?.plate ?? '',
            interest_interval_minutes: group.interest_interval_minutes ?? 1,
            detection_count: group.detection_count ?? 10,
            detection: group.detection ?? null,
          })
        }
        break
      }
      case 'reserva_de_imagem': {
        const item = values.reserva_de_imagem?.[index]
        if (item)
          setReservaImagemDraft({
            period_start: item.period_start ?? '',
            period_end: item.period_end ?? '',
            orientation: item.orientation ?? '',
          })
        break
      }
      case 'analise_de_imagem': {
        const item = values.analise_de_imagem?.[index]
        if (item)
          setAnaliseImagemDraft({
            period_start: item.period_start ?? '',
            period_end: item.period_end ?? '',
            orientation: item.orientation ?? '',
          })
        break
      }
      case 'outros': {
        const item = values.outros?.[index]
        if (item)
          setOutrosDraft({
            orientation: item.orientation ?? '',
          })
        break
      }
      default:
        break
    }
  }

  function closeServiceModal() {
    setServiceModalOpen(null)
    setServiceModalEditIndex(null)
  }

  function handleSaveServiceModal() {
    const idx = serviceModalEditIndex
    const service = serviceModalOpen
    if (!service) return

    if (idx !== null) {
      switch (service) {
        case 'busca_por_placa':
          setValue(`busca_por_placa.${idx}.plate`, buscaPorPlacaDraft.plate)
          setValue(
            `busca_por_placa.${idx}.period_start`,
            nullIfEmpty(buscaPorPlacaDraft.period_start),
          )
          setValue(
            `busca_por_placa.${idx}.period_end`,
            nullIfEmpty(buscaPorPlacaDraft.period_end),
          )
          break
        case 'busca_por_radar':
          setValue(`busca_por_radar.${idx}.plate`, buscaPorRadarDraft.plate)
          setValue(
            `busca_por_radar.${idx}.period_start`,
            nullIfEmpty(buscaPorRadarDraft.period_start),
          )
          setValue(
            `busca_por_radar.${idx}.period_end`,
            nullIfEmpty(buscaPorRadarDraft.period_end),
          )
          setValue(
            `busca_por_radar.${idx}.radar_address`,
            nullIfEmpty(buscaPorRadarDraft.radar_address),
          )
          break
        case 'cerco_eletronico':
          setValue(`cerco_eletronico.${idx}.plate`, cercoDraft.plate)
          setValue(
            `cerco_eletronico.${idx}.vehicle_observations`,
            nullIfEmpty(cercoDraft.vehicle_observations),
          )
          break
        case 'busca_por_imagem':
          setValue(
            `busca_por_imagem.${idx}.plate`,
            nullIfEmpty(buscaPorImagemDraft.plate),
          )
          setValue(
            `busca_por_imagem.${idx}.period_start`,
            nullIfEmpty(buscaPorImagemDraft.period_start),
          )
          setValue(
            `busca_por_imagem.${idx}.period_end`,
            nullIfEmpty(buscaPorImagemDraft.period_end),
          )
          setValue(
            `busca_por_imagem.${idx}.address`,
            nullIfEmpty(buscaPorImagemDraft.address),
          )
          setValue(
            `busca_por_imagem.${idx}.description`,
            nullIfEmpty(buscaPorImagemDraft.description),
          )
          break
        case 'placas_correlatas':
          setValue(
            `placas_correlatas.${idx}.interest_interval_minutes`,
            placasCorrelatasDraft.interest_interval_minutes,
          )
          setValue(
            `placas_correlatas.${idx}.detection_count`,
            placasCorrelatasDraft.detection_count,
          )
          setValue(
            `placas_correlatas.${idx}.detection`,
            placasCorrelatasDraft.detection,
          )
          setValue(
            `placas_correlatas.${idx}.items.0.plate`,
            placasCorrelatasDraft.plate,
          )
          setValue(
            `placas_correlatas.${idx}.items.0.period_start`,
            nullIfEmpty(placasCorrelatasDraft.period_start),
          )
          setValue(
            `placas_correlatas.${idx}.items.0.period_end`,
            nullIfEmpty(placasCorrelatasDraft.period_end),
          )
          break
        case 'placas_conjuntas':
          setValue(
            `placas_conjuntas.${idx}.interest_interval_minutes`,
            placasConjuntasDraft.interest_interval_minutes,
          )
          setValue(
            `placas_conjuntas.${idx}.detection_count`,
            placasConjuntasDraft.detection_count,
          )
          setValue(
            `placas_conjuntas.${idx}.detection`,
            placasConjuntasDraft.detection,
          )
          setValue(
            `placas_conjuntas.${idx}.items.0.plate`,
            placasConjuntasDraft.plate,
          )
          setValue(
            `placas_conjuntas.${idx}.items.0.period_start`,
            nullIfEmpty(placasConjuntasDraft.period_start),
          )
          setValue(
            `placas_conjuntas.${idx}.items.0.period_end`,
            nullIfEmpty(placasConjuntasDraft.period_end),
          )
          break
        case 'reserva_de_imagem':
          setValue(
            `reserva_de_imagem.${idx}.period_start`,
            nullIfEmpty(reservaImagemDraft.period_start),
          )
          setValue(
            `reserva_de_imagem.${idx}.period_end`,
            nullIfEmpty(reservaImagemDraft.period_end),
          )
          setValue(
            `reserva_de_imagem.${idx}.orientation`,
            nullIfEmpty(reservaImagemDraft.orientation),
          )
          break
        case 'analise_de_imagem':
          setValue(
            `analise_de_imagem.${idx}.period_start`,
            nullIfEmpty(analiseImagemDraft.period_start),
          )
          setValue(
            `analise_de_imagem.${idx}.period_end`,
            nullIfEmpty(analiseImagemDraft.period_end),
          )
          setValue(
            `analise_de_imagem.${idx}.orientation`,
            nullIfEmpty(analiseImagemDraft.orientation),
          )
          break
        case 'outros':
          setValue(
            `outros.${idx}.orientation`,
            nullIfEmpty(outrosDraft.orientation),
          )
          break
        default:
          break
      }
    } else {
      switch (service) {
        case 'busca_por_placa':
          buscaPorPlaca.append({
            plate: buscaPorPlacaDraft.plate,
            period_start: nullIfEmpty(buscaPorPlacaDraft.period_start),
            period_end: nullIfEmpty(buscaPorPlacaDraft.period_end),
          })
          setBuscaPorPlacaDraft(emptyBuscaPorPlacaDraft())
          break
        case 'busca_por_radar':
          buscaPorRadar.append({
            plate: buscaPorRadarDraft.plate,
            period_start: nullIfEmpty(buscaPorRadarDraft.period_start),
            period_end: nullIfEmpty(buscaPorRadarDraft.period_end),
            radar_address: nullIfEmpty(buscaPorRadarDraft.radar_address),
          })
          setBuscaPorRadarDraft(emptyBuscaPorRadarDraft())
          break
        case 'cerco_eletronico':
          cercoEletronico.append({
            plate: cercoDraft.plate,
            vehicle_observations: nullIfEmpty(cercoDraft.vehicle_observations),
          })
          setCercoDraft(emptyCercoDraft())
          break
        case 'busca_por_imagem':
          buscaPorImagem.append({
            plate: nullIfEmpty(buscaPorImagemDraft.plate),
            period_start: nullIfEmpty(buscaPorImagemDraft.period_start),
            period_end: nullIfEmpty(buscaPorImagemDraft.period_end),
            address: nullIfEmpty(buscaPorImagemDraft.address),
            description: nullIfEmpty(buscaPorImagemDraft.description),
          })
          setBuscaPorImagemDraft(emptyBuscaPorImagemDraft())
          break
        case 'placas_correlatas':
          placasCorrelatas.append({
            interest_interval_minutes:
              placasCorrelatasDraft.interest_interval_minutes,
            detection_count: placasCorrelatasDraft.detection_count,
            detection: placasCorrelatasDraft.detection,
            items: [
              {
                plate: placasCorrelatasDraft.plate,
                period_start: nullIfEmpty(placasCorrelatasDraft.period_start),
                period_end: nullIfEmpty(placasCorrelatasDraft.period_end),
              },
            ],
          })
          setPlacasCorrelatasDraft(emptyCorrelataDraft())
          break
        case 'placas_conjuntas':
          placasConjuntas.append({
            interest_interval_minutes:
              placasConjuntasDraft.interest_interval_minutes,
            detection_count: placasConjuntasDraft.detection_count,
            detection: placasConjuntasDraft.detection,
            items: [
              {
                plate: placasConjuntasDraft.plate,
                period_start: nullIfEmpty(placasConjuntasDraft.period_start),
                period_end: nullIfEmpty(placasConjuntasDraft.period_end),
              },
            ],
          })
          setPlacasConjuntasDraft(emptyCorrelataDraft())
          break
        case 'reserva_de_imagem':
          reservaDeImagem.append({
            period_start: nullIfEmpty(reservaImagemDraft.period_start),
            period_end: nullIfEmpty(reservaImagemDraft.period_end),
            orientation: nullIfEmpty(reservaImagemDraft.orientation),
          })
          setReservaImagemDraft(emptyReservaImagemDraft())
          break
        case 'analise_de_imagem':
          analiseDeImagem.append({
            period_start: nullIfEmpty(analiseImagemDraft.period_start),
            period_end: nullIfEmpty(analiseImagemDraft.period_end),
            orientation: nullIfEmpty(analiseImagemDraft.orientation),
          })
          setAnaliseImagemDraft(emptyAnaliseImagemDraft())
          break
        case 'outros':
          outros.append({
            orientation: nullIfEmpty(outrosDraft.orientation),
          })
          setOutrosDraft(emptyOutrosDraft())
          break
        default:
          break
      }
    }
    closeServiceModal()
  }

  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketPopoverOpen, setTicketPopoverOpen] = useState(false)
  const [selectedTicketLabel, setSelectedTicketLabel] = useState('')

  const { data: ticketsResponse, isLoading: isTicketsLoading } = useQuery({
    queryKey: ['tickets', 'search', ticketSearch],
    queryFn: () =>
      getTicketsSelect({
        search: ticketSearch,
      }),
    enabled: ticketPopoverOpen && ticketSearch.trim().length > 0,
  })

  const tickets = ticketsResponse?.data ?? []

  return (
    <div className={styles.root}>
      <form
        className="mx-auto w-full max-w-5xl space-y-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={`${styles.sectionCard} ${styles.sectionCardFirst}`}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Associar chamado</Label>
              <Controller
                control={control}
                name="associar_chamado_id"
                render={({ field }) => (
                  <Popover
                    open={ticketPopoverOpen}
                    onOpenChange={setTicketPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        className={`h-11 w-full justify-between ${styles.inputBg} font-normal`}
                      >
                        <span className="truncate">
                          {selectedTicketLabel ||
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
                          value={ticketSearch}
                          onValueChange={setTicketSearch}
                        />

                        <CommandList>
                          {isTicketsLoading && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Buscando chamados...
                            </div>
                          )}

                          {!isTicketsLoading &&
                            ticketSearch.trim().length === 0 && (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                Digite para pesquisar.
                              </div>
                            )}

                          {!isTicketsLoading &&
                            ticketSearch.trim().length > 0 &&
                            tickets.length === 0 && (
                              <CommandEmpty>
                                Nenhum chamado encontrado.
                              </CommandEmpty>
                            )}

                          <CommandGroup>
                            {tickets.map((ticket) => (
                              <CommandItem
                                key={ticket.id}
                                value={`${ticket.id} ${ticket.titulo}`}
                                onSelect={() => {
                                  field.onChange(ticket.id)
                                  setSelectedTicketLabel(ticket.titulo)
                                  setTicketSearch(ticket.titulo)
                                  setTicketPopoverOpen(false)
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
                                  setSelectedTicketLabel('')
                                  setTicketSearch('')
                                  setTicketPopoverOpen(false)
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
              <Label className={styles.fieldLabel}>Tipo de chamado</Label>
              <Controller
                control={control}
                name="tipo_chamado_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading || isTicketTypesLoading}
                  >
                    <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContentForm}>
                      {ticketTypes.map((ticketType) => (
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
              {errors.tipo_chamado_id?.message && (
                <p className="text-xs text-destructive">
                  {errors.tipo_chamado_id.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Section
          title="Informações do chamado"
          isOpen={openSections.info}
          onToggle={() => toggleSection('info')}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Nº de procedimento</Label>
              <Input
                className={`h-11 ${styles.inputBg}`}
                disabled={isLoading}
                {...register('numero_procedimento')}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Nº do ofício</Label>
              <Input
                className={`h-11 ${styles.inputBg}`}
                disabled={isLoading}
                {...register('numero_oficio')}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Data base</Label>
              <Controller
                control={control}
                name="data_base"
                render={({ field }) => (
                  <DataBaseDatePicker
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Natureza</Label>
              <Controller
                control={control}
                name="natureza_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v || null)}
                    disabled={isLoading || isTicketNaturesLoading}
                  >
                    <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContentForm}>
                      {ticketNatures.map((nature) => (
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

            <div className="flex flex-wrap items-center gap-2 pt-2 md:col-span-2">
              <Label className={styles.fieldLabel}>
                Possui apelido pela imprensa?
              </Label>
              <Controller
                control={control}
                name="possui_apelido_imprensa"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="possui_apelido_imprensa"
                      size="sm"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className={styles.apelidoToggle}
                    />
                    <span className={styles.toggleLabel}>
                      {field.value ? 'Sim' : 'Não'}
                    </span>
                  </div>
                )}
              />
            </div>

            {possuiApelido && (
              <>
                <div className="space-y-1.5">
                  <Label className={styles.fieldLabel}>
                    Apelido pela imprensa
                  </Label>
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    disabled={isLoading}
                    {...register('apelido_imprensa')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className={styles.fieldLabel}>Link da matéria</Label>
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    disabled={isLoading}
                    placeholder="https://..."
                    {...register('link_materia')}
                  />
                  {errors.link_materia?.message && (
                    <p className="text-xs text-destructive">
                      {errors.link_materia.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Section>

        <Section
          title="Requisitante"
          isOpen={openSections.requester}
          onToggle={() => toggleSection('requester')}
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Demandante</Label>
              <Controller
                control={control}
                name="operation_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v || null)}
                    disabled={isLoading || isOperationsLoading}
                  >
                    <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContentForm}>
                      {operations.map((op) => (
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
              {errors.operation_id?.message && (
                <p className="text-xs text-destructive">
                  {errors.operation_id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Requisitante</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  disabled={isLoading}
                  {...register('requisitante.requisitante_nome')}
                />
                {errors.requisitante?.requisitante_nome?.message && (
                  <p className="text-xs text-destructive">
                    {errors.requisitante.requisitante_nome.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Telefone</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  disabled={isLoading}
                  {...register('requisitante.requisitante_telefone')}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Email</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  disabled={isLoading}
                  {...register('requisitante.requisitante_email')}
                />
                {errors.requisitante?.requisitante_email?.message && (
                  <p className="text-xs text-destructive">
                    {errors.requisitante.requisitante_email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <button
                type="button"
                disabled={isLoading || focalPoints.fields.length >= 20}
                onClick={() =>
                  focalPoints.append({
                    nome: '',
                    telefone: null,
                    email: null,
                  })
                }
                className={styles.addPointFocalButton}
              >
                <Plus className="h-5 w-5 shrink-0" aria-hidden />
                Adicionar Ponto Focal
              </button>
            </div>

            <div className="space-y-3">
              {focalPoints.fields.map((fp, idx) => (
                <div
                  key={fp.id}
                  className="grid grid-cols-1 gap-3 md:grid-cols-3"
                >
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Ponto focal</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      disabled={isLoading}
                      {...register(`pontos_focais.${idx}.nome`)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Telefone</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      disabled={isLoading}
                      {...register(`pontos_focais.${idx}.telefone`)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Email</Label>
                    <div className="flex gap-2">
                      <Input
                        className={`h-11 ${styles.inputBg}`}
                        disabled={isLoading}
                        {...register(`pontos_focais.${idx}.email`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 w-11 p-0"
                        disabled={isLoading}
                        onClick={() => focalPoints.remove(idx)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.pontos_focais?.message && (
              <p className="text-xs text-destructive">
                {errors.pontos_focais.message as string}
              </p>
            )}
          </div>
        </Section>

        <Section
          title="Serviços"
          isOpen={openSections.services}
          onToggle={() => toggleSection('services')}
        >
          <div className={styles.serviceGrid}>
            <ServiceAddCard
              title="Busca por placa"
              onAdd={() => handleOpenService('busca_por_placa')}
            />
            <ServiceAddCard
              title="Busca por radar"
              onAdd={() => handleOpenService('busca_por_radar')}
            />
            <ServiceAddCard
              title="Cerco"
              onAdd={() => handleOpenService('cerco_eletronico')}
            />
            <ServiceAddCard
              title="Imagem"
              onAdd={() => handleOpenService('busca_por_imagem')}
            />
            <ServiceAddCard
              title="Placas correlatas"
              onAdd={() => handleOpenService('placas_correlatas')}
            />
            <ServiceAddCard
              title="Placas conjuntas"
              onAdd={() => handleOpenService('placas_conjuntas')}
            />
            <ServiceAddCard
              title="Reserva de imagem"
              onAdd={() => handleOpenService('reserva_de_imagem')}
            />
            <ServiceAddCard
              title="Análise de imagem"
              onAdd={() => handleOpenService('analise_de_imagem')}
            />
            <ServiceAddCard
              title="Outros"
              onAdd={() => handleOpenService('outros')}
            />
          </div>

          <Dialog
            open={!!serviceModalOpen}
            onOpenChange={(open) => !open && closeServiceModal()}
          >
            <DialogContent className={styles.serviceModal}>
              <DialogHeader className={styles.serviceModalHeader}>
                <DialogTitle className={styles.serviceModalTitle}>
                  {serviceModalOpen === 'busca_por_placa'
                    ? 'Busca por placa'
                    : serviceModalOpen === 'busca_por_radar'
                      ? 'Busca por radar'
                      : serviceModalOpen === 'cerco_eletronico'
                        ? 'Cerco eletrônico'
                        : serviceModalOpen === 'busca_por_imagem'
                          ? 'Busca por imagem'
                          : serviceModalOpen === 'placas_correlatas'
                            ? 'Placas correlatas'
                            : serviceModalOpen === 'placas_conjuntas'
                              ? 'Placas conjuntas'
                              : serviceModalOpen === 'reserva_de_imagem'
                                ? 'Reserva de imagem'
                                : serviceModalOpen === 'analise_de_imagem'
                                  ? 'Análise de imagem'
                                  : serviceModalOpen === 'outros'
                                    ? 'Outros'
                                    : ''}
                </DialogTitle>
              </DialogHeader>

              <div className={styles.serviceModalBody}>
                {serviceModalOpen === 'busca_por_placa' && (
                  <div className="space-y-3">
                    <PeriodFieldsCalendarStyle
                      startValue={buscaPorPlacaDraft.period_start}
                      endValue={buscaPorPlacaDraft.period_end}
                      onChangeStart={(value) =>
                        setBuscaPorPlacaDraft((prev) => ({
                          ...prev,
                          period_start: value,
                        }))
                      }
                      onChangeEnd={(value) =>
                        setBuscaPorPlacaDraft((prev) => ({
                          ...prev,
                          period_end: value,
                        }))
                      }
                    />
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>
                        Placa do veículo
                      </Label>
                      <Input
                        className={`h-11 ${styles.inputBg}`}
                        value={buscaPorPlacaDraft.plate}
                        onChange={(e) =>
                          setBuscaPorPlacaDraft((prev) => ({
                            ...prev,
                            plate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {serviceModalOpen === 'busca_por_radar' && (
                  <div className="space-y-3">
                    <PeriodFieldsCalendarStyle
                      startValue={buscaPorRadarDraft.period_start}
                      endValue={buscaPorRadarDraft.period_end}
                      onChangeStart={(value) =>
                        setBuscaPorRadarDraft((prev) => ({
                          ...prev,
                          period_start: value,
                        }))
                      }
                      onChangeEnd={(value) =>
                        setBuscaPorRadarDraft((prev) => ({
                          ...prev,
                          period_end: value,
                        }))
                      }
                    />
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>
                        Placa do veículo
                      </Label>
                      <Input
                        className={`h-11 ${styles.inputBg}`}
                        value={buscaPorRadarDraft.plate}
                        onChange={(e) =>
                          setBuscaPorRadarDraft((prev) => ({
                            ...prev,
                            plate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>Orientação</Label>
                      <Textarea
                        className={`min-h-[92px] ${styles.inputBg}`}
                        value={buscaPorRadarDraft.radar_address}
                        onChange={(e) =>
                          setBuscaPorRadarDraft((prev) => ({
                            ...prev,
                            radar_address: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {serviceModalOpen === 'cerco_eletronico' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>
                        Placa do veículo
                      </Label>
                      <Input
                        className={`h-11 ${styles.inputBg}`}
                        value={cercoDraft.plate}
                        onChange={(e) =>
                          setCercoDraft((prev) => ({
                            ...prev,
                            plate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>
                        Observações do veículo
                      </Label>
                      <Textarea
                        className={`min-h-[92px] ${styles.inputBg}`}
                        value={cercoDraft.vehicle_observations}
                        onChange={(e) =>
                          setCercoDraft((prev) => ({
                            ...prev,
                            vehicle_observations: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {serviceModalOpen === 'busca_por_imagem' && (
                  <div className="space-y-3">
                    <PeriodFieldsCalendarStyle
                      startValue={buscaPorImagemDraft.period_start}
                      endValue={buscaPorImagemDraft.period_end}
                      onChangeStart={(value) =>
                        setBuscaPorImagemDraft((prev) => ({
                          ...prev,
                          period_start: value,
                        }))
                      }
                      onChangeEnd={(value) =>
                        setBuscaPorImagemDraft((prev) => ({
                          ...prev,
                          period_end: value,
                        }))
                      }
                    />
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>
                        Placa do veículo
                      </Label>
                      <Input
                        className={`h-11 ${styles.inputBg}`}
                        value={buscaPorImagemDraft.plate}
                        onChange={(e) =>
                          setBuscaPorImagemDraft((prev) => ({
                            ...prev,
                            plate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>Endereço</Label>
                      <Input
                        className={`h-11 ${styles.inputBg}`}
                        value={buscaPorImagemDraft.address}
                        onChange={(e) =>
                          setBuscaPorImagemDraft((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>Orientação</Label>
                      <Textarea
                        className={`min-h-[110px] ${styles.inputBg}`}
                        value={buscaPorImagemDraft.description}
                        onChange={(e) =>
                          setBuscaPorImagemDraft((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {serviceModalOpen === 'placas_correlatas' && (
                  <CorrelataPanel
                    draft={placasCorrelatasDraft}
                    setDraft={setPlacasCorrelatasDraft}
                    onAdd={() => {}}
                    hideAddButton
                    useCalendarStyle
                  />
                )}

                {serviceModalOpen === 'placas_conjuntas' && (
                  <CorrelataPanel
                    draft={placasConjuntasDraft}
                    setDraft={setPlacasConjuntasDraft}
                    onAdd={() => {}}
                    hideAddButton
                    useCalendarStyle
                  />
                )}

                {serviceModalOpen === 'reserva_de_imagem' && (
                  <div className="space-y-3">
                    <PeriodFieldsCalendarStyle
                      startValue={reservaImagemDraft.period_start}
                      endValue={reservaImagemDraft.period_end}
                      onChangeStart={(value) =>
                        setReservaImagemDraft((prev) => ({
                          ...prev,
                          period_start: value,
                        }))
                      }
                      onChangeEnd={(value) =>
                        setReservaImagemDraft((prev) => ({
                          ...prev,
                          period_end: value,
                        }))
                      }
                    />
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>Orientação</Label>
                      <Textarea
                        className={`min-h-[110px] ${styles.inputBg}`}
                        value={reservaImagemDraft.orientation}
                        onChange={(e) =>
                          setReservaImagemDraft((prev) => ({
                            ...prev,
                            orientation: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {serviceModalOpen === 'analise_de_imagem' && (
                  <div className="space-y-3">
                    <PeriodFieldsCalendarStyle
                      startValue={analiseImagemDraft.period_start}
                      endValue={analiseImagemDraft.period_end}
                      onChangeStart={(value) =>
                        setAnaliseImagemDraft((prev) => ({
                          ...prev,
                          period_start: value,
                        }))
                      }
                      onChangeEnd={(value) =>
                        setAnaliseImagemDraft((prev) => ({
                          ...prev,
                          period_end: value,
                        }))
                      }
                    />
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>Orientação</Label>
                      <Textarea
                        className={`min-h-[110px] ${styles.inputBg}`}
                        value={analiseImagemDraft.orientation}
                        onChange={(e) =>
                          setAnaliseImagemDraft((prev) => ({
                            ...prev,
                            orientation: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {serviceModalOpen === 'outros' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className={styles.fieldLabel}>Orientação</Label>
                      <Textarea
                        className={`min-h-[110px] ${styles.inputBg}`}
                        value={outrosDraft.orientation}
                        onChange={(e) =>
                          setOutrosDraft((prev) => ({
                            ...prev,
                            orientation: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className={styles.serviceModalFooter}>
                <Button
                  type="button"
                  variant="secondary"
                  className={styles.cancelButton}
                  onClick={closeServiceModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleSaveServiceModal}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="mt-4 space-y-4">
            <ServiceList
              label="Busca por placa"
              fields={buscaPorPlaca.fields}
              onRemove={buscaPorPlaca.remove}
              onEdit={(idx) => openServiceModalForEdit('busca_por_placa', idx)}
              renderRow={(idx) => (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Placa</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      disabled={isLoading}
                      {...register(`busca_por_placa.${idx}.plate`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Início</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`busca_por_placa.${idx}.period_start`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Fim</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`busca_por_placa.${idx}.period_end`)}
                    />
                  </div>
                </div>
              )}
            />

            <ServiceList
              label="Busca por radar"
              fields={buscaPorRadar.fields}
              onRemove={buscaPorRadar.remove}
              onEdit={(idx) => openServiceModalForEdit('busca_por_radar', idx)}
              renderRow={(idx) => (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Placa</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      disabled={isLoading}
                      {...register(`busca_por_radar.${idx}.plate`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Início</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`busca_por_radar.${idx}.period_start`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Fim</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`busca_por_radar.${idx}.period_end`)}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-3">
                    <Label className={styles.fieldLabel}>Orientação</Label>
                    <Textarea
                      className={styles.inputBg}
                      disabled={isLoading}
                      {...register(`busca_por_radar.${idx}.radar_address`)}
                    />
                  </div>
                </div>
              )}
            />

            <ServiceList
              label="Cerco eletrônico"
              fields={cercoEletronico.fields}
              onRemove={cercoEletronico.remove}
              onEdit={(idx) => openServiceModalForEdit('cerco_eletronico', idx)}
              renderRow={(idx) => (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Placa</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      disabled={isLoading}
                      {...register(`cerco_eletronico.${idx}.plate`)}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className={styles.fieldLabel}>
                      Observações do veículo
                    </Label>
                    <Textarea
                      className={styles.inputBg}
                      disabled={isLoading}
                      {...register(
                        `cerco_eletronico.${idx}.vehicle_observations`,
                      )}
                    />
                  </div>
                </div>
              )}
            />

            <ServiceList
              label="Busca por imagem"
              fields={buscaPorImagem.fields}
              onRemove={buscaPorImagem.remove}
              onEdit={(idx) => openServiceModalForEdit('busca_por_imagem', idx)}
              renderRow={(idx) => (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Placa</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      disabled={isLoading}
                      {...register(`busca_por_imagem.${idx}.plate`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Início</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`busca_por_imagem.${idx}.period_start`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Fim</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`busca_por_imagem.${idx}.period_end`)}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-3">
                    <Label className={styles.fieldLabel}>Endereço</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      disabled={isLoading}
                      {...register(`busca_por_imagem.${idx}.address`)}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-3">
                    <Label className={styles.fieldLabel}>Orientação</Label>
                    <Textarea
                      className={styles.inputBg}
                      disabled={isLoading}
                      {...register(`busca_por_imagem.${idx}.description`)}
                    />
                  </div>
                </div>
              )}
            />

            <ServiceList
              label="Placas correlatas"
              fields={placasCorrelatas.fields}
              onRemove={placasCorrelatas.remove}
              onEdit={(idx) =>
                openServiceModalForEdit('placas_correlatas', idx)
              }
              renderRow={(idx) => (
                <CorrelataListForm
                  register={register}
                  control={control}
                  index={idx}
                  name="placas_correlatas"
                  disabled={isLoading}
                />
              )}
            />

            <ServiceList
              label="Placas conjuntas"
              fields={placasConjuntas.fields}
              onRemove={placasConjuntas.remove}
              onEdit={(idx) => openServiceModalForEdit('placas_conjuntas', idx)}
              renderRow={(idx) => (
                <CorrelataListForm
                  register={register}
                  control={control}
                  index={idx}
                  name="placas_conjuntas"
                  disabled={isLoading}
                />
              )}
            />

            <ServiceList
              label="Reserva de imagem"
              fields={reservaDeImagem.fields}
              onRemove={reservaDeImagem.remove}
              onEdit={(idx) =>
                openServiceModalForEdit('reserva_de_imagem', idx)
              }
              renderRow={(idx) => (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Início</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`reserva_de_imagem.${idx}.period_start`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Fim</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`reserva_de_imagem.${idx}.period_end`)}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className={styles.fieldLabel}>Orientação</Label>
                    <Textarea
                      className={styles.inputBg}
                      disabled={isLoading}
                      {...register(`reserva_de_imagem.${idx}.orientation`)}
                    />
                  </div>
                </div>
              )}
            />

            <ServiceList
              label="Análise de imagem"
              fields={analiseDeImagem.fields}
              onRemove={analiseDeImagem.remove}
              onEdit={(idx) =>
                openServiceModalForEdit('analise_de_imagem', idx)
              }
              renderRow={(idx) => (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Início</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`analise_de_imagem.${idx}.period_start`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={styles.fieldLabel}>Fim</Label>
                    <Input
                      className={`h-11 ${styles.inputBg}`}
                      type="datetime-local"
                      disabled={isLoading}
                      {...register(`analise_de_imagem.${idx}.period_end`)}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className={styles.fieldLabel}>Orientação</Label>
                    <Textarea
                      className={styles.inputBg}
                      disabled={isLoading}
                      {...register(`analise_de_imagem.${idx}.orientation`)}
                    />
                  </div>
                </div>
              )}
            />

            <ServiceList
              label="Outros"
              fields={outros.fields}
              onRemove={outros.remove}
              onEdit={(idx) => openServiceModalForEdit('outros', idx)}
              renderRow={(idx) => (
                <div className="space-y-1.5">
                  <Label className={styles.fieldLabel}>Orientação</Label>
                  <Textarea
                    className={styles.inputBg}
                    disabled={isLoading}
                    {...register(`outros.${idx}.orientation`)}
                  />
                </div>
              )}
            />
          </div>
        </Section>

        <Section
          title="Locação interna"
          isOpen={openSections.internal}
          onToggle={() => toggleSection('internal')}
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Equipe</Label>
              <Controller
                control={control}
                name="equipe_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v || null)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContentForm}>
                      {MOCK_TEAMS.map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id}
                          className={styles.selectItemForm}
                        >
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.equipe_id?.message && (
                <p className="text-xs text-destructive">
                  {errors.equipe_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className={styles.fieldLabel}>Prioridade</Label>
              <div className="grid grid-cols-3 gap-3">
                <PriorityButton
                  active={watch('prioridade') === 'URGENTE'}
                  label="Urgente"
                  onClick={() => setValue('prioridade', 'URGENTE')}
                  disabled={isLoading}
                />
                <PriorityButton
                  active={watch('prioridade') === 'ALTA'}
                  label="Alta"
                  onClick={() => setValue('prioridade', 'ALTA')}
                  disabled={isLoading}
                />
                <PriorityButton
                  active={watch('prioridade') === 'ROTINA'}
                  label="Rotina"
                  onClick={() => setValue('prioridade', 'ROTINA')}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Adicionar comentário"
          isOpen={openSections.comment}
          onToggle={() => toggleSection('comment')}
        >
          <Textarea
            placeholder="Escreva um comentário"
            disabled={isLoading}
            className={`${styles.fakeEditor} ${styles.inputBg}`}
            {...register('comentario_inicial')}
          />
        </Section>

        <Section
          title="Anexar documentos"
          isOpen={openSections.attachments}
          onToggle={() => toggleSection('attachments')}
        >
          <div className={styles.attachmentsLayout}>
            <div className={styles.attachmentsDocumentList}>
              {files.length === 0 ? (
                <p className={styles.uploadBoxHint}>Nenhum arquivo anexado.</p>
              ) : (
                <div className={styles.fileList}>
                  {files.map((f, idx) => (
                    <div key={`${f.name}-${idx}`} className={styles.fileRow}>
                      <SquareCheck
                        className={`${styles.fileRowCheckIcon} shrink-0`}
                        aria-hidden
                      />
                      <p className={styles.fileRowFileName} title={f.name}>
                        {f.name}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        className={`${styles.fileRowDeleteBtn} h-8 w-8 shrink-0 p-0`}
                        onClick={() => removeFile(idx)}
                        disabled={isLoading}
                        title="Excluir anexo"
                      >
                        <Trash className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  ))}
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
                  onChange={(e) => onDropFiles(e.target.files)}
                  disabled={isLoading}
                />
                <Upload className="h-6 w-6 shrink-0 text-[var(--tc-icon-subtle)]" />
                <span className={styles.uploadBoxText}>
                  Clique para fazer upload ou arraste o arquivo
                </span>
                <span className={styles.uploadBoxHint}>
                  PDF, DOC, DOCX (máx. 10MB)
                </span>
              </label>
            </div>
          </div>
        </Section>

        <div className={styles.footerBar}>
          <div className={styles.footerInner}>
            <Button
              type="button"
              variant="secondary"
              className={styles.cancelButton}
              disabled={isLoading}
              onClick={() => reset(defaultValues)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className={styles.saveButton}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

function Section({
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
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>{title}</span>

        <button
          type="button"
          onClick={onToggle}
          className={styles.sectionToggle}
          aria-label={`Alternar seção ${title}`}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {isOpen && <div className={styles.sectionInner}>{children}</div>}
    </div>
  )
}

function ServiceAddCard({
  title,
  onAdd,
}: {
  title: string
  onAdd: () => void
}) {
  return (
    <button type="button" onClick={onAdd} className={styles.serviceCard}>
      <span className={styles.serviceCardTitle}>{title}</span>
      <span className={styles.plusBox}>
        <Plus className="h-4 w-4" />
      </span>
    </button>
  )
}

function parseDateString(s: string): Date | undefined {
  if (!s?.trim()) return undefined
  const d = new Date(s + 'T00:00:00')
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateTimeString(
  s: string,
): { date: Date; time: string } | undefined {
  if (!s?.trim()) return undefined
  const norm = s.includes('T') ? s : s + 'T00:00:00'
  const parsed = new Date(norm)
  if (Number.isNaN(parsed.getTime())) return undefined
  const time =
    s.includes('T') && s.length >= 16
      ? `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
      : '00:00'
  return { date: parsed, time }
}

function toDateTimeString(d: Date, time: string): string {
  const [h = '0', m = '0'] = time.split(':')
  const y = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(parseInt(h, 10)).padStart(2, '0')
  const min = String(parseInt(m, 10)).padStart(2, '0')
  return `${y}-${month}-${day}T${hour}:${min}`
}

function PeriodDatePickerField({
  value,
  onChange,
  disabled,
  defaultTime = '00:00',
  placeholder = 'Selecione a data',
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  defaultTime?: string
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const parsed = parseDateTimeString(value)
  const triggerLabel =
    parsed?.date != null
      ? format(parsed.date, dateConfig.formats.date, {
          locale: dateConfig.locale,
        })
      : placeholder

  const handleSelect = (d: Date | undefined) => {
    if (!d) return
    onChange(toDateTimeString(d, parsed?.time ?? defaultTime))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={`h-11 w-full justify-between text-left font-normal ${styles.inputBg}`}
        >
          <span className={!parsed?.date ? 'text-muted-foreground' : ''}>
            {triggerLabel}
          </span>
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parsed?.date}
          onSelect={handleSelect}
          locale={dateConfig.locale}
          defaultMonth={parsed?.date}
          className="rounded-lg border"
        />
      </PopoverContent>
    </Popover>
  )
}

function DataBaseDatePicker({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string | null) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const date = parseDateString(value)
  const triggerLabel = date
    ? format(date, dateConfig.formats.date, { locale: dateConfig.locale })
    : ''

  const handleSelect = (d: Date | undefined) => {
    if (!d) {
      onChange(null)
      return
    }
    onChange(toDateString(d))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={`h-11 w-full justify-between text-left font-normal ${styles.inputBg}`}
        >
          <span>{triggerLabel}</span>
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={dateConfig.locale}
          defaultMonth={date}
          className="rounded-lg border"
        />
      </PopoverContent>
    </Popover>
  )
}

function PeriodFields({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
}: {
  startValue: string
  endValue: string
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className={styles.fieldLabel}>Período da busca</Label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          className={`h-11 ${styles.inputBg}`}
          type="datetime-local"
          value={startValue}
          onChange={(e) => onChangeStart(e.target.value)}
        />
        <Input
          className={`h-11 ${styles.inputBg}`}
          type="datetime-local"
          value={endValue}
          onChange={(e) => onChangeEnd(e.target.value)}
        />
      </div>
    </div>
  )
}

/** Período da busca no mesmo estilo do campo Data base (botão + popover + calendário). */
function PeriodFieldsCalendarStyle({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
}: {
  startValue: string
  endValue: string
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className={styles.fieldLabel}>Período da busca</Label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <PeriodDatePickerField
          value={startValue}
          onChange={onChangeStart}
          defaultTime="00:00"
          placeholder="Data inicial"
        />
        <PeriodDatePickerField
          value={endValue}
          onChange={onChangeEnd}
          defaultTime="23:59"
          placeholder="Data final"
        />
      </div>
    </div>
  )
}

function RangeStatField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  disabled = false,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className={styles.fieldLabel}>{label}</Label>
        <p className="text-2xl font-semibold text-white">
          {value} {unit}
        </p>
      </div>

      <Slider.Root
        className={`relative flex h-6 w-full touch-none select-none items-center ${
          disabled ? 'pointer-events-none opacity-60' : ''
        }`}
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(values) => onChange(values[0] ?? min)}
      >
        <Slider.Track className="relative h-2 grow overflow-hidden rounded-full bg-slate-700">
          <Slider.Range className="absolute h-full rounded-full bg-cyan-400" />
        </Slider.Track>

        <Slider.Thumb
          className="block h-6 w-6 rounded-full border-2 border-cyan-400 bg-[#0f1724] shadow outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label={label}
        />
      </Slider.Root>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Min: {min} {unit}
        </span>
        <span>
          Max: {max} {unit}
        </span>
      </div>
    </div>
  )
}

function CorrelataPanel({
  draft,
  setDraft,
  onAdd,
  hideAddButton,
  useCalendarStyle,
}: {
  draft: CorrelataDraft
  setDraft: React.Dispatch<React.SetStateAction<CorrelataDraft>>
  onAdd: () => void
  hideAddButton?: boolean
  useCalendarStyle?: boolean
}) {
  const PeriodComponent = useCalendarStyle
    ? PeriodFieldsCalendarStyle
    : PeriodFields
  return (
    <div className="space-y-3">
      <PeriodComponent
        startValue={draft.period_start}
        endValue={draft.period_end}
        onChangeStart={(value) =>
          setDraft((prev) => ({ ...prev, period_start: value }))
        }
        onChangeEnd={(value) =>
          setDraft((prev) => ({ ...prev, period_end: value }))
        }
      />

      <div className="space-y-1.5">
        <Label className={styles.fieldLabel}>Placa do veículo</Label>
        <Input
          className={`h-11 ${styles.inputBg}`}
          value={draft.plate}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, plate: e.target.value }))
          }
        />
      </div>

      <RangeStatField
        label="Intervalo de interesse"
        value={draft.interest_interval_minutes}
        min={1}
        max={5}
        unit=""
        onChange={(value) =>
          setDraft((prev) => ({
            ...prev,
            interest_interval_minutes: value,
          }))
        }
      />

      <RangeStatField
        label="Quantidade de Detecção"
        value={draft.detection_count}
        min={5}
        max={50}
        unit=""
        onChange={(value) =>
          setDraft((prev) => ({
            ...prev,
            detection_count: value,
          }))
        }
      />

      <div className="space-y-1.5">
        <Label className={styles.fieldLabel}>Detecção</Label>
        <div className={styles.segmentedDetection}>
          <button
            type="button"
            className={`${styles.detectionButton} ${draft.detection === 'ANTES' ? styles.detectionButtonActive : ''}`}
            onClick={() =>
              setDraft((prev) => ({ ...prev, detection: 'ANTES' }))
            }
          >
            Antes
          </button>
          <button
            type="button"
            className={`${styles.detectionButton} ${draft.detection === 'DEPOIS' ? styles.detectionButtonActive : ''}`}
            onClick={() =>
              setDraft((prev) => ({ ...prev, detection: 'DEPOIS' }))
            }
          >
            Depois
          </button>
          <button
            type="button"
            className={`${styles.detectionButton} ${draft.detection === 'AMBOS' ? styles.detectionButtonActive : ''}`}
            onClick={() =>
              setDraft((prev) => ({ ...prev, detection: 'AMBOS' }))
            }
          >
            Ambos
          </button>
        </div>
      </div>

      {!hideAddButton && (
        <button
          type="button"
          className={styles.inlineAddButton}
          onClick={onAdd}
        >
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

function ServiceList<T extends { id: string }>({
  label,
  fields,
  onRemove,
  onEdit,
  renderRow,
}: {
  label: string
  fields: T[]
  onRemove: (index: number) => void
  onEdit?: (index: number) => void
  renderRow: (index: number) => React.ReactNode
}) {
  if (fields.length === 0) return null

  const isCompact = onEdit != null

  return (
    <div className={styles.listCard}>
      <div className={styles.listHeader}>
        <p className="text-sm font-medium">{label}</p>
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
                  title="Remover"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="mb-3 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onRemove(idx)}
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

function PriorityButton({
  active,
  label,
  onClick,
  disabled,
}: {
  active: boolean
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={`${styles.priorityButton} ${active ? styles.priorityActive : ''}`}
    >
      {label}
    </Button>
  )
}

function CorrelataListForm({
  register,
  control,
  index,
  name,
  disabled,
}: {
  register: UseFormRegister<TicketCreateFormType>
  control: Control<TicketCreateFormType>
  index: number
  name: 'placas_correlatas' | 'placas_conjuntas'
  disabled: boolean
}) {
  const itemsFieldArray = useFieldArray({
    control,
    name: `${name}.${index}.items`,
  })

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {itemsFieldArray.fields.map((item, itemIndex) => (
          <div
            key={item.id}
            className="rounded-md border border-slate-700/40 bg-[#0f2435]/50 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Item {itemIndex + 1}
              </p>

              {itemsFieldArray.fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={disabled}
                  onClick={() => itemsFieldArray.remove(itemIndex)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Placa</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  disabled={disabled}
                  {...register(`${name}.${index}.items.${itemIndex}.plate`)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Início</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  type="datetime-local"
                  disabled={disabled}
                  {...register(
                    `${name}.${index}.items.${itemIndex}.period_start`,
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Fim</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  type="datetime-local"
                  disabled={disabled}
                  {...register(
                    `${name}.${index}.items.${itemIndex}.period_end`,
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2"
          disabled={disabled}
          onClick={() =>
            itemsFieldArray.append({
              plate: '',
              period_start: null,
              period_end: null,
            })
          }
        >
          <Plus className="h-4 w-4" />
          Adicionar placa
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-3 md:col-span-3">
          <Controller
            control={control}
            name={`${name}.${index}.interest_interval_minutes`}
            render={({ field }) => (
              <RangeStatField
                label="Intervalo de Interesse"
                value={Number(field.value ?? 1)}
                min={1}
                max={5}
                unit=""
                disabled={disabled}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-3 md:col-span-3">
          <Controller
            control={control}
            name={`${name}.${index}.detection_count`}
            render={({ field }) => (
              <RangeStatField
                label="Quantidaede de Detecção"
                value={Number(field.value ?? 10)}
                min={5}
                max={50}
                unit=""
                disabled={disabled}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-1.5 md:col-span-3">
          <Label className={styles.fieldLabel}>Detecção</Label>

          <Controller
            control={control}
            name={`${name}.${index}.detection`}
            render={({ field }) => (
              <div className={styles.segmentedDetection}>
                <button
                  type="button"
                  disabled={disabled}
                  className={`${styles.detectionButton} ${
                    field.value === 'ANTES' ? styles.detectionButtonActive : ''
                  }`}
                  onClick={() => field.onChange('ANTES')}
                >
                  Antes
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  className={`${styles.detectionButton} ${
                    field.value === 'DEPOIS' ? styles.detectionButtonActive : ''
                  }`}
                  onClick={() => field.onChange('DEPOIS')}
                >
                  Depois
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  className={`${styles.detectionButton} ${
                    field.value === 'AMBOS' ? styles.detectionButtonActive : ''
                  }`}
                  onClick={() => field.onChange('AMBOS')}
                >
                  Ambos
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
