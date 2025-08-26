import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PickingInfo } from 'deck.gl'
import { Calendar, MapPin, ThumbsUp } from 'lucide-react'

import { Label, Value } from '@/components/custom/typography'
import { Separator } from '@/components/ui/separator'
import type { WazeAlert } from '@/models/entities'

export function WazePoliceAlertInfo({
  pickingInfo,
}: {
  pickingInfo: PickingInfo<WazeAlert>
}) {
  return (
    <div className="h-full w-full">
      <h4>Alerta Waze de Polícia</h4>
      <Separator className="mb-4 mt-1 bg-secondary" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <MapPin className="shinrk-0 size-3.5" />
              <Label>Logradouro</Label>
            </div>
            <Value>{pickingInfo.object?.street}</Value>
          </div>

          {pickingInfo.object?.timestamp && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Calendar className="shinrk-0 size-3.5" />
                <Label>Data e Hora</Label>
              </div>
              <Value>
                {formatDate(
                  pickingInfo.object.timestamp,
                  "dd/MM/y 'às' HH:mm",
                  { locale: ptBR },
                )}
              </Value>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <Label>Confiabilidade</Label>
            <Value>{pickingInfo.object?.reliability}</Value>
          </div>
          <div className="flex flex-col">
            <Label>Confiança</Label>
            <Value>{pickingInfo.object?.confidence}</Value>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <ThumbsUp className="shinrk-0 size-3.5" />
            <Label>Número de joinhas</Label>
          </div>
          <Value>{pickingInfo.object?.numberThumbsUp}</Value>
        </div>
      </div>
    </div>
  )
}
