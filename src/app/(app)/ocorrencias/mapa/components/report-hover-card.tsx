import '@/utils/string-extensions'

import { useQuery } from '@tanstack/react-query'
import { formatDate } from 'date-fns'
import { Circle } from 'lucide-react'

import { MapHoverCard } from '@/components/custom/map-hover-card'
import { Spinner } from '@/components/custom/spinner'
import { useReportsMap } from '@/hooks/useContexts/use-reports-map-context'
import { getReports } from '@/http/reports/get-reports'

export function ReportHoverCard() {
  const {
    layers: {
      reports: {
        layerStates: { hoverInfo },
      },
    },
  } = useReportsMap()

  const object = hoverInfo?.object

  const { data } = useQuery({
    queryKey: ['report', object?.reportId],
    queryFn: () =>
      getReports({ reportId: object?.reportId }).then((item) =>
        item.items.at(0),
      ),
    enabled: !!object,
  })

  return (
    <MapHoverCard hoveredObject={hoverInfo}>
      {data ? (
        <div className="spave-y-1 text-xs leading-4">
          <div className="flex gap-2">
            <span className="font-medium">Data:</span>
            <span className="text-muted-foreground">
              {formatDate(data.date, 'dd/MM/y HH:mm')}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="font-medium">ID:</span>
            <span className="text-muted-foreground">{data.reportId}</span>
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
            <span className="text-muted-foreground">{data.locationNumber}</span>
          </div>

          <div className="">
            <span className="font-medium">Órgãos:</span>
            <ul className="pl-4">
              {data.entities.map((item, index) => (
                <li
                  key={index}
                  className="list-inside list-disc text-muted-foreground"
                >
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
                    {item.subtype.map((subtype, index) => (
                      <li
                        key={index}
                        className="list- ml-4 flex list-inside items-start gap-2"
                      >
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
    </MapHoverCard>
  )
}
