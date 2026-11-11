import { AlertTriangle } from 'lucide-react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'

/** A falha de uma consulta; com `onRetry`, o botão "Tentar novamente". */
export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="error-banner" role="alert">
      <AlertTriangle />
      <span>{message}</span>
      {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
    </div>
  )
}

/** A falha da leitura principal da tela (grafo, timeline, pós-evento), com o título "Leitura não concluída". */
export function ReadError({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="error-banner" role="alert">
      <AlertTriangle size={18} />
      <div>
        <strong>Leitura não concluída</strong>
        <span>{message}</span>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
