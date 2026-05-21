'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from '../../dashboard/dashboard-tabs.module.css'

const TABS = [
  {
    href: '/demandas/dashboard-tatico/volume',
    label: 'Volume de Demandas',
  },
  {
    href: '/demandas/dashboard-tatico/metricas',
    label: 'Métricas de Resposta',
  },
  {
    href: '/demandas/dashboard-tatico/visao-operacional',
    label: 'Visão Operacional',
  },
] as const

export function DashboardTaticoTabs() {
  const pathname = usePathname()

  return (
    <nav
      className={styles.tabs}
      style={{ marginTop: '24px' }}
      aria-label="Dashboard Tático"
    >
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
