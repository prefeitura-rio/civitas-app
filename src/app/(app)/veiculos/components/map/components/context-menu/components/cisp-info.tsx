import * as turf from '@turf/turf'
import type { PickingInfo } from 'deck.gl'
import type { Feature, Geometry } from 'geojson'
import { Phone, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useMap } from '@/hooks/useContexts/use-map-context'
import type { CISP } from '@/models/entities'

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
  pickingInfo: PickingInfo<Feature<Geometry, CISP>>
}) {
  const { object } = pickingInfo
  const {
    layers: {
      radars: { setSelectedObjects: setSelectedRadars, data: radars },
      AISP: {
        features: { features: aisps },
      },
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

  const aisp = aisps.find(
    (aisp) => aisp.properties.aisp === object?.properties.aisp,
  )

  return (
    <div className="h-full w-full">
      <h4>Circunscrições Integradas de Segurança Pública (CISP)</h4>
      <Separator className="mb-4 mt-1 bg-secondary" />
      <div className="flex flex-col gap-4">
        <InfoItem
          icon={User}
          label="Unidade CISP"
          value={object?.properties?.nome}
        />
        <InfoItem
          icon={User}
          label="Unidade AISP"
          value={aisp?.properties.unidade}
        />

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
