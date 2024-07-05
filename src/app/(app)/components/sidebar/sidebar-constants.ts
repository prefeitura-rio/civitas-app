import { Home, Radar, Search, Siren, TrafficCone } from 'lucide-react'

import type { NavItem } from '@/models/utils'

export const navItems: NavItem[] = [
  {
    title: 'Início',
    icon: Home,
    href: '/',
    color: 'text-muted-foreground',
  },
  {
    title: 'Cerco Digital',
    icon: Radar,
    href: '/consulta-de-placas',
    color: 'text-muted-foreground',
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
]
