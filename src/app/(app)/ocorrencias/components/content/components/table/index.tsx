import { format } from 'date-fns'
import { MapPin, Speech } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { useReportsMap } from '@/hooks/use-contexts/use-reports-map-context'
import { cn } from '@/lib/utils'

interface TableProps {
  className?: string
}

export function Table({ className }: TableProps) {
  const {
    layers: {
      reports: { data },
    },
  } = useReportsMap()

  return (
    <div className={cn(className, 'mt-10 space-y-4')}>
      <h3>Histórico de ocorrências:</h3>
      <div className="pt-10">
        {data.map((item, index) => (
          <div key={index} className="flex h-full">
            <div className="flex w-[40rem] justify-end gap-4 px-4">
              <div className="flex flex-col items-end">
                <span className="text-lg font-semibold leading-5 text-primary">
                  {format(item.date, 'dd.MM.y')}
                </span>
                <span className="text-muted-foreground">
                  {format(item.date, 'HH:mm')}
                </span>
              </div>
              <div className="relative flex h-full flex-col items-center px-2">
                <div className="z-10 h-6 w-6 shrink-0 rounded-full bg-muted opacity-50"></div>
                <div className="z-20 mt-[-1.125rem] h-3 w-3 shrink-0 rounded-full bg-primary" />

                <div className="-mt-1 h-[60%] w-0 border-[2px] border-muted" />
                <div className="h-full w-0 border-[2px] border-dashed border-muted" />
              </div>
            </div>

            <div className="pb-14">
              <Card className="-mt-10 grid grid-cols-1">
                <div className="col-span-5 grid grid-cols-5 p-8">
                  <div className="col-span-2 flex gap-2">
                    <MapPin className="h-6 w-6 shrink-0" />
                    <div className="flex flex-col">
                      <h4>Local</h4>
                      <span className="block text-muted-foreground">
                        {item.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <h4>Tipo</h4>
                    <span className="block text-muted-foreground">
                      {item.type}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <h4>Subtipo</h4>
                    <span className="block text-muted-foreground">
                      {item.subtype}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <h4>Origem</h4>
                    <span className="block text-muted-foreground">
                      {item.origin}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 border-t-2 p-8">
                  <Speech className="h-6 w-6 shrink-0" />
                  <div>
                    <h4>{item.title}</h4>
                    <p className="block text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
