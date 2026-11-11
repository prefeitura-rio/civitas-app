import {
  Clock3,
  Crosshair,
  type LucideIcon,
  Network,
  ShieldAlert,
} from 'lucide-react'

import {
  copassagem,
  recorteAtual,
  type RecorteId,
} from '@/modules/vehicle-intelligence/config/recortes'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { MasterPreData } from '@/modules/vehicle-intelligence/types/domain'

const HERO: Record<RecorteId, { eyebrow: string; text: string }> = {
  transeuntes: {
    eyebrow: 'ENTORNO DO FATO · BUSCA DE CORRELATAS',
    text: 'Sem placa vítima, a busca parte do local e do horário de cada roubo ou furto: correlata é a placa lida por um equipamento dentro do raio, em horário compatível com o fato. A rede reúne todas as ocorrências e correlatas do recorte e sinaliza separadamente as placas presentes na análise anual de suspeita de clonagem.',
  },
  transeuntes_cidade: {
    eyebrow: 'ENTORNO DO FATO · CIDADE · EXPERIMENTAL',
    text: 'Mesma busca de transeuntes com os ROs do ISP, da cidade inteira (de todos os autores): correlata é a placa lida por um equipamento dentro do raio, em horário compatível com o registro. Sem o relato, não há autor de moto anotado e o horário não foi revisado; a etiqueta de citada na dinâmica vem dos ROs revisados de transeuntes e de carga.',
  },
  veiculos: {
    eyebrow: 'PRÉ-EVENTO · BUSCA DE CORRELATAS',
    text: 'A busca parte das passagens da placa vítima perto do fato: correlata é a placa lida no mesmo radar, pouco antes ou depois dela. A rede reúne todas as vítimas e correlatas do recorte e sinaliza separadamente as placas presentes na análise anual de suspeita de clonagem.',
  },
  carga: {
    eyebrow: 'PRÉ-EVENTO · BUSCA DE CORRELATAS',
    text: 'A busca parte das passagens do veículo da carga perto do fato: correlata é a placa lida no mesmo radar, pouco antes ou depois dele. A categoria “Carga subtraída” inclui classificação automática pendente de revisão; uma placa correlata não é automaticamente uma placa dos autores.',
  },
}

type Kpi = { label: string; value: string; icon: LucideIcon }

export const SCREEN = {
  ...HERO[recorteAtual],
  title: copassagem
    ? 'Quais placas conectam vários casos?'
    : 'Quais placas conectam vários fatos?',
  /** O que a rede liga às correlatas: ocorrências (entorno) ou placas vítimas (copassagem). */
  anchors: copassagem ? 'vítimas' : 'ocorrências',
  kpis: (data: MasterPreData): Kpi[] =>
    copassagem
      ? [
          {
            label: 'Eventos conectados',
            value: formatNumber(data.summary.events),
            icon: Crosshair,
          },
          {
            label: 'Em múltiplas CISPs',
            value: formatNumber(data.summary.cross_cisp_candidates),
            icon: ShieldAlert,
          },
          {
            label: 'Suspeitas de clone',
            value: formatNumber(data.summary.clone_suspect_candidates),
            icon: Network,
          },
          {
            label: 'Fato / correlação',
            value: `±${data.methodology.event_window_minutes} / ±${data.methodology.passage_window_minutes} min`,
            icon: Clock3,
          },
        ]
      : [
          {
            label: 'Ocorrências conectadas',
            value: formatNumber(data.summary.events),
            icon: Crosshair,
          },
          {
            label: 'Placas em 2+ ocorrências',
            value: formatNumber(data.summary.recurrent_candidates),
            icon: ShieldAlert,
          },
          {
            label: 'Suspeitas de clone',
            value: formatNumber(data.summary.clone_suspect_candidates),
            icon: Network,
          },
          {
            label: 'Janela / raio do fato',
            value: `±${data.methodology.event_window_minutes} min / ${data.methodology.radius_meters} m`,
            icon: Clock3,
          },
        ],
}
