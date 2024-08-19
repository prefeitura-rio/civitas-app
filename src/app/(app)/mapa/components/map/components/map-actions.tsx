import { TriangleAlert } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Tooltip } from '@/components/custom/tooltip'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { cn } from '@/lib/utils'

interface Switches {
  id: string
  label: string
  checked: boolean
  onCheckedChange: Dispatch<SetStateAction<boolean>>
  isLoading: boolean
  failed: boolean
}

export function MapActions() {
  const {
    layers: {
      camerasCOR,
      radars,
      wazePoliceAlerts,
      agents,
      fogoCruzadoIncidents,
    },
    isMapStyleSatellite,
    setIsMapStyleSatellite,
  } = useMap()

  const fixedSwitches: Switches[] = [
    {
      id: 'mapStyle',
      label: 'Satélite',
      checked: isMapStyleSatellite,
      onCheckedChange: setIsMapStyleSatellite,
      isLoading: false,
      failed: false,
    },
    {
      id: 'cameras',
      label: 'Câmeras',
      checked: camerasCOR.layerStates.isVisible,
      onCheckedChange: camerasCOR.layerStates.setIsVisible,
      isLoading: camerasCOR.layerStates.isLoading,
      failed: false,
    },
    {
      id: 'radars',
      label: 'Radares',
      checked: radars.layerStates.isVisible,
      onCheckedChange: radars.layerStates.setIsVisible,
      isLoading: radars.layerStates.isLoading,
      failed: false,
    },
    {
      id: 'waze-police-alerts',
      label: 'Alerta de polícia (Waze)',
      checked: wazePoliceAlerts.layerStates.isVisible,
      onCheckedChange: wazePoliceAlerts.layerStates.setIsVisible,
      isLoading: wazePoliceAlerts.layerStates.isLoading,
      failed: false,
    },
    {
      id: 'agents',
      label: 'Agentes',
      checked: agents.layerStates.isVisible,
      onCheckedChange: agents.layerStates.setIsVisible,
      isLoading: agents.layerStates.isLoading,
      failed: false,
    },
    {
      id: 'fogo-cruzado-incidents',
      label: 'Fogo Cruzado',
      checked: fogoCruzadoIncidents.layerStates.isVisible,
      onCheckedChange: fogoCruzadoIncidents.layerStates.setIsVisible,
      isLoading: fogoCruzadoIncidents.layerStates.isLoading,
      failed: fogoCruzadoIncidents.failed,
    },
  ]

  return (
    <Card className="absolute right-2 top-2 flex flex-col gap-2 whitespace-nowrap bg-card p-2 tracking-tighter">
      {fixedSwitches.map((item) => (
        <Tooltip
          hideContent={!item.failed}
          text={`Não foi possível carregar os dados da camada ${item.label}. Se o problema persistir, por favor, entre em contato com um administrador do sistema.`}
        >
          <div
            key={item.id}
            className="flex items-center justify-between gap-2"
          >
            <Switch
              id={item.id}
              size="sm"
              checked={item.checked}
              onCheckedChange={item.onCheckedChange}
              disabled={item.isLoading || item.failed}
            />
            <div className="flex items-center gap-2">
              {item.isLoading && <Spinner />}

              <div className="flex items-center gap-2">
                {item.failed && (
                  <TriangleAlert className="size-4 text-destructive" />
                )}

                <Label
                  htmlFor={item.id}
                  className={cn(
                    'text-xs',
                    item.isLoading ? 'text-muted-foreground' : '',
                    item.failed ? 'text-destructive' : '',
                  )}
                >
                  {item.label}
                </Label>
              </div>
            </div>
          </div>
        </Tooltip>
      ))}
    </Card>
  )
}
