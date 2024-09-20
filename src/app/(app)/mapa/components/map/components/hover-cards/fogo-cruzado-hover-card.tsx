import { formatDate } from 'date-fns'
import type { PickingInfo } from 'deck.gl'
import type { Dispatch, SetStateAction } from 'react'

import { MapHoverCard } from '@/components/custom/map-hover-card'
import { CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { FogoCruzadoIncident } from '@/models/entities'

const empty = ['Não se aplica', 'Sem identificação', 'Não identificado']

interface FogoCruzadoHoverCardProps {
  hoveredObject: PickingInfo<FogoCruzadoIncident> | null
  setIsHoveringInfoCard: Dispatch<SetStateAction<boolean>>
}

export function FogoCruzadoHoverCard({
  hoveredObject,
  setIsHoveringInfoCard,
}: FogoCruzadoHoverCardProps) {
  const object = hoveredObject?.object

  const simpleFields = {
    Data: object?.date
      ? formatDate(object?.date, 'dd/MM/yyyy HH:mm')
      : undefined,
    Endereço: object?.address,
    'Sub-bairro': object?.subNeighborhood,
    'Ação Policial': object?.policeAction ? 'Sim' : 'Não',
    'Presença de Agentes': object?.agentPresence ? 'Sim' : 'Não',
    'Registros Relacionados': object?.relatedRecord,
  }

  const contextFields = {
    'Motivo Principal': object?.contextInfo.mainReason.name,
    'Motivos Complementares': object?.contextInfo.complementaryReasons
      .map((item) => item.name)
      .join(', '),
    'Recortes Relevantes': object?.contextInfo.clippings
      .map((item) => item.name)
      .join(', '),
    Massacre: object?.contextInfo.massacre ? 'Sim' : 'Não',
    'Unidade Policial': object?.contextInfo.policeUnit,
  }

  return (
    <MapHoverCard hoveredObject={hoveredObject}>
      {object && (
        <div
          onMouseEnter={() => {
            setIsHoveringInfoCard(true)
          }}
          onMouseOut={() => {
            setIsHoveringInfoCard(false)
          }}
        >
          <CardTitle className="sr-only">Iformações da ocorrência</CardTitle>

          <div className="space-y-6">
            <div>
              <span className="mb-1 block text-lg font-medium">
                Informações básicas:
              </span>
              <div className="space-y-1 pl-4">
                {Object.entries(simpleFields).map(
                  ([key, value], index) =>
                    value &&
                    !empty.includes(value.toString()) && (
                      <div key={index} className="flex gap-2">
                        <Label className="text-sm font-medium leading-4">
                          {key}:
                        </Label>
                        <span className="text-sm leading-4 text-muted-foreground">
                          {value}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>

            <div>
              <span className="mb-1 block text-lg font-medium">Contexto:</span>
              <div className="space-y-1 pl-4">
                {Object.entries(contextFields).map(
                  ([key, value], index) =>
                    value &&
                    !empty.includes(value) && (
                      <div key={index} className="flex gap-2">
                        <Label className="text-sm font-medium leading-4">
                          {key}:
                        </Label>
                        <span className="text-sm leading-4 text-muted-foreground">
                          {value}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>

            <div>
              <span className="mb-1 block text-lg font-medium">Vítimas:</span>
              <div className="space-y-1 pl-4">
                <div className="flex gap-2">
                  <Label className="text-sm font-medium leading-4">
                    Humanas:
                  </Label>
                  <span className="text-sm leading-4 text-muted-foreground">
                    {object.victims.length}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Label className="text-sm font-medium leading-4">
                    Animais:
                  </Label>
                  <span className="text-sm leading-4 text-muted-foreground">
                    {object.animalVictims.length}
                  </span>
                </div>
              </div>
            </div>

            <span className="block text-sm text-muted-foreground">
              Clique para ver mais detalhes...
            </span>
          </div>
        </div>
      )}
    </MapHoverCard>
  )
}
