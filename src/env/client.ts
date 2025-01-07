import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_CIVITAS_API_URL: z.string().min(1),
  NEXT_PUBLIC_GW_API_URL: z.string().min(1),
  NEXT_PUBLIC_VISION_AI_URL: z.string().min(1),
})

const clientEnv = {
  NEXT_PUBLIC_CIVITAS_API_URL: process.env.NEXT_PUBLIC_CIVITAS_API_URL,
  NEXT_PUBLIC_GW_API_URL: process.env.NEXT_PUBLIC_GW_API_URL,
  NEXT_PUBLIC_VISION_AI_URL: process.env.NEXT_PUBLIC_VISION_AI_URL,
}

const _env = envSchema.safeParse(clientEnv)

if (_env.success === false) {
  console.error('❌❌ Variáveis ambiente inválidas:', _env.error.format())
  throw new Error('❌❌ Variáveis ambiente inválidas')
}

export const env = _env.data
