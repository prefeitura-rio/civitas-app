import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useMap } from '@/hooks/use-contexts/use-map-context'

export function PlateList() {
  const {
    layers: {
      trips: { possiblePlates, getTrips, lastSearchParams },
    },
  } = useMap()
  if (!possiblePlates || !lastSearchParams) return null

  async function handlePlateClick(plate: string) {
    if (!lastSearchParams) return
    await getTrips({
      plate,
      startTime: lastSearchParams?.startTime,
      endTime: lastSearchParams?.endTime,
    })
  }

  return (
    <div className="h-[calc(100%-15rem)] space-y-2">
      <div className="w-full text-center">
        <h4 className="text-muted-foreground">
          Resultado para{' '}
          <span className="code-highlight">{lastSearchParams.plate}</span>
        </h4>
        <span className="block text-sm text-muted-foreground">
          {`De ${format(lastSearchParams.startTime, "dd 'de' MMMM 'de' y 'às' HH'h'mm'min'", { locale: ptBR })}`}
        </span>
        <span className="block text-sm text-muted-foreground">
          {`Até  ${format(lastSearchParams.endTime, "dd 'de' MMMM 'de' y 'às' HH'h'mm'min'", { locale: ptBR })}`}
        </span>
      </div>
      <ul className="mb-4 h-[calc(100%-4.75rem)] space-y-2 overflow-y-scroll rounded p-2">
        {possiblePlates.map((plate) => (
          <li
            onClick={() => handlePlateClick(plate)}
            className="selectable-item"
          >
            <span>{plate}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
