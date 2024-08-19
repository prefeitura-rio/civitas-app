import { MapPin, Speech } from 'lucide-react'

import { Card } from '@/components/ui/card'
import type { Report } from '@/models/entities'

interface ReportCard {}

export function ReportCard(props: Report) {
  return (
    <div className="w-full pb-14">
      <Card className="-mt-10 grid grid-cols-1">
        <div className="grid grid-cols-5 p-8">
          <div className="col-span-1 flex gap-2">
            <MapPin className="h-6 w-6 shrink-0" />
            <div className="flex flex-col">
              <h4>Local</h4>
              <span className="block text-muted-foreground">
                {props.location}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <h4>Tipo</h4>
            <span className="block text-muted-foreground">
              {props.typeAndSubtype.at(0)?.type}
            </span>
          </div>

          <div className="flex flex-col">
            <h4>Subtipo</h4>
            <span className="block text-muted-foreground">
              {props.typeAndSubtype.at(0)?.subtype.join(', ')}
            </span>
          </div>

          <div className="flex flex-col">
            <h4>Origem</h4>
            <span className="block text-muted-foreground">
              {props.sourceId}
            </span>
          </div>

          <div className="flex flex-col">
            <h4>Orgãos</h4>
            <span className="block text-muted-foreground">
              {props.entities.map((item) => item.name).join(', ')}
            </span>
          </div>
        </div>

        <div className="flex gap-2 border-t-2 p-8">
          <Speech className="h-6 w-6 shrink-0" />
          <div>
            <h4>{'Sem título'}</h4>
            <p className="block text-muted-foreground">{props.description}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
