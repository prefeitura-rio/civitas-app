import { z } from 'zod'

export const ticketPriorityEnum = z.enum(['URGENTE', 'ALTA', 'ROTINA'])

export const ticketDetectionEnum = z.enum(['ANTES', 'DEPOIS', 'AMBOS'])

const requesterSchema = z.object({
  requisitante_nome: z.string().min(2, 'Campo obrigatório').max(120),
  requisitante_telefone: z.string().min(2, 'Campo obrigatório').max(30),
  requisitante_email: z.string().email('Email inválido').nullable(),
})

const focalPointSchema = z.object({
  nome: z.string().min(2, 'Campo obrigatório').max(120),
  telefone: z.string().min(1, 'Campo obrigatório').max(120),
  email: z.string().email('Email inválido').optional().nullable(),
})

export const serviceBuscaPorPlacaSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plate: z.string().optional().nullable(),
})

export const serviceBuscaPorRadarSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plate: z.string().optional().nullable(),
  radar_address: z.string().optional().nullable(),
})

export const serviceCercoSchema = z.object({
  plate: z.string().optional().nullable(),
  vehicle_observations: z.string().optional().nullable(),
})

export const serviceBuscaPorImagemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plate: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

const correlataItemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plate: z.string().optional().nullable(),
})

export const servicePlacasCorrelatasSchema = z.object({
  interest_interval_minutes: z.number().int().min(0).optional().nullable(),
  detection_count: z.number().int().min(0).optional().nullable(),
  detection: ticketDetectionEnum.optional().nullable(),
  items: z
    .array(correlataItemSchema)
    .min(1, 'Adicione ao menos um período e placa')
    .default([]),
})

export const servicePlacasConjuntasSchema = z.object({
  interest_interval_minutes: z.number().int().min(0).optional().nullable(),
  detection_count: z.number().int().min(0).optional().nullable(),
  detection: ticketDetectionEnum.optional().nullable(),
  items: z
    .array(correlataItemSchema)
    .min(1, 'Adicione ao menos um período e placa')
    .default([]),
})

export const serviceReservaDeImagemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  orientation: z.string().optional().nullable(),
})

export const serviceAnaliseDeImagemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  orientation: z.string().optional().nullable(),
})

export const serviceOutrosSchema = z.object({
  orientation: z.string().optional().nullable(),
})

export const ticketCreateSchema = z.object({
  associar_chamado_id: z.string().optional().nullable(),
  tipo_chamado_id: z.string().min(1, 'Campo obrigatório'),

  operation_id: z.string().min(1, 'Campo obrigatório'),

  numero_procedimento: z.string().max(60).optional().nullable(),
  numero_oficio: z.string().max(60).optional().nullable(),
  data_base: z.string().optional().nullable(),
  natureza_id: z.string().optional().nullable(),

  possui_apelido_imprensa: z.boolean().default(false),
  apelido_imprensa: z.string().max(120).optional().nullable(),
  link_materia: z.string().url('URL inválida').optional().nullable(),

  possui_endereco_correspondencia: z.boolean().default(false),
  bairro_correspondencia: z.string().max(120).optional().nullable(),
  rua_correspondencia: z.string().max(255).optional().nullable(),
  numero_correspondencia: z.string().max(20).optional().nullable(),

  requisitante: requesterSchema,
  pontos_focais: z.array(focalPointSchema).default([]),

  equipe_id: z.string().min(1, 'Campo obrigatório'),
  prioridade: ticketPriorityEnum.optional().nullable(),

  comentario_inicial: z.string().max(50).optional().nullable(),

  busca_por_placa: z.array(serviceBuscaPorPlacaSchema).default([]),
  busca_por_radar: z.array(serviceBuscaPorRadarSchema).default([]),
  cerco_eletronico: z.array(serviceCercoSchema).default([]),
  busca_por_imagem: z.array(serviceBuscaPorImagemSchema).default([]),
  placas_correlatas: z.array(servicePlacasCorrelatasSchema).default([]),
  placas_conjuntas: z.array(servicePlacasConjuntasSchema).default([]),
  reserva_de_imagem: z.array(serviceReservaDeImagemSchema).default([]),
  analise_de_imagem: z.array(serviceAnaliseDeImagemSchema).default([]),
  outros: z.array(serviceOutrosSchema).default([]),
})

export type TicketCreateForm = z.infer<typeof ticketCreateSchema>
