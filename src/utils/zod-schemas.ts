import { z } from 'zod'

function isPlateFormatValid(val: string) {
  // If the value contains a wildcard character, it's valid
  if (val.includes('*')) {
    return true
  }
  // Otherwise, it must match the regex pattern
  return /^[A-Z]{3}\d[A-Z\d]\d{2}$/.test(val)
}

export const requiredPlateHintSchema = z
  .string()
  .min(1, { message: 'Campo Obrigatório' })
  .refine((val) => isPlateFormatValid(val), { message: 'Formato inválido' })

export const optionalPlateHintSchema = z
  .string()
  .optional()
  .refine((val) => (val ? isPlateFormatValid(val) : true), {
    message: 'Formato inválido',
  })

export const dateRangeSchema = z
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
  })

// Schema específico para busca por radar com limite de 5 horas
export const radarDateRangeSchema = z
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

    // Validação de máximo 5 horas
    const timeDiff = val.to.getTime() - val.from.getTime()
    const maxTimeDiff = 5 * 60 * 60 * 1000 // 5 horas em milissegundos

    if (timeDiff > maxTimeDiff) {
      ctx.addIssue({
        code: 'custom',
        message: 'O intervalo máximo permitido é de 5 horas',
        path: ['to'],
      })
    }
  })
