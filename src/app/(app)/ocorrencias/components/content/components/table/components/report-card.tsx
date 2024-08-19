import { Circle, MapPin, Speech } from 'lucide-react'

import { Card } from '@/components/ui/card'
import type { Report } from '@/models/entities'

interface ReportCard {}

export function ReportCard(props: Report) {
  return (
    <div className="w-full pb-14">
      <Card className="-mt-10 grid grid-cols-1">
        <div className="grid grid-cols-9 p-8">
          <div className="col-span-2 flex gap-2">
            <MapPin className="h-5 w-5 shrink-0" />
            <div className="flex flex-col">
              <span className="leading-3.5 text-sm">Local</span>
              <span className="block text-sm text-muted-foreground">
                {props.location.capitalizeFirstLetter()}
              </span>
            </div>
          </div>

          <div className="col-span-1 flex flex-col">
            <span className="leading-3.5 text-sm">Origem</span>
            <span className="block text-muted-foreground">
              {props.sourceId}
            </span>
          </div>

          <div className="col-span-3 flex flex-col">
            <span className="leading-3.5 text-sm">Orgãos</span>
            <ul className="text-muted-foreground">
              {props.entities.map((item) => (
                <li className="list-inside list-disc">
                  {item.name.capitalizeFirstLetter()}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-3 flex flex-col">
            <span className="leading-3.5 text-sm">Tipos e Subtipos</span>
            <ul className="text-sm text-muted-foreground">
              {props.typeAndSubtype.map((item) => (
                <>
                  <li className="list-inside list-disc">
                    {item.type.toLocaleLowerCase()}
                  </li>
                  <ul>
                    {item.subtype.map((subtype) => (
                      <li className="list- ml-4 flex list-inside items-start gap-2">
                        <Circle className="mt-3 size-1" />
                        <span>{subtype.toLocaleLowerCase()}</span>
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
            <span className="leading-3.5 text-sm">{'Sem título'}</span>
            <p className="block text-sm text-muted-foreground">
              {props.description}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
