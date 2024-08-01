import { IconLayer } from '@deck.gl/layers'
import { type Dispatch, type SetStateAction, useState } from 'react'

import messageCircleWarning from '@/assets/message-circle-warning.svg'
import type { Report } from '@/models/entities'

export interface UseReports {
  data: Report[]
  layer: IconLayer<Report, object>
  layerStates: {
    isVisible: boolean
    setIsVisible: Dispatch<SetStateAction<boolean>>
  }
}

export function useReports(): UseReports {
  const [isVisible, setIsVisible] = useState(true)
  const data = [
    {
      title: 'Tempor qui in dolore irure tempor est.',
      date: new Date(),
      description: `Culpa duis sunt exercitation Lorem aute Lorem veniam. Voluptate do aliquip consectetur cupidatat. Ipsum deserunt dolor sit cillum fugiat cillum est magna nostrud.Ad elit elit sunt non Lorem magna in.Eu duis fugiat sint anim aliqua anim.Incididunt elit cupidatat velit nostrud Lorem ex amet aute sit magna.Dolor quis nulla duis dolor veniam aliquip.
  
      Aute dolor exercitation enim fugiat sint culpa sit.Aliquip voluptate ea nulla pariatur consectetur est officia nulla.Incididunt elit magna reprehenderit quis exercitation laborum cupidatat deserunt aute incididunt irure sint do ipsum.`,
      type: 'Segurança Pública',
      subtype: 'Assalto',
      latitude: -23.7,
      longitude: -43.3,
      location: 'Rua Mariz e Barros, 821, Maracanã',
      origin: '1746',
    },
    {
      title: 'Tempor qui in dolore irure tempor est.',
      date: new Date(),
      description: `Culpa duis sunt exercitation Lorem aute Lorem veniam. Voluptate do aliquip consectetur cupidatat. Ipsum deserunt dolor sit cillum fugiat cillum est magna nostrud.Ad elit elit sunt non Lorem magna in.Eu duis fugiat sint anim aliqua anim.Incididunt elit cupidatat velit nostrud Lorem ex amet aute sit magna.Dolor quis nulla duis dolor veniam aliquip.
  
      Aute dolor exercitation enim fugiat sint culpa sit.Aliquip voluptate ea nulla pariatur consectetur est officia nulla.Incididunt elit magna reprehenderit quis exercitation laborum cupidatat deserunt aute incididunt irure sint do ipsum.`,
      type: 'Segurança Pública',
      subtype: 'Assalto',
      latitude: -23.7,
      longitude: -43.3,
      location: 'Rua Mariz e Barros, 821, Maracanã',
      origin: 'Disque Denúncia',
    },
    {
      title: 'Tempor qui in dolore irure tempor est.',
      date: new Date(),
      description: `Culpa duis sunt exercitation Lorem aute Lorem veniam. Voluptate do aliquip consectetur cupidatat. Ipsum deserunt dolor sit cillum fugiat cillum est magna nostrud.Ad elit elit sunt non Lorem magna in.Eu duis fugiat sint anim aliqua anim.Incididunt elit cupidatat velit nostrud Lorem ex amet aute sit magna.Dolor quis nulla duis dolor veniam aliquip.
  
      Aute dolor exercitation enim fugiat sint culpa sit.Aliquip voluptate ea nulla pariatur consectetur est officia nulla.Incididunt elit magna reprehenderit quis exercitation laborum cupidatat deserunt aute incididunt irure sint do ipsum.`,
      type: 'Segurança Pública',
      subtype: 'Assalto',
      latitude: -23.7,
      longitude: -43.3,
      location: 'Rua Mariz e Barros, 821, Maracanã',
      origin: 'Disque Denúncia',
    },
  ]

  const layer = new IconLayer<Report>({
    id: 'radars',
    data,
    getPosition: (info) => [info.longitude, info.latitude],
    getSize: 24,
    getIcon: () => ({
      url: messageCircleWarning.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    pickable: true,
    highlightColor: [249, 115, 22, 255], // orange-500
    autoHighlight: true,
    visible: isVisible,
  })

  return {
    data,
    layer,
    layerStates: {
      isVisible,
      setIsVisible,
    },
  }
}
