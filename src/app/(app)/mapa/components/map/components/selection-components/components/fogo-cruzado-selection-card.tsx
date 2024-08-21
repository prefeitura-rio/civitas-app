import { formatDate } from 'date-fns'
import { Minus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function FogoCruzadoSelectionCard() {
  const {
    layers: {
      fogoCruzadoIncidents: {
        layerStates: { selected, setSelected },
      },
    },
  } = useMap()

  const simpleFields = {
    ID: selected?.id,
    'Número do Documento': selected?.documentNumber,
    Endereço: selected?.address,
    Bairro: selected?.neighborhood.name,
    'Sub-bairro': selected?.subNeighborhood,
    Localidade: selected?.locality?.name,
    Longitude: selected?.longitude,
    Latitude: selected?.latitude,
    Data: selected?.date
      ? formatDate(selected?.date, 'dd/MM/yyyy HH:mm')
      : undefined,
    'Ação Policial': selected?.policeAction ? 'Sim' : 'Não',
    'Presença de Agentes': selected?.agentPresence ? 'Sim' : 'Não',
    'Registros Relacionados': selected?.relatedRecord,
  }
  const contextFields = {
    'Motivo Principal': selected?.contextInfo.mainReason.name,
    'Motivos Complementares': selected?.contextInfo.complementaryReasons
      .map((item) => item.name)
      .join(', '),
    'Recortes Relevantes': selected?.contextInfo.clippings
      .map((item) => item.name)
      .join(', '),
    Massacre: selected?.contextInfo.massacre ? 'Sim' : 'Não',
    'Unidade Policial': selected?.contextInfo.policeUnit,
  }

  const victims = selected?.victims.map((item) => ({
    ID: item.id,
    'ID da Ocorrência': item.occurrenceId,
    Tipo: item.type,
    Situação: item.situation,
    Circunstâncias: item.circumstances
      .map((item) => `${item.id} (tipo: ${item.type})`)
      .join(', '),
    'Data da Morte': item.deathDate,
    'Tipo de Pessoa': item.personType,
    Idade: item.age,
    'Grupo Etário': item.ageGroup.name,
    Gênero: item.genre.name,
    Raça: item.race,
    Lugar: item.place.name,
    'Status de Serviço': item.serviceStatus.name,
    Qualificações: item.qualifications.map((item) => item.name).join(', '),
    'Posição Política': item.politicalPosition.name,
    'Status Político': item.politicalStatus.name,
    // Partido: item.partie,
    Cooporação: item.coorporation.name,
    'Posição do Agente': item.agentPosition.name,
    'Status do Agente': item.agentStatus.name,
    Unidade: item.unit,
  }))

  function setOpen(open: boolean) {
    if (!open) {
      setSelected(null)
    }
  }

  console.log({ selected })

  return (
    <Dialog open={!!selected} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        <div className="h-96 overflow-y-scroll">
          <h4>Informações</h4>
          <div className="space-y-1">
            {Object.entries(simpleFields).map(([key, value]) => (
              <div className="flex gap-2">
                <Label className="text-sm font-medium">{key}:</Label>
                <span className="mt-1 text-sm leading-3.5 text-muted-foreground">
                  {value || <Minus className="-ml-1" />}
                </span>
              </div>
            ))}
          </div>

          <h4>Contexto</h4>
          <div className="space-y-1">
            {Object.entries(contextFields).map(([key, value]) => (
              <div className="flex gap-2">
                <Label className="text-sm font-medium">{key}:</Label>
                <span className="mt-1 text-sm leading-3.5 text-muted-foreground">
                  {value || <Minus className="-ml-1" />}
                </span>
              </div>
            ))}
          </div>

          <h4>Vítimas</h4>
          <div className="space-y-1">
            {victims?.map((victim) =>
              Object.entries(victim).map(([key, value]) => (
                <div className="flex gap-2">
                  <Label className="text-sm font-medium">{key}:</Label>
                  <span className="mt-1 text-sm leading-3.5 text-muted-foreground">
                    {value || <Minus className="-ml-1" />}
                  </span>
                </div>
              )),
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
