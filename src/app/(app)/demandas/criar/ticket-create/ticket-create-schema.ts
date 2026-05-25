import { z } from 'zod'

import { TICKET_CREATE_STRING_LIMITS as L } from './ticket-create.constant'

export const ticketPriorityEnum = z.enum(['URGENTE', 'ALTA', 'ROTINA'])

export const ticketDetectionEnum = z.enum(['ANTES', 'DEPOIS', 'AMBOS'])

const maxMsg = (n: number) => `Máximo de ${n} caracteres`

const requesterSchema = z.object({
  requisitante_nome: z
    .string()
    .min(2, 'Campo obrigatório')
    .max(L.requisitante_nome, maxMsg(L.requisitante_nome)),
  requisitante_telefone: z
    .string()
    .min(2, 'Campo obrigatório')
    .max(L.requisitante_telefone, maxMsg(L.requisitante_telefone)),
  requisitante_email: z.union([
    z.literal(null),
    z.literal(''),
    z
      .string()
      .max(L.requisitante_email, maxMsg(L.requisitante_email))
      .email('Email inválido'),
  ]),
})

const focalPointSchema = z.object({
  nome: z
    .string()
    .min(2, 'Campo obrigatório')
    .max(L.ponto_focal_nome, maxMsg(L.ponto_focal_nome)),
  telefone: z
    .string()
    .min(1, 'Campo obrigatório')
    .max(L.ponto_focal_telefone, maxMsg(L.ponto_focal_telefone)),
  email: z
    .union([
      z.literal(null),
      z.literal(''),
      z
        .string()
        .max(L.ponto_focal_email, maxMsg(L.ponto_focal_email))
        .email('Email inválido'),
    ])
    .optional(),
})

export const serviceBuscaPorPlacaSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plates: z.array(z.string()).default([]),
})

export const serviceBuscaPorRadarSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plates: z.array(z.string()).default([]),
  orientation: z
    .string()
    .max(50_000, 'Máximo de 50000 caracteres')
    .optional()
    .nullable(),
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
  cameras: z.array(z.string()).default([]),
})

const correlataPlateItemSchema = z.object({
  plate: z.string().max(20, maxMsg(20)).optional().nullable(),
})

export const servicePlacasCorrelatasSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  interest_interval_minutes: z.number().int().min(0).optional().nullable(),
  detection_count: z.number().int().min(0).optional().nullable(),
  detection: ticketDetectionEnum.optional().nullable(),
  plates: z.array(correlataPlateItemSchema).default([]),
})

export const servicePlacasConjuntasSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  interest_interval_minutes: z.number().int().min(0).optional().nullable(),
  detection_count: z.number().int().min(0).optional().nullable(),
  detection: ticketDetectionEnum.optional().nullable(),
  plates: z.array(correlataPlateItemSchema).default([]),
})

export const serviceReservaDeImagemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  orientation: z.string().optional().nullable(),
  cameras: z.array(z.string()).default([]),
})

export const serviceAnaliseDeImagemSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  orientation: z.string().optional().nullable(),
  cameras: z.array(z.string()).default([]),
})

export const serviceOutrosSchema = z.object({
  orientation: z.string().optional().nullable(),
})

export const ticketCreateSchema = z.object({
  associar_chamado_id: z.string().optional().nullable(),
  tipo_chamado_id: z.string().min(1, 'Campo obrigatório'),

  operation_id: z.string().min(1, 'Campo obrigatório'),

  numero_procedimento: z
    .string()
    .max(L.numero_procedimento, maxMsg(L.numero_procedimento))
    .optional()
    .nullable()
    .refine(
      (v) => v == null || v === '' || /^\d+$/.test(v),
      'Apenas números são permitidos',
    ),
  numero_oficio: z
    .string()
    .max(L.numero_oficio, maxMsg(L.numero_oficio))
    .optional()
    .nullable()
    .refine(
      (v) => v == null || v === '' || /^\d{5}\/\d{4}$/.test(v),
      'Use o formato 00000/0000 (ex.: 00123/2026)',
    ),
  data_base: z.string().optional().nullable(),
  natureza_id: z.string().min(1, 'Campo obrigatório'),

  possui_apelido_imprensa: z.boolean().default(false),
  apelido_imprensa: z
    .string()
    .max(L.apelido_imprensa, maxMsg(L.apelido_imprensa))
    .optional()
    .nullable(),
  link_materia: z
    .union([
      z.null(),
      z.literal(''),
      z
        .string()
        .max(L.link_materia, maxMsg(L.link_materia))
        .url('URL inválida'),
    ])
    .optional(),

  possui_endereco_correspondencia: z.boolean().default(false),
  bairro_correspondencia: z
    .string()
    .max(L.bairro_correspondencia, maxMsg(L.bairro_correspondencia))
    .optional()
    .nullable(),
  rua_correspondencia: z
    .string()
    .max(L.rua_correspondencia, maxMsg(L.rua_correspondencia))
    .optional()
    .nullable(),
  numero_correspondencia: z
    .string()
    .max(L.numero_correspondencia, maxMsg(L.numero_correspondencia))
    .optional()
    .nullable(),

  requisitante: requesterSchema,
  pontos_focais: z.array(focalPointSchema).default([]),

  equipe_id: z.string().min(1, 'Campo obrigatório'),
  prioridade: ticketPriorityEnum.optional().nullable(),

  comentario_inicial: z
    .string()
    .max(L.comentario_inicial, maxMsg(L.comentario_inicial))
    .optional()
    .nullable(),

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
