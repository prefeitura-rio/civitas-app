import { z } from 'zod'

export const searchByRadarFormSchema = z.object({
  radar: z.string(),
  startTime: z.date(),
  duration: z.array(z.number()),
  plateHint: z.string().optional(),
})

export type SearchByRadarForm = z.infer<typeof searchByRadarFormSchema>
