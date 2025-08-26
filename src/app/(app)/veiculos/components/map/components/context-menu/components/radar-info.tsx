import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PickingInfo } from 'deck.gl'
import { AlertTriangle, Building, History, MapPin } from 'lucide-react'

import { Label, Value } from '@/components/custom/typography'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Radar } from '@/models/entities'

export function RadarInfo({
  pickingInfo,
}: {
  pickingInfo: PickingInfo<Radar>
}) {
  return (
    <div className="h-full w-full">
      <h4>Radar OCR</h4>
      <Separator className="mb-4 mt-1 bg-secondary" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <Label>Código CET-Rio</Label>
          <Value>{pickingInfo.object?.cetRioCode}</Value>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <MapPin className="shinrk-0 size-3.5" />
            <Label>Localização</Label>
          </div>
          <Value>{`${pickingInfo.object?.location} - ${pickingInfo.object?.district}`}</Value>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <Label>Latitude</Label>
            <Value>{pickingInfo.object?.latitude}</Value>
          </div>
          <div className="flex flex-col">
            <Label>Longitude</Label>
            <Value>{pickingInfo.object?.longitude}</Value>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Building className="size-4 shrink-0" />
            <Label>Empresa</Label>
          </div>
          <Value>{pickingInfo.object?.company}</Value>
        </div>
        {pickingInfo.object?.lastDetectionTime && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <History className={cn('size-4 shrink-0')} />
                <Label>Última detecção</Label>
              </div>
              <Value>
                {formatDate(
                  pickingInfo.object?.lastDetectionTime,
                  "dd/MM/y 'às' HH:mm:ss",
                  { locale: ptBR },
                )}
              </Value>
            </div>
            <div className="flex flex-col">
              <Label>Ativo nas últimas 24 horas</Label>
              {pickingInfo.object?.activeInLast24Hours ? (
                <Value className="text-emerald-600">Sim</Value>
              ) : (
                <Value className="text-rose-600">Não</Value>
              )}
            </div>
          </div>
        )}

        {!pickingInfo.object?.activeInLast24Hours && (
          <div className="border-l-4 border-yellow-600 bg-secondary p-2">
            <div className="flex items-start">
              <AlertTriangle className="mr-2 mt-1 h-6 w-6 text-yellow-400" />
              <p className="text-sm text-gray-300">
                <span className="font-bold text-yellow-400">Atenção!</span>{' '}
                Radares são considerados inativos se não enviarem dados há mais
                de 24 horas. No entanto, essa informação não é atualizada em
                tempo real e pode seguir desatualizada por várias horas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
