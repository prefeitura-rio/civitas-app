import { formatDate } from 'date-fns'
import type { PickingInfo } from 'deck.gl'

import { Label } from '@/components/custom/typography'
import { Separator } from '@/components/ui/separator'
import type { FogoCruzadoIncident } from '@/models/entities'

export function FogoCruzadoInfo({
  pickingInfo,
}: {
  pickingInfo: PickingInfo<FogoCruzadoIncident>
}) {
  const simpleFields = {
    Data: pickingInfo?.object?.date
      ? formatDate(pickingInfo?.object?.date, 'dd/MM/yyyy HH:mm')
      : undefined,
    Endereço: pickingInfo?.object?.address,
    Bairro: pickingInfo?.object?.neighborhood.name,
    'Sub-bairro': pickingInfo?.object?.subNeighborhood,
    Localidade: pickingInfo?.object?.locality?.name,
    Longitude: pickingInfo?.object?.longitude,
    Latitude: pickingInfo?.object?.latitude,
    'Ação Policial': pickingInfo?.object?.policeAction ? 'Sim' : 'Não',
    'Presença de Agentes': pickingInfo?.object?.agentPresence ? 'Sim' : 'Não',
    'Registros Relacionados': pickingInfo?.object?.relatedRecord,
  }

  const contextFields = {
    'Motivo Principal': pickingInfo?.object?.contextInfo.mainReason.name,
    'Motivos Complementares':
      pickingInfo?.object?.contextInfo.complementaryReasons
        .map((item) => item.name)
        .join(', '),
    'Recortes Relevantes': pickingInfo?.object?.contextInfo.clippings
      .map((item) => item.name)
      .join(', '),
    Massacre: pickingInfo?.object?.contextInfo.massacre ? 'Sim' : 'Não',
    'Unidade Policial': pickingInfo?.object?.contextInfo.policeUnit,
  }

  const victims = pickingInfo?.object?.victims.map((item) => ({
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

  const animalVictims = pickingInfo?.object?.animalVictims.map((item) => ({
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

  return (
    <div className="h-full w-full">
      <h4>Ocorrência do Fogo Cruzado</h4>
      <Separator className="mb-4 mt-1 bg-secondary" />
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
          <span className="mb-1 block text-lg font-medium">{`Vítimas Humanas (${victims?.length}):`}</span>
          <div className="space-y-2 pl-4">
            {victims?.map((victim, index) => (
              <div key={index}>
                <div>{`Vítima ${index + 1}:`}</div>
                {Object.entries(victim).map(
                  ([key, value], index) =>
                    value &&
                    !empty.includes(value.toString()) && (
                      <div key={index} className="flex gap-2 pl-4">
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
                  ([key, value], index) =>
                    value &&
                    !empty.includes(value.toString()) && (
                      <div key={index} className="flex gap-2 pl-4">
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
    </div>
  )
}
