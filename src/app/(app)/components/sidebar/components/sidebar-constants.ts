import {
  Car,
  Home,
  LayoutDashboard,
  MapPinned,
  Radar,
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
    href: '/',
    color: 'text-primary',
    isChidren: true,
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
    ],
  },
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-primary',
  },
]
