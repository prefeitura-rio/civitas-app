'use server'

import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_CIVITAS_API_URL: z.string().min(1),
  NEXT_PUBLIC_GW_API_URL: z.string().min(1),
  NEXT_PUBLIC_VISION_AI_URL: z.string().min(1),

  MAPBOX_ACCESS_TOKEN: z.string().min(1),
})

export const getEnv = async () => {
  const { data, success, error } = envSchema.safeParse({
    NEXT_PUBLIC_CIVITAS_API_URL: process.env.NEXT_PUBLIC_CIVITAS_API_URL,
    NEXT_PUBLIC_GW_API_URL: process.env.NEXT_PUBLIC_GW_API_URL,
    NEXT_PUBLIC_VISION_AI_URL: process.env.NEXT_PUBLIC_VISION_AI_URL,

    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
  })

  if (success === false) {
    console.error('❌❌ Invalid environment variables!', error.format())
    throw new Error('❌❌ Invalid environment variables!')
  }

  return data
}
