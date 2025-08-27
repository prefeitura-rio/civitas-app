import '@/utils/string-extensions'

import { Circle, MapPin, Speech } from 'lucide-react'

import { Card } from '@/components/ui/card'
import type { Report } from '@/models/entities'

interface ReportCard {}

export function ReportCard(props: Report) {
  return (
    <div className="w-full pb-14">
      <Card className="-mt-10 grid grid-cols-1">
        <div className="grid grid-cols-9 gap-2 p-8">
          <div className="col-span-2 flex gap-2">
            <MapPin className="h-5 w-5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm leading-3.5">Local</span>
              <span className="block text-sm text-muted-foreground">
                {props.location?.capitalizeFirstLetter()}
              </span>
            </div>
          </div>

          <div className="col-span-1 flex flex-col">
            <span className="text-sm leading-3.5">Origem</span>
            <span className="block text-muted-foreground">
              {props.sourceId}
            </span>
          </div>

          <div className="col-span-3 flex flex-col">
            <span className="text-sm leading-3.5">Orgãos</span>
            <ul className="text-muted-foreground">
              {props.entities.map((item, index) => (
                <li key={index} className="list-inside list-disc">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-3 flex flex-col">
            <span className="text-sm leading-3.5">Tipos e Subtipos</span>
            <ul className="text-muted-foreground">
              {props.typeAndSubtype.map((item) => (
                <>
                  <li className="list-inside list-disc">{item.type}</li>
                  <ul>
                    {item.subtype.map((subtype, index) => (
                      <li
                        key={index}
                        className="list- ml-4 flex list-inside items-start gap-2"
                      >
                        <Circle className="mt-3 size-1" />
                        <span>{subtype}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-2 border-t-2 p-8">
          <Speech className="h-6 w-6 shrink-0" />
          <div>
            <span className="text-sm leading-3.5">Descrição</span>
            <p className="block text-sm text-muted-foreground">
              {props.description}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
