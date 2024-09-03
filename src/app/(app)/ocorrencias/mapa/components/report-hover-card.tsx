import '@/utils/string-extensions'

import { useQuery } from '@tanstack/react-query'
import { formatDate } from 'date-fns'
import { Circle } from 'lucide-react'

import { Spinner } from '@/components/custom/spinner'
import { Card } from '@/components/ui/card'
import { useReportsMap } from '@/hooks/use-contexts/use-reports-map-context'
import { getReports } from '@/http/reports/get-reports'

export function ReportHoverCard() {
  const {
    layers: {
      reports: {
        layerStates: { hoverInfo },
      },
    },
  } = useReportsMap()

  const { data } = useQuery({
    queryKey: ['report', hoverInfo.object?.reportId],
    queryFn: () =>
      getReports({ reportId: hoverInfo.object?.reportId }).then((item) =>
        item.items.at(0),
      ),
    enabled: !!hoverInfo.object,
  })

  const left =
    hoverInfo.x < (hoverInfo.viewport?.width || 0) / 2 ? hoverInfo.x : undefined
  const top =
    hoverInfo.y < (hoverInfo.viewport?.height || 0) / 2
      ? hoverInfo.y
      : undefined
  const right =
    hoverInfo.x > (hoverInfo.viewport?.width || 0) / 2
      ? (hoverInfo.viewport?.width || 0) - hoverInfo.x
      : undefined
  const bottom =
    hoverInfo.y > (hoverInfo.viewport?.height || 0) / 2
      ? (hoverInfo.viewport?.height || 0) - hoverInfo.y
      : undefined
  return (
    <>
      {hoverInfo.object && (hoverInfo.x !== 0 || hoverInfo.y !== 0) && (
        <Card
          style={{ left, top, bottom, right, zIndex: 1 }}
          className="pointer-events-none absolute w-96 px-3 py-2"
        >
          {data ? (
            <div className="spave-y-1 text-xs leading-4">
              <div className="flex gap-2">
                <span className="font-medium">Data:</span>
                <span className="text-muted-foreground">
                  {formatDate(data.date, 'dd/MM/y HH:mm')}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium">Fonte:</span>
                <span className="text-muted-foreground">{data.sourceId}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium">Categoria:</span>
                <span className="text-muted-foreground">{data.category}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium">Logradouro:</span>
                <span className="text-muted-foreground">{data.location}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium">Número Logradouro:</span>
                <span className="text-muted-foreground">
                  {data.locationNumber}
                </span>
              </div>

              <div className="">
                <span className="font-medium">Órgãos:</span>
                <ul className="pl-4">
                  {data.entities.map((item) => (
                    <li className="list-inside list-disc text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="">
                <span className="font-medium">Tipos e Subtipos: </span>
                <ul className="pl-4 text-muted-foreground">
                  {data.typeAndSubtype.map((item) => (
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
                  {data.description}
                </span>
              </div>
            </div>
          ) : (
            <Spinner />
          )}
        </Card>
      )}
    </>
  )
}
