import type { icons } from 'lucide-react'

export interface Module {
  icon: keyof typeof icons
  title: string
  path: string
}

export interface Category {
  icon: keyof typeof icons
  title: string
  modules: Module[]
}

export type SideBarItem = Module | Category

export const sidebarItems: SideBarItem[] = [
  {
    icon: 'Car',
    title: 'Veículos',
    path: '/veiculos',
  },
  {
    icon: 'Users',
    title: 'Pessoas',
    path: '/pessoas',
  },
  {
    icon: 'Speech',
    title: 'Ocorrências (DD & 1746)',
    path: '/ocorrencias/timeline',
  },
  {
    icon: 'Map',
    title: 'Mapa Interativo',
    path: '/playground',
  },
  {
    icon: 'LayoutDashboard',
    title: 'Dashboards',
    modules: [
      {
        icon: 'Cctv',
        title: 'Status Infra dos Radares',
        path: 'dashboards/status-infra-radares',
      },
    ],
  },
  {
    icon: 'Settings',
    title: 'Configurações',
    modules: [
      {
        icon: 'Rss',
        title: 'Placas Monitoradas',
        path: '/placas-monitoradas',
      },
      {
        icon: 'TrafficCone',
        title: 'Cadastro de Operações',
        path: '/operacoes',
      },
      {
        icon: 'ScanEye',
        title: 'Visão Computacional',
        path: '/vision-ai',
      },
    ],
  },
] as const
