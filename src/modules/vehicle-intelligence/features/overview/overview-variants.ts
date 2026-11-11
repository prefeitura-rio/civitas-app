import {
  Bike,
  CarFront,
  Hand,
  type LucideIcon,
  MapPin,
  ShieldAlert,
  Siren,
} from 'lucide-react'

import {
  recorteAtual,
  type RecorteId,
} from '@/modules/vehicle-intelligence/config/recortes'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { DEFAULT_EVENT_SCOPE } from '@/modules/vehicle-intelligence/stores/event-scope'
import type {
  CrimeType,
  DashboardData,
  DashboardFilters,
  ModalityCounts,
} from '@/modules/vehicle-intelligence/types/domain'

const share = (value: number | undefined, total: number) =>
  `${(((value ?? 0) / Math.max(total, 1)) * 100).toFixed(1)}%`

type Kpi = { label: string; value: string; meta: string; icon: LucideIcon }
/** Modalidade com seus totais por CISP; `secondary` fica fora do gráfico de modalidade. */
type Column = {
  key: keyof ModalityCounts
  crimeType: CrimeType
  label: string
  secondary?: boolean
}

export interface OverviewVariant {
  title: (data: DashboardData | null) => string
  text: string
  totalLabel: string
  /** Área foco: mapa dos fatos, sem filtros; território estadual: coroplético com filtros, modalidade e tabela. */
  focusArea: boolean
  columns: Column[]
  donutTitle: string
  kpis: (data: DashboardData) => Kpi[]
}

const ROBBERY_THEFT_COLUMNS: Column[] = [
  { key: 'roubos', crimeType: 'ROUBO', label: 'Roubos' },
  { key: 'furtos', crimeType: 'FURTO', label: 'Furtos' },
]

const concentration = (data: DashboardData, unit: string): Kpi => ({
  label: 'Maior concentração',
  value: data.summary.cisp_lider ? `CISP ${data.summary.cisp_lider}` : '—',
  meta: `${formatNumber(data.summary.cisp_lider_total)} ${unit}`,
  icon: MapPin,
})

const VARIANTS: Record<RecorteId, OverviewVariant> = {
  transeuntes: {
    title: (data) =>
      data?.summary.area
        ? `Panorama da área foco · ${data.summary.area}`
        : 'Panorama da área foco',
    text: 'Roubos e furtos a transeuntes na base Zona Sul · Motos · 2026.',
    totalLabel: 'ocorrências',
    focusArea: true,
    columns: ROBBERY_THEFT_COLUMNS,
    donutTitle: 'Roubo x furto',
    kpis: ({ summary }) => [
      {
        label: 'Total de delitos',
        value: formatNumber(summary.total),
        meta: 'ocorrências a transeuntes',
        icon: ShieldAlert,
      },
      {
        label: 'Roubos',
        value: formatNumber(summary.roubos ?? 0),
        meta: `${share(summary.roubos, summary.total)} das ocorrências`,
        icon: Siren,
      },
      {
        label: 'Furtos',
        value: formatNumber(summary.furtos ?? 0),
        meta: `${share(summary.furtos, summary.total)} das ocorrências`,
        icon: Hand,
      },
      {
        label: 'Autor motorizado',
        value: formatNumber(summary.motorizadas ?? 0),
        meta: `${share(summary.motorizadas, summary.total)} com moto ou carro`,
        icon: Bike,
      },
    ],
  },
  veiculos: {
    title: () => 'Panorama territorial do estado',
    text: 'Explore a distribuição de subtrações, compare modalidades e combine múltiplas áreas de delegacia.',
    totalLabel: 'no recorte',
    focusArea: false,
    columns: ROBBERY_THEFT_COLUMNS,
    donutTitle: 'Roubo x furto',
    kpis: (data) => [
      {
        label: 'Total de delitos',
        value: formatNumber(data.summary.total),
        meta: 'subtrações no recorte',
        icon: ShieldAlert,
      },
      {
        label: 'Roubos',
        value: formatNumber(data.summary.roubos ?? 0),
        meta: `${share(data.summary.roubos, data.summary.total)} do recorte`,
        icon: CarFront,
      },
      {
        label: 'Furtos',
        value: formatNumber(data.summary.furtos ?? 0),
        meta: `${share(data.summary.furtos, data.summary.total)} do recorte`,
        icon: CarFront,
      },
      concentration(data, 'ocorrências'),
    ],
  },
  carga: {
    title: () => 'Panorama territorial do estado',
    text: 'Base unificada de 2026: uma ocorrência por RO, inclusive nos registros sem placa vítima identificada.',
    totalLabel: 'ROs no recorte',
    focusArea: false,
    columns: [
      {
        key: 'veiculo_carga',
        crimeType: 'CARGA_VEICULO',
        label: 'Veículo + carga',
      },
      { key: 'carga', crimeType: 'CARGA', label: 'Carga subtraída' },
      {
        key: 'veiculo',
        crimeType: 'VEICULO',
        label: 'Só veículo',
        secondary: true,
      },
    ],
    donutTitle: 'Classificação das ocorrências',
    kpis: (data) => [
      {
        label: 'Ocorrências',
        value: formatNumber(data.summary.total),
        meta: 'um registro por RO',
        icon: ShieldAlert,
      },
      {
        label: 'Veículo + carga',
        value: formatNumber(data.summary.veiculo_carga ?? 0),
        meta: `${share(data.summary.veiculo_carga, data.summary.total)} do recorte`,
        icon: CarFront,
      },
      {
        label: 'Carga subtraída',
        value: formatNumber(data.summary.carga ?? 0),
        meta: `${share(data.summary.carga, data.summary.total)} do recorte`,
        icon: CarFront,
      },
      concentration(data, 'ROs'),
    ],
  },
}

export const OVERVIEW = VARIANTS[recorteAtual]
export const OVERVIEW_FILTERS: DashboardFilters = {
  modalidades: DEFAULT_EVENT_SCOPE.modalidades,
  alvos: [],
  deslocamentos: [],
  cisps: [],
}
