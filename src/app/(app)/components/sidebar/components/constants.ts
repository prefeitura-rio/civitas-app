import { config } from '@/config'
import {
  VEHICLE_INTELLIGENCE_BASE_PATH,
  VEHICLE_INTELLIGENCE_FULL_SCREEN_CODE,
  VEHICLE_INTELLIGENCE_SCREEN_CODE,
} from '@/lib/vehicle-intelligence/constants'

import type { SidebarIconName } from './sidebar-icon'

export interface Module {
  icon: SidebarIconName
  title: string
  path: string
  ticketScreenCode?: string
  /** Exibe o item se o usuário tiver permissão de visualização em qualquer uma das telas. */
  ticketScreenCodes?: readonly string[]
}

export interface ModuleWithChildren {
  icon: SidebarIconName
  title: string
  path?: string
  children: Module[]
  ticketScreenCode?: string
  ticketScreenCodes?: readonly string[]
}

export type SidebarModule = Module | ModuleWithChildren

export function isModuleWithChildren(
  m: SidebarModule,
): m is ModuleWithChildren {
  return 'children' in m && Array.isArray((m as ModuleWithChildren).children)
}

export interface Category {
  icon: SidebarIconName
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
      ticketScreenCode: 'general_list',
    },
    {
      icon: 'Archive',
      title: 'Arquivados',
      path: '/demandas/arquivados',
      ticketScreenCode: 'archive',
    },
    {
      icon: 'CalendarClock',
      title: 'Fechamentos',
      path: '/demandas/fechamentos',
      ticketScreenCode: 'shift_closing',
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
    {
      icon: 'Gauge',
      title: 'Configuração SLA',
      path: '/demandas/dashboard/sla',
      ticketScreenCode: 'sla_config',
    },
    {
      icon: 'BarChart2',
      title: 'Dashboard Tático',
      path: '/demandas/dashboard-tatico',
      ticketScreenCodes: [
        'dashboard_demand_volume',
        'dashboard_sla',
        'dashboard_operational_view',
      ],
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
      {
        icon: 'Owl',
        title: 'Inteligência Veicular',
        // Abre em Placas correlatas, a tela que todo perfil com acesso ao módulo vê.
        path: `${VEHICLE_INTELLIGENCE_BASE_PATH}/correlation`,
        ticketScreenCode: VEHICLE_INTELLIGENCE_SCREEN_CODE,
        // Placas correlatas e Perfil de placa vêm com o item; as demais pedem a tela completa.
        children: [
          {
            icon: 'LayoutDashboard',
            title: 'Visão geral',
            path: VEHICLE_INTELLIGENCE_BASE_PATH,
            ticketScreenCode: VEHICLE_INTELLIGENCE_FULL_SCREEN_CODE,
          },
          {
            icon: 'Network',
            title: 'Placas correlatas',
            path: `${VEHICLE_INTELLIGENCE_BASE_PATH}/correlation`,
          },
          {
            icon: 'Route',
            title: 'Trajetória pós-evento',
            path: `${VEHICLE_INTELLIGENCE_BASE_PATH}/post-event`,
            ticketScreenCode: VEHICLE_INTELLIGENCE_FULL_SCREEN_CODE,
          },
          {
            icon: 'UsersRound',
            title: 'Grupos',
            path: `${VEHICLE_INTELLIGENCE_BASE_PATH}/groups`,
            ticketScreenCode: VEHICLE_INTELLIGENCE_FULL_SCREEN_CODE,
          },
          {
            icon: 'MapPinned',
            title: 'Territórios',
            path: `${VEHICLE_INTELLIGENCE_BASE_PATH}/territories`,
            ticketScreenCode: VEHICLE_INTELLIGENCE_FULL_SCREEN_CODE,
          },
          {
            icon: 'SquareUser',
            title: 'Perfil de placa',
            path: `${VEHICLE_INTELLIGENCE_BASE_PATH}/profile`,
          },
          {
            icon: 'FileSearch',
            title: 'Perfil do RO',
            path: `${VEHICLE_INTELLIGENCE_BASE_PATH}/occurrence`,
            ticketScreenCode: VEHICLE_INTELLIGENCE_FULL_SCREEN_CODE,
          },
        ],
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
