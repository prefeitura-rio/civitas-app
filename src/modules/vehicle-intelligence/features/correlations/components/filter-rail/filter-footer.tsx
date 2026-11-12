export function FilterFooter({
  count,
  loading,
  error,
  canApply,
  onDiscard,
  onApply,
}: {
  count: number
  loading: boolean
  error: string | null
  canApply: boolean
  onDiscard: () => void
  onApply: () => void
}) {
  return (
    <div className="graph-filter-footer">
      <div
        className="graph-filter-status"
        data-status={
          count ? 'pending' : error ? 'error' : loading ? 'loading' : 'ok'
        }
        role="status"
      >
        <span />
        {count
          ? `${count} ${count === 1 ? 'alteração ainda não aplicada' : 'alterações ainda não aplicadas'}`
          : error
            ? 'Consulta não concluída'
            : loading
              ? 'Atualizando grafo…'
              : 'Grafo atualizado'}
      </div>
      <div className="graph-filter-actions">
        <button type="button" disabled={!count} onClick={onDiscard}>
          Descartar
        </button>
        <button type="button" disabled={!count || !canApply} onClick={onApply}>
          {count
            ? `Aplicar ${count} ${count === 1 ? 'alteração' : 'alterações'}`
            : 'Aplicar'}
        </button>
      </div>
    </div>
  )
}
