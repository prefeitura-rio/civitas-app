import '@/utils/string-extensions'

import { formatDate } from 'date-fns'
import { Circle } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { useReportsMap } from '@/hooks/use-contexts/use-reports-map-context'

export function ReportHoverInfoTooltip() {
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
              <span className="font-medium text-muted-foreground">Data:</span>
              <span>{formatDate(object.date, 'dd/mm/y HH:mm')}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground">Fonte:</span>
              <span>{object.sourceId}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground">
                Categoria:
              </span>
              <span>{object.category}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground">
                Logradouro:
              </span>
              <span>{object.location}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground">
                Número Logradouro:
              </span>
              <span>{object.locationNumber}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground">Órgãos:</span>
              <span>{object.entities.map((item) => item.name).join(', ')}</span>
            </div>

            <div>
              <span className="font-medium text-muted-foreground">
                Tipos e Subtipos:{' '}
              </span>
              <ul>
                {object.typeAndSubtype.map((item) => (
                  <>
                    <li className="ml-4 list-inside list-disc">
                      {item.type.capitalizeFirstLetter()}
                    </li>
                    <ul>
                      {item.subtype.map((subtype) => (
                        <li className="list- ml-8 flex list-inside items-center gap-2">
                          <Circle className="size-1" />
                          <span>{subtype.capitalizeFirstLetter()}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground">
                Descrição:
              </span>
              <span>{object.description}</span>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
