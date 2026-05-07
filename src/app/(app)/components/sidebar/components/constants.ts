import type { icons } from 'lucide-react'

import { config } from '@/config'

export interface Module {
  icon: keyof typeof icons
  title: string
  path: string
  ticketScreenCode?: string
}

export interface ModuleWithChildren {
  icon: keyof typeof icons
  title: string
  path?: string
  children: Module[]
  ticketScreenCode?: string
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

export const DEMANDAS_SIDEBAR_CATEGORY_TITLE = 'Demandas' as const

const demandasItem: Category = {
  icon: 'ClipboardList',
  title: DEMANDAS_SIDEBAR_CATEGORY_TITLE,
  modules: [
    {
      icon: 'List',
      title: 'Lista Geral',
      path: '/demandas',
    },
    {
      icon: 'Archive',
      title: 'Arquivados',
      path: '/demandas/arquivados',
      ticketScreenCode: 'archive',
    },
    {
      icon: 'CirclePlus',
      title: 'Criar',
      path: '/demandas/criar',
      ticketScreenCode: 'ticket_create',
    },
    {
      icon: 'Inbox',
      title: 'Caixa de Entrada',
      path: '/demandas/caixa-entrada',
      ticketScreenCode: 'inbox',
      children: [
        {
          icon: 'Reply',
          title: 'Respondidos',
          path: '/demandas/respondidos',
          ticketScreenCode: 'responded',
        },
        {
          icon: 'MailWarning',
          title: 'Spam',
          path: '/demandas/spam',
          ticketScreenCode: 'spam',
        },
      ],
    },
    {
      icon: 'UserCog',
      title: 'Equipes',
      path: '/demandas/equipes',
      ticketScreenCode: 'teams',
    },
    {
      icon: 'Shield',
      title: 'Perfis',
      path: '/demandas/perfis',
      ticketScreenCode: 'profile',
    },
    {
      icon: 'GitBranch',
      title: 'Workflow',
      path: '/demandas/workflow',
      ticketScreenCode: 'workflow',
    },
    {
      icon: 'ShieldCheck',
      title: 'Permissões Telas',
      path: '/demandas/permissoes-telas',
      ticketScreenCode: 'screen_permissions',
    },
  ],
}

export const sidebarItems: SideBarItem[] = [
  ...(config.enableChamados ? [demandasItem] : []),
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
    ],
  },
] as const
