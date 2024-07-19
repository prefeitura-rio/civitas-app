import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'

export function LastSearchParams() {
  const { lastSearchParams } = useCarPath()
  if (!lastSearchParams) return null

  return (
    <div className="rounded">
      <h1>LastSearchParams</h1>
    </div>
  )
}
