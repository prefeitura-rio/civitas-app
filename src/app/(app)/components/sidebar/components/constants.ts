import type { icons } from 'lucide-react'

export interface ModuleProduct {
  icon: keyof typeof icons
  title: string
  path: string
}

export interface Module {
  icon: keyof typeof icons
  title: string
  products: ModuleProduct[]
}

export const home: ModuleProduct = {
  icon: 'Home',
  title: 'Início',
  path: '/',
}

export const modules: Module[] = [
  {
    icon: 'Radar',
    title: 'Cerco Digital',
    products: [
      {
        icon: 'MapPinned',
        title: 'Mapa',
        path: '/mapa',
      },
      {
        icon: 'Car',
        title: 'Placas Monitoradas',
        path: '/placas-monitoradas',
      },
      {
        icon: 'TrafficCone',
        title: 'Operações',
        path: '/operacoes',
      },
      {
        icon: 'Speech',
        title: 'Ocorrências (DD & 1746)',
        path: '/ocorrencias/timeline',
      },
    ],
  },
  {
    icon: 'LayoutDashboard',
    title: 'Dashboards',
    products: [
      {
        icon: 'Cctv',
        title: 'Status Infra dos Radares',
        path: 'dashboard/status-infra-radares',
      },
    ],
  },
] as const
