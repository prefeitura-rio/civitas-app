import { api } from '@/lib/api'

import type { TicketAttachmentOut } from './ticket-attachments'

export type TicketPriorityOut = 'URGENTE' | 'ALTA' | 'ROTINA'

export type TicketCreateRequesterOut = {
  requisitante_nome: string
  requisitante_telefone?: string | null
  requisitante_email: string
}

export type TicketCreateFocalPointOut = {
  nome: string
  telefone?: string | null
  email?: string | null
}

export type ServiceBuscaPorPlacaPlateOut = {
  id: string
  created_at: string
  plate: string
}

export type ServiceBuscaPorPlacaOut = {
  id: string
  created_at: string
  /** Quando true, exige todos os campos do serviço preenchidos (validação no cliente). */
  concluido?: boolean
  period_start?: string | null
  period_end?: string | null
  plates: ServiceBuscaPorPlacaPlateOut[]
  anexos?: TicketAttachmentOut[]
}

export type ServiceBuscaPorRadarPlateOut = {
  id: string
  created_at: string
  plate: string
}

export type ServiceBuscaPorRadarOut = {
  id: string
  created_at: string
  concluido?: boolean
  period_start?: string | null
  period_end?: string | null
  plates: ServiceBuscaPorRadarPlateOut[]
  radar_address?: string | null
  orientation?: string | null
  anexos?: TicketAttachmentOut[]
}

export type ServiceCercoEletronicoOut = {
  id: string
  created_at: string
  concluido?: boolean
  plate?: string | null
  vehicle_observations?: string | null
  anexos?: TicketAttachmentOut[]
}

export type ServiceCameraOut = {
  id: string
  created_at: string
  camera_code: string
}

export type ServiceBuscaPorImagemOut = {
  id: string
  created_at: string
  concluido?: boolean
  period_start?: string | null
  period_end?: string | null
  plate?: string | null
  address?: string | null
  description?: string | null
  cameras?: ServiceCameraOut[]
  anexos?: TicketAttachmentOut[]
}

export type ServicePlacasCorrelatasItemOut = {
  id: string
  created_at: string
  plate?: string | null
}

export type TicketDetection = 'ANTES' | 'DEPOIS' | 'AMBOS'

export type ServicePlacasCorrelatasOut = {
  id: string
  created_at: string
  concluido?: boolean
  period_start?: string | null
  period_end?: string | null
  interest_interval_minutes?: number | null
  detection_count?: number | null
  detection?: TicketDetection | null
  plates: ServicePlacasCorrelatasItemOut[]
  anexos?: TicketAttachmentOut[]
}

export type ServicePlacasConjuntasOut = {
  id: string
  created_at: string
  concluido?: boolean
  period_start?: string | null
  period_end?: string | null
  interest_interval_minutes?: number | null
  detection_count?: number | null
  detection?: TicketDetection | null
  plates: ServicePlacasCorrelatasItemOut[]
  anexos?: TicketAttachmentOut[]
}

export type ServiceReservaDeImagemOut = {
  id: string
  created_at: string
  concluido?: boolean
  period_start?: string | null
  period_end?: string | null
  orientation?: string | null
  cameras?: ServiceCameraOut[]
  anexos?: TicketAttachmentOut[]
}

export type ServiceAnaliseDeImagemOut = {
  id: string
  created_at: string
  concluido?: boolean
  period_start?: string | null
  period_end?: string | null
  orientation?: string | null
  cameras?: ServiceCameraOut[]
  anexos?: TicketAttachmentOut[]
}

export type ServiceOutrosOut = {
  id: string
  created_at: string
  concluido?: boolean
  orientation?: string | null
  anexos?: TicketAttachmentOut[]
}

export type TicketCommentOut = {
  id: string
  created_at: string
  author_id?: string | null
  body: string
}

export type TicketRelacionadoOut = {
  id: string
  numero_interno: number
  equipe?: string | null
  responsavel?: string | null
  status: string
  servicos: string[]
}

export type TicketOut = {
  id: string
  criado_em: string
  /** Presente nas versões recentes da API (cabeçalho do detalhe). */
  numero_interno?: number
  status?: string
  demandante?: string
  equipe?: string | null
  responsavel?: string | null
  dias_em_aberto?: number
  associar_chamado_id?: string | null
  tipo_chamado_id: string
  tipo_chamado_nome?: string
  natureza_nome?: string | null
  operation_id?: string | null
  numero_procedimento?: string | null
  numero_oficio?: string | null
  data_base?: string | null
  natureza_id?: string | null
  possui_apelido_imprensa: boolean
  apelido_imprensa?: string | null
  link_materia?: string | null
  requisitante: TicketCreateRequesterOut
  pontos_focais: TicketCreateFocalPointOut[]
  equipe_id?: string | null
  prioridade?: TicketPriorityOut | null
  comentarios?: TicketCommentOut[]
  anexos?: TicketAttachmentOut[]
  busca_por_placa: ServiceBuscaPorPlacaOut[]
  busca_por_radar: ServiceBuscaPorRadarOut[]
  cerco_eletronico: ServiceCercoEletronicoOut[]
  busca_por_imagem: ServiceBuscaPorImagemOut[]
  placas_correlatas: ServicePlacasCorrelatasOut[]
  placas_conjuntas: ServicePlacasConjuntasOut[]
  reserva_de_imagem: ServiceReservaDeImagemOut[]
  analise_de_imagem: ServiceAnaliseDeImagemOut[]
  outros: ServiceOutrosOut[]
  chamados_relacionados?: TicketRelacionadoOut[]
}

export async function getTicketById(ticketId: string) {
  const { data } = await api.get<TicketOut>(`/tickets/${ticketId}`)
  return data
}
