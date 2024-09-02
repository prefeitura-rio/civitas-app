import '@/utils/string-extensions'

import { formatDate } from 'date-fns'
import { Circle } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { useReportsMap } from '@/hooks/use-contexts/use-reports-map-context'

export function ReportHoverCard() {
  const {
    layers: {
      reports: {
        layerStates: {
          hoverInfo: { object, x, y },
        },
      },
    },
  } = useReportsMap()

  return (
    <>
      {object && (x !== 0 || y !== 0) && (
        <Card
          style={{ left: x, top: y, zIndex: 1 }}
          className="pointer-events-none absolute min-w-40 max-w-screen-sm px-3 py-2"
        >
          <div className="spave-y-1 text-xs leading-4">
            <div className="flex gap-2">
              <span className="font-medium">Data:</span>
              <span className="text-muted-foreground">
                {formatDate(object.date, 'dd/MM/y HH:mm')}
              </span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium">Fonte:</span>
              <span className="text-muted-foreground">{object.sourceId}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium">Categoria:</span>
              <span className="text-muted-foreground">{object.category}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium">Logradouro:</span>
              <span className="text-muted-foreground">{object.location}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium">Número Logradouro:</span>
              <span className="text-muted-foreground">
                {object.locationNumber}
              </span>
            </div>

            <div className="">
              <span className="font-medium">Órgãos:</span>
              <ul className="pl-4">
                {object.entities.map((item) => (
                  <li className="list-inside list-disc text-muted-foreground">
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="">
              <span className="font-medium">Tipos e Subtipos: </span>
              <ul className="pl-4 text-muted-foreground">
                {object.typeAndSubtype.map((item) => (
                  <>
                    <li className="list-inside list-disc">
                      {item.type.capitalizeFirstLetter()}
                    </li>
                    <ul>
                      {item.subtype.map((subtype) => (
                        <li className="list- ml-4 flex list-inside items-start gap-2">
                          <Circle className="mt-1.5 size-1" />
                          <span>{subtype.capitalizeFirstLetter()}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ))}
              </ul>
            </div>

            <div className="">
              <span className="font-medium">Descrição:</span>
              <span className="block pl-4 text-muted-foreground">
                {object.description}
              </span>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
