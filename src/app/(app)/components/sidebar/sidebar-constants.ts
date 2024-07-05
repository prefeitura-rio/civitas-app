import { Home, Radar, Search, Siren, TrafficCone } from 'lucide-react'

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
    color: 'text-orange-500',
    isChidren: true,
    children: [
      {
        title: 'Consulta de placas',
        icon: Search,
        color: 'text-red-500',
        href: '/consulta-de-placas',
      },
      {
        title: 'Placas monitoradas',
        icon: Siren,
        color: 'text-red-500',
        href: '/placas-monitoradas',
      },
      {
        title: 'Operações',
        icon: TrafficCone,
        color: 'text-red-500',
        href: '/operacoes',
      },
    ],
  },
]
