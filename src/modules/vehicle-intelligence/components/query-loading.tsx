import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

/** O relógio atualiza só este indicador, sem redesenhar o grafo ou a tabela. */
export function QueryLoading({
  label,
  detail,
  compact = false,
}: {
  label: string
  detail?: string
  compact?: boolean
}) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const started = Date.now()
    const timer = window.setInterval(
      () => setSeconds(Math.floor((Date.now() - started) / 1000)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [])
  return (
    <div
      className={`query-loading${compact ? ' compact' : ''}`}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        className="query-loading-spinner"
        size={compact ? 19 : 30}
        aria-hidden="true"
      />
      <div>
        <strong>{label}</strong>
        {detail && <small>{detail}</small>}
        <small className="query-loading-time" aria-live="off">
          {seconds > 0
            ? `${seconds}s aguardando resposta`
            : 'Consultando a base…'}
        </small>
      </div>
    </div>
  )
}
