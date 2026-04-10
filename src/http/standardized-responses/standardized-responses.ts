import { api } from '@/lib/api'

/** Valores alinhados ao enum `StandardizedResponseCategory` da API. */
export type StandardizedResponseCategory =
  | 'RECEBIMENTO_SOLICITACOES'
  | 'RELATORIOS_PLACAS_RADARES'
  | 'INSERCAO_PLACAS_CERCO'
  | 'SOLICITACAO_IMAGENS'
  | 'MODELOS_CONSOLIDADOS'
  | 'SOLICITACOES_INDEVIDAS'
  | 'AGRADECIMENTO'
  | 'MODELO_OFICIO_DEMANDANTE'

export interface StandardizedResponseListItem {
  id: string
  created_at: string
  category: StandardizedResponseCategory
  title: string
  when_to_use: string | null
  is_active: boolean
}

export interface StandardizedResponsePage {
  items: StandardizedResponseListItem[]
  total: number
}

export interface StandardizedResponseDetail extends StandardizedResponseListItem {
  body: string
}

export function listStandardizedResponses(params?: {
  search?: string
  category?: StandardizedResponseCategory
  isActive?: boolean
}) {
  return api.get<StandardizedResponsePage>('/standardized-responses', {
    params: {
      search: params?.search,
      category: params?.category,
      isActive: params?.isActive,
    },
  })
}

export function getStandardizedResponseById(standardizedResponseId: string) {
  return api.get<StandardizedResponseDetail>(
    `/standardized-responses/${encodeURIComponent(standardizedResponseId)}`,
  )
}
