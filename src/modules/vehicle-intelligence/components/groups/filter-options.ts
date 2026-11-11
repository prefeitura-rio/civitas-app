/** Opções dos filtros de fato das telas de grupos e territórios (tipos do fato, alvos, autores e delegacias). */
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { MASTER_GRAPH_OPTIONS_PATH } from '@/modules/vehicle-intelligence/lib/api'
import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'

/** As opções, ou nulo enquanto não chegam (com erro também: a tela fica sem os filtros, como antes). */
export const useFilterOptions = () =>
  useApi<MasterGraphOptions>(MASTER_GRAPH_OPTIONS_PATH).data
