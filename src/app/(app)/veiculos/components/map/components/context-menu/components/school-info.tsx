import type { PickingInfo } from 'deck.gl'
import { Calendar, MapPin } from 'lucide-react'

import { Label, Value } from '@/components/custom/typography'
import { Separator } from '@/components/ui/separator'
import type { School } from '@/models/entities'

export function SchoolInfo({
  pickingInfo,
}: {
  pickingInfo: PickingInfo<School>
}) {
  return (
    <div className="h-full w-full">
      <h4>Escola Municipal</h4>
      <Separator className="mb-4 mt-1 bg-secondary" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <MapPin className="shinrk-0 size-3.5" />
            <Label>Nome</Label>
          </div>
          <Value>{pickingInfo.object?.denominacao}</Value>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Calendar className="shinrk-0 size-3.5" />
            <Label>Tipo</Label>
          </div>
          <Value>{pickingInfo.object?.tipo}</Value>
        </div>
      </div>
    </div>
  )
}
