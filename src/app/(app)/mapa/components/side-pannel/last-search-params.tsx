import { useMap } from '@/hooks/use-contexts/use-map-context'

export function LastSearchParams() {
  const {
    layers: {
      trips: { lastSearchParams },
    },
  } = useMap()
  if (!lastSearchParams) return null

  return (
    <div className="rounded">
      <h1>LastSearchParams</h1>
    </div>
  )
}
