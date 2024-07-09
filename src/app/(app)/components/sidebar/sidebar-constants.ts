import {
  Car,
  Home,
  MapPinned,
  Radar,
  Search,
  Siren,
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
    href: '/consulta-de-placas',
    color: 'text-primary',
    isChidren: true,
    children: [
      {
        title: 'Consulta de placas',
        icon: Search,
        color: 'text-muted-foreground',
        href: '/consulta-de-placas',
      },
      {
        title: 'Placas monitoradas',
        icon: Siren,
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
    title: 'Monitoramento',
    href: '/viaturas',
    icon: MapPinned,
    color: 'text-primary',
    isChidren: true,
    children: [
      {
        title: 'Viaturas',
        icon: Car,
        color: 'text-muted-foreground',
        href: '/viaturas',
      },
    ],
  },
]
