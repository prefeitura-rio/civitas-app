import { z } from 'zod'

import { dateRangeSchema, plateHintSchema } from '@/utils/zod-schemas'

export const radarSearchSchema = z.object({
  date: z.date({ message: 'Campo obrigatório' }),
  duration: z.array(z.number()),
  plate: plateHintSchema.optional(),
  radarIds: z
    .array(z.string(), { message: 'Campo obrigatório 2' })
    .min(1, { message: 'Campo obrigatório' }),
})

export const wideSearchSchema = z.object({
  date: dateRangeSchema,
  plate: plateHintSchema,
})

export type RadarSearchFormData = z.infer<typeof radarSearchSchema>
export type WideSearchFormData = z.infer<typeof wideSearchSchema>
