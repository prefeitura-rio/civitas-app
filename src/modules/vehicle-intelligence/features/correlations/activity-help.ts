import { formatDate } from '@/modules/vehicle-intelligence/lib/dates'
import type { MasterPreData } from '@/modules/vehicle-intelligence/types/domain'

/** A ajuda do filtro "Detectada nos últimos": até quando vai a camada atual do Cerco Eletrônico. */
export function activityHelpText(activity: MasterPreData['activity']): string {
  const activityReference = activity?.reference_date ?? null
  return activity?.available === false
    ? 'A camada atual do Cerco Eletrônico ainda não foi materializada — rode scripts/atualizar_atividade_recente.py'
    : activityReference
      ? `Os últimos 7, 15, 30 ou 45 dias terminam em ${formatDate(activityReference)}, data final do cache. Dias de circulação e cobertura usam todo o histórico disponível.`
      : 'Filtra pelas detecções no fim do cache disponível. Dias de circulação e cobertura usam todo o histórico disponível.'
}
