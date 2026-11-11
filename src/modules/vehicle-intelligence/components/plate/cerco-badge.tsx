/**
 * Placas monitoradas hoje no Cerco Digital, comuns aos três recortes.
 *
 * O gateway atualiza a lista uma vez por dia pela API CIVITAS e a entrega em
 * `/api/cerco`. A interface a carrega uma vez por página e marca as placas
 * monitoradas com a etiqueta CERCO.
 */
import { type ReactNode, useCallback } from 'react'

import { request } from '@/modules/vehicle-intelligence/lib/api'
import { formatDate } from '@/modules/vehicle-intelligence/lib/dates'
import { createLazyStore } from '@/modules/vehicle-intelligence/lib/store'

/** Uma operação da placa, como `/api/cerco` a entrega. */
type CercoOperation = { operacao: string | null; desde: string | null }
type CercoResponse = {
  consultado_em: string | null
  placas: Record<string, { operacoes: CercoOperation[] }>
}
type CercoList = {
  plates: ReadonlyMap<string, CercoOperation[]>
  checkedAt: string | null
}
/** A placa no Cerco hoje: as operações e a data da lista. */
type CercoEntry = { operations: CercoOperation[]; checkedAt: string | null }

const cercoStore = createLazyStore<CercoList>(
  { plates: new Map(), checkedAt: null },
  async () => {
    const data = await request<CercoResponse>('/api/cerco')
    return {
      checkedAt: data.consultado_em,
      plates: new Map(
        Object.entries(data.placas).map(([plate, info]) => [
          plate,
          info.operacoes,
        ]),
      ),
    }
  },
)

// Sem a lista, nenhuma placa recebe a etiqueta; o restante do painel segue normal.
export const useCercoList = cercoStore.use

function dateOrNull(iso: string | null): string | null {
  return iso ? formatDate(iso) : null
}

function cercoTooltip(
  operations: CercoOperation[],
  checkedAt: string | null,
): string {
  const list = operations.map((item) =>
    [
      item.operacao ?? 'Operação sem nome',
      dateOrNull(item.desde) && `desde ${dateOrNull(item.desde)}`,
    ]
      .filter(Boolean)
      .join(' '),
  )
  return `Monitorada hoje no Cerco Digital · ${list.join('; ')}${checkedAt ? ` · lista de ${dateOrNull(checkedAt)}` : ''}`
}

/** Teste "está no Cerco hoje?" para listas e grafos (a mesma lista do ranking). */
export function useIsInCerco(): (plate: string) => boolean {
  const { plates } = useCercoList()
  return useCallback((plate: string) => plates.has(plate), [plates])
}

/** A placa no Cerco Digital hoje; nulo fora do cerco. */
export function useCercoEntry(plate: string): CercoEntry | null {
  const { plates, checkedAt } = useCercoList()
  const operations = plates.get(plate)
  return operations ? { operations, checkedAt } : null
}

/** Etiqueta CERCO, no estilo de etiqueta de cada recorte; nada para placas fora do cerco. */
export function CercoBadge({
  plate,
  className,
  children,
}: {
  plate: string
  className: string
  children: ReactNode
}) {
  const { plates, checkedAt } = useCercoList()
  const operations = plates.get(plate)
  if (!operations) return null
  return (
    <span className={className} title={cercoTooltip(operations, checkedAt)}>
      {children}
    </span>
  )
}
