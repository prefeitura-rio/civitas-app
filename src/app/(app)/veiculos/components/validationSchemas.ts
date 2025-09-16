import { z } from 'zod'

import {
  dateRangeSchema,
  optionalPlateHintSchema,
  requiredPlateHintSchema,
} from '@/utils/zod-schemas'

export const radarSearchSchema = z
  .object({
    startDate: z.date({ message: 'Data/hora de início obrigatória' }),
    endDate: z.date({ message: 'Data/hora de fim obrigatória' }),
    plate: optionalPlateHintSchema,
    radarIds: z
      .array(z.string(), { message: 'Campo obrigatório 2' })
      .min(1, { message: 'Campo obrigatório' }),
  })
  .superRefine((data, ctx) => {
    // Verificar se a data de fim é posterior à data de início
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'A data/hora de fim deve ser posterior à data/hora de início',
        path: ['endDate'],
      })
      return
    }

    // Verificar se não excede 5 horas
    const timeDiff = data.endDate.getTime() - data.startDate.getTime()
    const maxTimeDiff = 5 * 60 * 60 * 1000 // 5 horas em milissegundos

    if (timeDiff > maxTimeDiff) {
      ctx.addIssue({
        code: 'custom',
        message: 'O intervalo máximo permitido é de 5 horas',
        path: ['endDate'],
      })
    }
  })

export const wideSearchSchema = z.object({
  date: dateRangeSchema,
  plate: requiredPlateHintSchema,
})

export type RadarSearchFormData = z.infer<typeof radarSearchSchema>
export type WideSearchFormData = z.infer<typeof wideSearchSchema>
