'use client'

import { z } from 'zod'

export const ticketPriorityEnum = z.enum(['URGENTE', 'ALTA', 'ROTINA'])

export const ticketDetectionEnum = z.enum(['ANTES', 'DEPOIS', 'AMBOS'])

const requesterSchema = z.object({
  requisitante_nome: z.string().min(2, 'Campo obrigatório').max(120),
  requisitante_telefone: z.string().max(30).optional().nullable(),
  requisitante_email: z.string().email('Email inválido').nullable(),
})

const focalPointSchema = z.object({
  nome: z.string().min(2, 'Campo obrigatório').max(120),
  telefone: z.string().max(30).optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
})

const serviceBuscaPorPlacaSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plate: z.string().min(1).max(20),
})

const serviceBuscaPorRadarSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plate: z.string().min(1).max(20),
  radar_address: z.string().max(50_000).optional().nullable(),
})

const serviceCercoSchema = z.object({
  plate: z.string().min(1).max(20),
  vehicle_observations: z.string().max(50_000).optional().nullable(),
})

const serviceBuscaPorImagemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plate: z.string().max(20).optional().nullable(),
  address: z.string().max(50_000).optional().nullable(),
  description: z.string().max(50_000).optional().nullable(),
})

const correlataItemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plate: z.string().min(1).max(20),
})

const servicePlacasCorrelatasSchema = z.object({
  interest_interval_minutes: z.number().int().min(0).optional().nullable(),
  detection_count: z.number().int().min(0).optional().nullable(),
  detection: ticketDetectionEnum.optional().nullable(),
  items: z.array(correlataItemSchema).default([]),
})

const servicePlacasConjuntasSchema = z.object({
  interest_interval_minutes: z.number().int().min(0).optional().nullable(),
  detection_count: z.number().int().min(0).optional().nullable(),
  detection: ticketDetectionEnum.optional().nullable(),
  items: z.array(correlataItemSchema).default([]),
})

const serviceReservaDeImagemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  orientation: z.string().max(50_000).optional().nullable(),
})

const serviceAnaliseDeImagemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  orientation: z.string().max(50_000).optional().nullable(),
})

const serviceOutrosSchema = z.object({
  orientation: z.string().max(50_000).optional().nullable(),
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

  requisitante: requesterSchema,
  pontos_focais: z
    .array(focalPointSchema)
    .max(20, 'Máximo de 20 pontos focais')
    .default([]),

  equipe_id: z.string().min(1, 'Campo obrigatório'),
  prioridade: ticketPriorityEnum.default('ROTINA'),

  comentario_inicial: z.string().max(50_000).optional().nullable(),

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
