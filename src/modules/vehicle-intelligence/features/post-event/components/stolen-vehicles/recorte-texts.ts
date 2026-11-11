import {
  recorte,
  type TrajectoryTexts,
} from '@/modules/vehicle-intelligence/config/recortes'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

/** As duas modalidades de origem: a primeira em vermelho, a segunda em âmbar. */
export const [PRIMARY, SECONDARY] = recorte.modalities

export const modalityName = (value: string) =>
  categoryLabel(value).toLocaleLowerCase('pt-BR')

/** Os textos do recorte; esta tela só existe na copassagem, que sempre os tem. */
export const TEXT = recorte.postEvent.trajectories as TrajectoryTexts
