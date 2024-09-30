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
    icon: 'Package',
    title: 'Módulos',
    products: [
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
    ],
  },
  {
    icon: 'Settings',
    title: 'Configurações',
    products: [
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
    ],
  },
  {
    icon: 'LayoutDashboard',
    title: 'Dashboards',
    products: [
      {
        icon: 'Cctv',
        title: 'Status Infra dos Radares',
        path: 'dashboards/status-infra-radares',
      },
    ],
  },
] as const
