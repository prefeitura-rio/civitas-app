import '@/utils/string-extensions'

import { formatDate } from 'date-fns'

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
    'Tipo de Pessoa':
      item.personType === 'Civilian' ? 'Civil' : item.personType,
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

  const empty = ['Não se aplica', 'Sem identificação', 'Não identificado']

  function setOpen(open: boolean) {
    if (!open) {
      setSelected(null)
    }
  }

  return (
    <Dialog open={!!selected} onOpenChange={setOpen}>
      <DialogContent className="m-2 max-h-[48rem] w-[48rem] overflow-y-scroll">
        <DialogHeader className="">
          <DialogTitle>Informações da ocorrência:</DialogTitle>
        </DialogHeader>
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
            <span className="mb-1 block text-lg font-medium">{`Vítimas Humanas (${victims?.length}):`}</span>
            <div className="space-y-2 pl-4">
              {victims?.map((victim, index) => (
                <div key={index}>
                  <div>{`Vítima ${index + 1}:`}</div>
                  {Object.entries(victim).map(
                    ([key, value]) =>
                      value &&
                      !empty.includes(value.toString()) && (
                        <div className="flex gap-2 pl-4">
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
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1 block text-lg font-medium">{`Vítimas Animais (${animalVictims?.length}):`}</span>
            <div className="space-y-2 pl-4">
              {animalVictims?.map((victim, index) => (
                <div key={index}>
                  <div>{`Vítima ${index + 1}:`}</div>
                  {Object.entries(victim).map(
                    ([key, value]) =>
                      value &&
                      !empty.includes(value.toString()) && (
                        <div className="flex gap-2 pl-4">
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
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
