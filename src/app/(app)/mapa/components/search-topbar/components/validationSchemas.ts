import { z } from 'zod'

export const radarSearchSchema = z.object({
  date: z.date({ message: 'Campo obrigatório' }),
  duration: z.array(z.number()),
  plateHint: z
    .string()
    .refine(
      (val) => {
        // If the value contains a wildcard character, it's valid
        if (val.includes('*') || !val) {
          return true
        }
        // Otherwise, it must match the regex pattern
        return /^[A-Z]{3}\d[A-Z\d]\d{2}$/.test(val)
      },
      { message: 'Formato inválido' },
    )
    .optional(),
  radarIds: z
    .array(z.string(), { message: 'Campo obrigatório 2' })
    .min(1, { message: 'Campo obrigatório' }),
})

export const wideSearchSchema = z.object({
  date: z
    .object(
      {
        from: z.date({ message: 'Campo obrigatório' }),
        to: z.date({ message: 'Selecione uma data de término' }),
      },
      { message: 'Campo obrigatório' },
    )
    .superRefine((val, ctx) => {
      if (val.to > new Date()) {
        ctx.addIssue({
          code: 'invalid_date',
          message: 'A data de término deve ser menor ou igual à data atual',
        })
      }
    }),
  plateHint: z
    .string()
    .refine(
      (val) => {
        // If the value contains a wildcard character, it's valid
        if (val.includes('*') || !val) {
          return true
        }
        // Otherwise, it must match the regex pattern
        return /^[A-Z]{3}\d[A-Z\d]\d{2}$/.test(val)
      },
      { message: 'Formato inválido' },
    )
    .optional(),
})

export type RadarSearchFormData = z.infer<typeof radarSearchSchema>
export type WideSearchFormData = z.infer<typeof wideSearchSchema>
