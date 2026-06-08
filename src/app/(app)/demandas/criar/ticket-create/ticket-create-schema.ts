import { z } from 'zod'

import { validateCPF } from '@/utils/validate-cpf'

import { TICKET_CREATE_STRING_LIMITS as L } from './ticket-create.constant'

export const ticketPriorityEnum = z.enum(['URGENTE', 'ALTA', 'ROTINA'])

export const ticketDetectionEnum = z.enum(['ANTES', 'DEPOIS', 'AMBOS'])

const maxMsg = (n: number) => `Máximo de ${n} caracteres`

const requesterSchema = z.object({
  name: z
    .string()
    .min(2, 'Campo obrigatório')
    .max(L.requester_name, maxMsg(L.requester_name)),
  phone: z
    .string()
    .min(2, 'Campo obrigatório')
    .max(L.requester_phone, maxMsg(L.requester_phone)),
  email: z.union([
    z.literal(null),
    z.literal(''),
    z
      .string()
      .max(L.requester_email, maxMsg(L.requester_email))
      .email('Email inválido'),
  ]),
})

const focalPointSchema = z.object({
  name: z
    .string()
    .min(2, 'Campo obrigatório')
    .max(L.focal_point_name, maxMsg(L.focal_point_name)),
  phone: z
    .string()
    .min(1, 'Campo obrigatório')
    .max(L.focal_point_phone, maxMsg(L.focal_point_phone)),
  email: z
    .union([
      z.literal(null),
      z.literal(''),
      z
        .string()
        .max(L.focal_point_email, maxMsg(L.focal_point_email))
        .email('Email inválido'),
    ])
    .optional(),
})

export const servicePlateSearchSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plates: z.array(z.string()).default([]),
})

export const serviceRadarSearchSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  plates: z.array(z.string()).default([]),
  orientation: z
    .string()
    .max(50_000, 'Máximo de 50000 caracteres')
    .optional()
    .nullable(),
})

export const serviceElectronicFenceSchema = z.object({
  plates: z.array(z.string()).default([]),
  vehicle_observations: z.string().optional().nullable(),
})

export const serviceImageSearchSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  addresses: z
    .array(z.string().max(50_000, 'Máximo de 50000 caracteres'))
    .default([]),
  description: z.string().optional().nullable(),
  cameras: z.array(z.string()).default([]),
})

const correlataPlateItemSchema = z.object({
  plate: z.string().max(20, maxMsg(20)).optional().nullable(),
})

export const serviceCorrelatedPlatesSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  interest_interval_minutes: z.number().int().min(0).optional().nullable(),
  detection_count: z.number().int().min(0).optional().nullable(),
  detection: ticketDetectionEnum.optional().nullable(),
  plates: z.array(correlataPlateItemSchema).default([]),
})

export const serviceJointPlatesSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  interest_interval_minutes: z.number().int().min(0).optional().nullable(),
  detection_count: z.number().int().min(0).optional().nullable(),
  detection: ticketDetectionEnum.optional().nullable(),
  plates: z.array(correlataPlateItemSchema).default([]),
})

export const serviceImageReservationSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  orientation: z.string().optional().nullable(),
  addresses: z
    .array(z.string().max(50_000, 'Máximo de 50000 caracteres'))
    .default([]),
  cameras: z.array(z.string()).default([]),
})

export const serviceImageAnalysisSchema = z.object({
  period_start: z.string().optional().nullable(),
  period_end: z.string().optional().nullable(),
  orientation: z.string().optional().nullable(),
  addresses: z
    .array(z.string().max(50_000, 'Máximo de 50000 caracteres'))
    .default([]),
  cameras: z.array(z.string()).default([]),
})

export const serviceOtherSchema = z.object({
  orientation: z.string().optional().nullable(),
})

export const serviceAtlasCivitasSchema = z.object({
  name: z
    .string()
    .min(2, 'Campo obrigatório')
    .max(L.atlas_civitas_name, maxMsg(L.atlas_civitas_name)),
  email: z
    .string()
    .min(1, 'Campo obrigatório')
    .max(L.atlas_civitas_email, maxMsg(L.atlas_civitas_email))
    .email('Email inválido'),
  cpf: z
    .string()
    .min(1, 'Campo obrigatório')
    .refine((v) => validateCPF(v), 'CPF inválido'),
  registration: z
    .string()
    .min(1, 'Campo obrigatório')
    .max(L.atlas_civitas_registration, maxMsg(L.atlas_civitas_registration)),
})

export const ticketCreateSchema = z.object({
  linked_ticket_id: z.string().optional().nullable(),
  ticket_type_id: z.string().min(1, 'Campo obrigatório'),

  operation_id: z.string().min(1, 'Campo obrigatório'),

  procedure_number: z
    .string()
    .max(L.procedure_number, maxMsg(L.procedure_number))
    .optional()
    .nullable()
    .refine(
      (v) => v == null || v === '' || /^\d+$/.test(v),
      'Apenas números são permitidos',
    ),
  official_letter_number: z
    .string()
    .max(L.official_letter_number, maxMsg(L.official_letter_number))
    .optional()
    .nullable()
    .refine(
      (v) => v == null || v === '' || /^[A-Z0-9/]+$/.test(v),
      'Use apenas letras, números e barra (/)',
    ),
  base_date: z.string().optional().nullable(),
  nature_id: z.string().min(1, 'Campo obrigatório'),

  has_press_alias: z.boolean().default(false),
  press_alias: z
    .string()
    .max(L.press_alias, maxMsg(L.press_alias))
    .optional()
    .nullable(),
  article_link: z
    .union([
      z.null(),
      z.literal(''),
      z
        .string()
        .max(L.article_link, maxMsg(L.article_link))
        .url('URL inválida'),
    ])
    .optional(),

  has_correspondence_address: z.boolean().default(false),
  correspondence_neighborhood: z
    .string()
    .max(L.correspondence_neighborhood, maxMsg(L.correspondence_neighborhood))
    .optional()
    .nullable(),
  correspondence_street: z
    .string()
    .max(L.correspondence_street, maxMsg(L.correspondence_street))
    .optional()
    .nullable(),
  correspondence_number: z
    .string()
    .max(L.correspondence_number, maxMsg(L.correspondence_number))
    .optional()
    .nullable(),

  requester: requesterSchema,
  focal_points: z.array(focalPointSchema).default([]),

  team_id: z.string().min(1, 'Campo obrigatório'),
  priority: ticketPriorityEnum.optional().nullable(),

  initial_comment: z
    .string()
    .max(L.initial_comment, maxMsg(L.initial_comment))
    .optional()
    .nullable(),

  plate_search: z.array(servicePlateSearchSchema).default([]),
  radar_search: z.array(serviceRadarSearchSchema).default([]),
  electronic_fence: z.array(serviceElectronicFenceSchema).default([]),
  image_search: z.array(serviceImageSearchSchema).default([]),
  correlated_plates: z.array(serviceCorrelatedPlatesSchema).default([]),
  joint_plates: z.array(serviceJointPlatesSchema).default([]),
  image_reservation: z.array(serviceImageReservationSchema).default([]),
  image_analysis: z.array(serviceImageAnalysisSchema).default([]),
  other: z.array(serviceOtherSchema).default([]),
  atlas_civitas: z.array(serviceAtlasCivitasSchema).default([]),
})

export type TicketCreateForm = z.infer<typeof ticketCreateSchema>

/** @deprecated Use servicePlateSearchSchema */
export const serviceBuscaPorPlacaSchema = servicePlateSearchSchema

/** @deprecated Use serviceRadarSearchSchema */
export const serviceBuscaPorRadarSchema = serviceRadarSearchSchema

/** @deprecated Use serviceElectronicFenceSchema */
export const serviceCercoSchema = serviceElectronicFenceSchema

/** @deprecated Use serviceImageSearchSchema */
export const serviceBuscaPorImagemSchema = serviceImageSearchSchema

/** @deprecated Use serviceCorrelatedPlatesSchema */
export const servicePlacasCorrelatasSchema = serviceCorrelatedPlatesSchema

/** @deprecated Use serviceJointPlatesSchema */
export const servicePlacasConjuntasSchema = serviceJointPlatesSchema

/** @deprecated Use serviceImageReservationSchema */
export const serviceReservaDeImagemSchema = serviceImageReservationSchema

/** @deprecated Use serviceImageAnalysisSchema */
export const serviceAnaliseDeImagemSchema = serviceImageAnalysisSchema

/** @deprecated Use serviceOtherSchema */
export const serviceOutrosSchema = serviceOtherSchema
