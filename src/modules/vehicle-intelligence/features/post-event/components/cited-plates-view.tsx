import '@/modules/vehicle-intelligence/features/post-event/cited-plates.css'

import { useState } from 'react'

import { CitedPlatesContent } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/cited-plates-content'
import {
  type CitedFilters,
  DEFAULT_CITED_FILTERS,
} from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/filters'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { MASTER_GRAPH_OPTIONS_PATH } from '@/modules/vehicle-intelligence/lib/api'
import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'
import type { OpenPlate } from '@/modules/vehicle-intelligence/types/navigation'

/** Entorno: para onde vão as placas citadas na dinâmica depois dos fatos (a tela do pós-evento de transeuntes). */
export default function CitedPlatesView({
  active,
  onOpenPlate,
}: {
  active: boolean
  onOpenPlate: OpenPlate
}) {
  const { data: options } = useApi<MasterGraphOptions>(
    MASTER_GRAPH_OPTIONS_PATH,
  )
  const [filters, setFilters] = useState<CitedFilters>(DEFAULT_CITED_FILTERS)
  // "Tentar novamente" monta o conteúdo de novo: a resposta anterior sai da tela e a consulta recomeça.
  const [attempt, setAttempt] = useState(0)
  return (
    <CitedPlatesContent
      key={attempt}
      active={active}
      onOpenPlate={(plate) => onOpenPlate(plate, { analysis: 'trends' })}
      options={options}
      filters={filters}
      onFiltersChange={setFilters}
      onRetry={() => setAttempt((value) => value + 1)}
    />
  )
}
