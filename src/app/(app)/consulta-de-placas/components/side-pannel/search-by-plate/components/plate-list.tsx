import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'

export function PlateList() {
  const { possiblePlates, getCarPath, lastSearchParams } = useCarPath()
  if (!possiblePlates || !lastSearchParams) return null

  async function handlePlateClick(plate: string) {
    if (!lastSearchParams) return
    await getCarPath({
      placa: plate,
      startTime: lastSearchParams?.startTime,
      endTime: lastSearchParams?.endTime,
    })
  }

  function styleAsterisk(word: string | undefined) {
    if (!word) return [<span></span>]
    return Array.from(lastSearchParams?.placa || '').map((char, index) => {
      if (char === '*') {
        return <span className="text-primary">{word[index]}</span>
      }
      return <span>{word[index]}</span>
    })
  }

  return (
    <div className="h-[calc(100%-15rem)] space-y-2">
      <div>
        <h4 className="text-muted-foreground">
          Resultado para{' '}
          <span className="code-highlight">{lastSearchParams.placa}</span>
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
            {styleAsterisk(plate)}
            <span>{}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
