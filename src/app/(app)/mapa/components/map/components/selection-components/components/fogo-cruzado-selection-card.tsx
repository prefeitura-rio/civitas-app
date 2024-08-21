import '@/utils/string-extensions'

import { formatDate } from 'date-fns'
import { Minus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
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
    Data: selected?.date
      ? formatDate(selected?.date, 'dd/MM/yyyy HH:mm')
      : undefined,
    Endereço: selected?.address,
    Bairro: selected?.neighborhood.name,
    'Sub-bairro': selected?.subNeighborhood,
    Localidade: selected?.locality?.name,
    Longitude: selected?.longitude,
    Latitude: selected?.latitude,
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
    Situação:
      item.situation === 'Dead'
        ? 'Morta'
        : item.situation === 'Wounded'
          ? 'Ferida'
          : item.situation,
    Circunstâncias: item.circumstances.map((item) => item.name).join(', '),
    'Data da Morte': item.deathDate,
    'Tipo de Pessoa': item.personType,
    Idade: item.age,
    'Grupo Etário': item.ageGroup.name,
    Gênero: item.genre.name,
    Raça: item.race,
    Lugar: item.place.name,
    'Status de Serviço': item.serviceStatus.name,
    Qualificações: item.qualifications.map((item) => item.name).join(', '),
    'Posição Política': item.politicalPosition?.name,
    'Status Político': item.politicalStatus?.name,
    Partido: item.partie?.name,
    Cooporação: item.coorporation?.name,
    'Posição do Agente': item.agentPosition?.name,
    'Status do Agente': item.agentStatus?.name,
    Unidade: item.unit,
  }))

  const animalVictims = selected?.animalVictims.map((item) => ({
    Nome: item.name,
    'Tipo de Animal': item.animalType,
    Situação:
      item.situation === 'Dead'
        ? 'Morta'
        : item.situation === 'Wounded'
          ? 'Ferida'
          : item.situation,
    Circunstâncias: item.circumstances.map((item) => item.name).join(', '),
    'Data da Morte': item?.deathDate
      ? formatDate(item.deathDate, 'dd/MM/yyyy HH:mm')
      : item.deathDate,
  }))

  function setOpen(open: boolean) {
    if (!open) {
      setSelected(null)
    }
  }

  return (
    <Dialog open={!!selected} onOpenChange={setOpen}>
      <DialogContent className="m-2 h-[48rem] w-[48rem] overflow-y-scroll">
        <DialogHeader className="sr-only">
          <DialogTitle>Informações da ocorrência</DialogTitle>
        </DialogHeader>
        <div className="">
          <h4>Informações básicas:</h4>
          <div className="space-y-1">
            {Object.entries(simpleFields).map(([key, value]) => (
              <div className="flex gap-2">
                <Label className="text-sm font-medium">{key}:</Label>
                {value ? (
                  <span className="mt-1 text-sm leading-3.5 text-muted-foreground">
                    {value}
                  </span>
                ) : (
                  <Minus className="size-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          <h4 className="mt-10">Contexto:</h4>
          <div className="space-y-1">
            {Object.entries(contextFields).map(([key, value]) => (
              <div className="flex gap-2">
                <Label className="text-sm font-medium">{key}:</Label>
                {value ? (
                  <span className="mt-1 text-sm leading-3.5 text-muted-foreground">
                    {value}
                  </span>
                ) : (
                  <Minus className="size-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          <h4 className="mt-10">{`Vítimas Humanas (${victims?.length}):`}</h4>
          <div className="space-y-2">
            {victims?.map((victim, index) => (
              <div key={index}>
                <div>{`Vítima ${index + 1}:`}</div>
                {Object.entries(victim).map(([key, value]) => (
                  <div className="flex gap-2">
                    <Label className="text-sm font-medium">{key}:</Label>
                    {value ? (
                      <span className="mt-1 text-sm leading-3.5 text-muted-foreground">
                        {value}
                      </span>
                    ) : (
                      <Minus className="size-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <h4 className="mt-10">{`Vítimas Animais (${animalVictims?.length}):`}</h4>
          <div className="space-y-2">
            {animalVictims?.map((victim, index) => (
              <div key={index}>
                <div>{`Vítima ${index + 1}:`}</div>
                {Object.entries(victim).map(([key, value]) => (
                  <div className="flex gap-2">
                    <Label className="text-sm font-medium">{key}:</Label>
                    {value ? (
                      <span className="mt-1 text-sm leading-3.5 text-muted-foreground">
                        {value}
                      </span>
                    ) : (
                      <Minus className="size-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
