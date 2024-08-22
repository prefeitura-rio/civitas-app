import { formatDate } from 'date-fns'

import { Card, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useMap } from '@/hooks/use-contexts/use-map-context'

const empty = ['Não se aplica', 'Sem identificação', 'Não identificado']

export function FogoCruzadoHoverCard() {
  const {
    layers: {
      fogoCruzadoIncidents: {
        layerStates: {
          hoverInfo: { object, x, y },
        },
      },
    },
  } = useMap()

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
    <>
      {object && (x !== 0 || y !== 0) && (
        <Card
          style={{ left: x, top: y, zIndex: 1 }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
          <CardTitle className="sr-only">Iformações da ocorrência</CardTitle>

          <div className="space-y-6">
            <div>
              <span className="mb-1 block text-lg font-medium">
                Informações básicas:
              </span>
              <div className="space-y-1 pl-4">
                {Object.entries(simpleFields).map(
                  ([key, value]) =>
                    value &&
                    !empty.includes(value.toString()) && (
                      <div className="flex gap-2">
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
                  ([key, value]) =>
                    value &&
                    !empty.includes(value) && (
                      <div className="flex gap-2">
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
        </Card>
      )}
    </>
  )
}
