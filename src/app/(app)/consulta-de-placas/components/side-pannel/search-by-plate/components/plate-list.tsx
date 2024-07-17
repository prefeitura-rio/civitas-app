import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'

export function PlateList() {
  const { possiblePlates, getCarPath, lastSearchParams } = useCarPath()
  if (!possiblePlates) return null

  async function handlePlateClick(plate: string) {
    if (!lastSearchParams) return
    await getCarPath({
      placa: plate,
      startTime: lastSearchParams?.startTime,
      endTime: lastSearchParams?.endTime,
    })
  }
  return (
    <div className="mb-4 h-full overflow-y-scroll">
      {possiblePlates?.map((plate) => (
        <p
          onClick={() => handlePlateClick(plate)}
          className="rounded bg-secondary px-2 font-bold"
        >
          {plate}
        </p>
      ))}
    </div>
  )
}
