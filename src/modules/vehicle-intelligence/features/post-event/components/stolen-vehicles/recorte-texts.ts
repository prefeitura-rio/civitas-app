import { recorteAtual } from '@/modules/vehicle-intelligence/config/recortes'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import { DEFAULT_EVENT_SCOPE } from '@/modules/vehicle-intelligence/stores/event-scope'

/** As duas modalidades de origem: a primeira em vermelho, a segunda em âmbar. */
export const [PRIMARY, SECONDARY] = DEFAULT_EVENT_SCOPE.modalidades

export const modalityName = (value: string) =>
  categoryLabel(value).toLocaleLowerCase('pt-BR')

export const isCargoRecorte = recorteAtual === 'carga'

export const TEXT = isCargoRecorte
  ? {
      hero: 'Os polos de origem são separados por categoria. Os polos de desconexão reúnem as duas categorias e mostram as contagens de cada uma no popup. Na carga subtraída, o deslocamento pode ser a vítima seguindo viagem; a última leitura não confirma abandono ou descarga.',
      vehicles: 'veículos vítimas',
      unit: 'vínculos RO–placa',
      destination: 'Polo de desconexão · ambas as categorias',
      destinationNote:
        ' O popup mostra quantas desconexões vêm de cada categoria.',
    }
  : {
      hero: 'Roubo, furto e desconexão são apresentados como polos. A cor indica o papel; a área do círculo é proporcional ao número de ocorrências.',
      vehicles: 'veículos subtraídos',
      unit: 'fatos',
      destination: 'Polo de desconexão · vários radares',
      destinationNote: '',
    }
