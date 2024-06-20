import { useCarPath } from '@/hooks/useCarPathContext'

export function Map() {
  const { selectedTripIndex } = useCarPath()
  return (
    <div className="flex h-[43rem] w-full flex-col items-center justify-center rounded-lg bg-gray-500">
      <h2 className="block">Trip</h2>
      <h3 className="block">{selectedTripIndex}</h3>
    </div>
  )
}
