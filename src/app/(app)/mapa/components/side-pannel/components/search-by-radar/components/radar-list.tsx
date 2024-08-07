import { zodResolver } from '@hookform/resolvers/zod'
import { formatDate } from 'date-fns'
import { Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { TooltipInfoItem } from '@/app/(app)/mapa/components/common/tooltip-info-item'
import { Button } from '@/components/ui/button'
import { Card, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { cn } from '@/lib/utils'
import type { Radar } from '@/models/entities'

const selectRadarFormSchema = z.object({
  cameraNumber: z.string().min(1),
})

type SelectRadarForm = z.infer<typeof selectRadarFormSchema>

export function RadarList() {
  const {
    deckRef,
    setViewport,
    layers: {
      radars: {
        layerStates: {
          hoverInfo,
          setHoverInfo,
          selectedRadar,
          setSelectedRadar,
        },
        data,
      },
    },
  } = useMap()
  const { register, handleSubmit } = useForm<SelectRadarForm>({
    resolver: zodResolver(selectRadarFormSchema),
  })

  const deck = deckRef.current?.deck

  const objects = deckRef.current?.deck?.pickObjects({
    x: 0,
    y: 0,
    width: deck?.width,
    height: deck?.height,
    layerIds: ['radars'],
    maxObjects: 20,
  })

  function onSubmit(props: SelectRadarForm) {
    const radar = data.find(
      (item) =>
        item.cameraNumber === props.cameraNumber ||
        item.cetRioCode === props.cameraNumber,
    )

    if (!radar) {
      toast.warning('Radar não encontrado!')
      return
    }

    setSelectedRadar(radar)
    setViewport({
      latitude: radar.latitude,
      longitude: radar.longitude,
      zoom: 20,
    })
  }

  return (
    !selectedRadar && (
      <div className="h-[calc(100%-3.25rem)] w-full space-y-2 overflow-y-scroll">
        <CardDescription>Selecione um radar:</CardDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 px-1">
          <Input
            {...register('cameraNumber')}
            placeholder="Número Câmera / Código CET-Rio"
          />
          <Button type="button" onClick={handleSubmit(onSubmit)}>
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          ⚠️ Atenção! Radares são considerados inativos se não enviarem dados há
          mais de 24 horas. No entanto, essa informação não é atualizada em
          tempo real e pode seguir desatualizada por várias horas.
        </p>

        {objects?.map((item, index) => {
          const props: Radar = item.object
          return (
            <Card
              key={index}
              className={cn(
                'p-2 hover:cursor-pointer hover:bg-secondary',
                props.cameraNumber === hoverInfo.object?.cameraNumber
                  ? 'bg-secondary'
                  : '',
              )}
              onMouseEnter={() => {
                setHoverInfo(item)
              }}
              onMouseLeave={() =>
                setHoverInfo({
                  ...item,
                  object: undefined,
                })
              }
              onClick={() => {
                setSelectedRadar(props)
                setHoverInfo({
                  ...item,
                  object: undefined,
                })
              }}
            >
              <TooltipInfoItem
                label="Número Câmera"
                value={props.cameraNumber}
              />
              <TooltipInfoItem
                label="Código CET-Rio"
                value={props.cetRioCode}
              />
              <TooltipInfoItem label="Localização" value={props.location} />
              <TooltipInfoItem
                label="Latitude"
                value={props.latitude.toString()}
              />
              <TooltipInfoItem
                label="Longitude"
                value={props.longitude.toString()}
              />
              <TooltipInfoItem label="Bairro" value={props.district} />
              <TooltipInfoItem label="Logradouro" value={props.streetName} />
              <TooltipInfoItem label="Sentido" value={props.direction || ''} />
              <TooltipInfoItem label="Empresa" value={props.company || ''} />
              <TooltipInfoItem
                label="Última detecção"
                value={
                  props.lastDetectionTime
                    ? formatDate(
                        props.lastDetectionTime,
                        "dd/MM/yyyy 'às' HH:mm:ss",
                      )
                    : ''
                }
              />
              <TooltipInfoItem
                label="Ativo nas últimas 24 horas"
                value={props.activeInLast24Hours ? 'Sim' : 'Não'}
              />
            </Card>
          )
        })}
      </div>
    )
  )
}
