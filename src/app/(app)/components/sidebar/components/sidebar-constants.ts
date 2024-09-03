import {
  Car,
  Cctv,
  Home,
  LayoutDashboard,
  MapPinned,
  Radar,
  Speech,
  // Speech,
  TrafficCone,
} from 'lucide-react'

import type { NavItem } from '@/models/utils'

export const navItems: NavItem[] = [
  {
    title: 'Início',
    icon: Home,
    href: '/',
    color: 'text-primary',
  },
  {
    title: 'Cerco Digital',
    icon: Radar,
    color: 'text-primary',
    children: [
      {
        title: 'Mapa',
        icon: MapPinned,
        color: 'text-muted-foreground',
        href: '/mapa',
      },
      {
        title: 'Placas monitoradas',
        icon: Car,
        color: 'text-muted-foreground',
        href: '/placas-monitoradas',
      },
      {
        title: 'Operações',
        icon: TrafficCone,
        color: 'text-muted-foreground',
        href: '/operacoes',
      },
      {
        title: 'Ocorrências (DD & 1746)',
        icon: Speech,
        color: 'text-muted-foreground',
        href: '/ocorrencias/timeline',
      },
    ],
  },
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    color: 'text-primary',
    children: [
      {
        title: 'Status Infra dos Radares',
        icon: Cctv,
        color: 'text-muted-foreground',
        href: '/dashboards/status-infra-radares',
      },
    ],
  },
]
