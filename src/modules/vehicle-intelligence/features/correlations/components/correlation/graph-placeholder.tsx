import { AlertTriangle } from 'lucide-react'

import { QueryLoading } from '@/modules/vehicle-intelligence/components/query-loading'

/** O lugar do grafo antes da primeira resposta: o relógio da consulta ou a falha. */
export function GraphPlaceholder({
  error,
  queryKey,
  optionsLoaded,
}: {
  error: string | null
  /** A consulta em andamento: uma nova recomeça o relógio. */
  queryKey: string
  optionsLoaded: boolean
}) {
  return (
    <section className="panel graph-loading">
      {error ? (
        <>
          <AlertTriangle />
          <strong>Não foi possível carregar o grafo.</strong>
          <small>Use “Tentar novamente” acima.</small>
        </>
      ) : (
        <QueryLoading
          key={queryKey}
          label={
            optionsLoaded
              ? 'Calculando as ligações do grafo…'
              : 'Carregando a base e os filtros…'
          }
          detail="Você pode navegar pela análise enquanto a consulta é concluída."
        />
      )}
    </section>
  )
}
