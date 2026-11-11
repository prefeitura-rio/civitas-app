import { AlertTriangle, Check } from 'lucide-react'

/** Resultado da última exportação (anunciado ao leitor de tela; falha em destaque). */
export function RankingExportStatus({
  exportStatus,
}: {
  exportStatus: string | null
}) {
  const exportHasError =
    exportStatus?.startsWith('Falha') || exportStatus?.startsWith('Nenhuma')
  return (
    <div
      id="ranking-export-status"
      className={
        exportHasError ? 'ranking-export-status error' : 'ranking-export-status'
      }
      role={exportHasError ? 'alert' : 'status'}
      aria-live={exportHasError ? 'assertive' : 'polite'}
    >
      {exportStatus && (
        <>
          {exportHasError ? (
            <AlertTriangle size={15} aria-hidden="true" />
          ) : (
            <Check size={15} aria-hidden="true" />
          )}
          {exportStatus}
        </>
      )}
    </div>
  )
}
