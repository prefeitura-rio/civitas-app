import * as turf from '@turf/turf'
import type { PickingInfo } from 'deck.gl'
import type { Feature } from 'geojson'
import { Phone, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useMap } from '@/hooks/use-contexts/use-map-context'

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1">
      <Icon className="size-3.5 shrink-0" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
    <span className="text-xs">{value}</span>
  </div>
)

export function CISPInfo({
  pickingInfo,
}: {
  pickingInfo: PickingInfo<Feature>
}) {
  const { object } = pickingInfo
  const {
    layers: {
      radars: { setSelectedObjects: setSelectedRadars, data: radars },
    },
  } = useMap()

  function selectAllRadars() {
    const radarsInThePolygon = radars?.filter((radar) => {
      const point = turf.point([radar.longitude, radar.latitude])

      if (pickingInfo.object?.geometry?.type === 'Polygon') {
        return turf.booleanPointInPolygon(point, pickingInfo.object?.geometry)
      }
      if (pickingInfo.object?.geometry?.type === 'GeometryCollection') {
        return pickingInfo.object?.geometry.geometries.some((geometry) => {
          if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            return turf.booleanPointInPolygon(point, geometry)
          }
          return false
        })
      }
      return false
    })

    setSelectedRadars(radarsInThePolygon || [])
  }

  function removeAllRadars() {
    setSelectedRadars([])
  }

  return (
    <div className="h-full w-full">
      <h4>Circunscrições Integradas de Segurança Pública (CISP)</h4>
      <Separator className="mb-4 mt-1 bg-secondary" />
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              icon={User}
              label="Nome"
              value={object?.properties?.nome}
            />
            <InfoItem
              icon={User}
              label="Código CISP"
              value={object?.properties?.cisp}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold">Contato</h4>
          <Separator className="bg-secondary" />
          <div className="grid gap-4">
            <InfoItem
              icon={User}
              label="Responsável"
              value={object?.properties?.responsavel}
            />
            <InfoItem
              icon={Phone}
              label="Telefone do responsável"
              value={object?.properties?.telefone}
            />
            <InfoItem
              icon={Phone}
              label="Celular do responsável"
              value={object?.properties?.celular}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold">Ações</h4>
          <Separator className="bg-secondary" />
          <div className="flex flex-col gap-1">
            <Button variant="outline" onClick={selectAllRadars}>
              Selecionar todos os radares dessa área
            </Button>
            <Button variant="outline" onClick={removeAllRadars}>
              Remover todos os radares dessa área
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
