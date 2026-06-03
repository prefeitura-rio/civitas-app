import { api } from '@/lib/api'

/** POST `/workflow/reset-to-defaults` — restaura as configurações de workflow ao padrão de fábrica. */
export async function resetWorkflowToDefaults() {
  const { data } = await api.post<void>('/workflow/reset-to-defaults')
  return data
}
