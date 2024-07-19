import { z } from 'zod'

export const searchByRadarFormSchema = z.object({
  startTime: z.date({ message: 'Campo obrigatório' }),
  duration: z.array(z.number()),
  plateHint: z.string().optional(),
})

export type SearchByRadarForm = z.infer<typeof searchByRadarFormSchema>
