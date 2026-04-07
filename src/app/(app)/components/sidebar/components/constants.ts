import type { icons } from 'lucide-react'

import { config } from '@/config'

export interface Module {
  icon: keyof typeof icons
  title: string
  path: string
}

/** Módulo com subitens (ex.: Caixa de entrada → Respondidos, Spam). */
export interface ModuleWithChildren {
  icon: keyof typeof icons
  title: string
  /** Se definido, clique no título/ícone navega para esta rota. */
  path?: string
  children: Module[]
}

export type SidebarModule = Module | ModuleWithChildren

export function isModuleWithChildren(
  m: SidebarModule,
): m is ModuleWithChildren {
  return 'children' in m && Array.isArray((m as ModuleWithChildren).children)
}

export interface Category {
  icon: keyof typeof icons
  title: string
  modules: SidebarModule[]
}

export type SideBarItem = Module | Category

const chamadosItem: Category = {
  icon: 'ClipboardList',
  title: 'Chamados',
  modules: [
    {
      icon: 'List',
      title: 'Lista Geral',
      path: '/chamados',
    },
    {
      icon: 'CirclePlus',
      title: 'Criar',
      path: '/chamados/criar',
    },
    {
      icon: 'Inbox',
      title: 'Caixa de Entrada',
      path: '/chamados/caixa-entrada',
      children: [
        {
          icon: 'Reply',
          title: 'Respondidos',
          path: '/chamados/respondidos',
        },
        {
          icon: 'MailWarning',
          title: 'Spam',
          path: '/chamados/spam',
        },
      ],
    },
    {
      icon: 'UserCog',
      title: 'Equipes',
      path: '/equipes',
    },
    {
      icon: 'Shield',
      title: 'Perfis',
      path: '/perfis',
    },
  ],
}

export const sidebarItems: SideBarItem[] = [
  ...(config.enableChamados ? [chamadosItem] : []),
  {
    icon: 'Car',
    title: 'Veículos',
    modules: [
      {
        icon: 'Cctv',
        title: 'Busca por Radar',
        path: '/veiculos/busca-por-radar',
      },
      {
        icon: 'RectangleEllipsis',
        title: 'Busca por Placa',
        path: '/veiculos/busca-por-placa',
      },
      {
        icon: 'Waypoints',
        title: 'Placas Correlatas em CCs',
        path: '/veiculos/placas-correlatas-em-ccs/genarate-report',
      },
    ],
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
        path: '/dashboards/status-infra-radares',
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
        icon: 'Users',
        title: 'Cadastro de Demandantes',
        path: '/demandantes',
      },
      {
        icon: 'ScanEye',
        title: 'Visão Computacional',
        path: '/vision-ai',
      },
      {
        icon: 'UserCog',
        title: 'Equipes',
        path: '/equipes',
      },
      {
        icon: 'Shield',
        title: 'Perfis',
        path: '/perfis',
      },
    ],
  },
] as const
