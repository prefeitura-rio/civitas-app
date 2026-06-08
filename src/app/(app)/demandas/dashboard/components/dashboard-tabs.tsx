'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from '../dashboard-tabs.module.css'

const TABS = [
  { href: '/demandas/dashboard/sla', label: 'SLA' },
  { href: '/demandas/dashboard/visualizacao', label: 'Visualização' },
] as const

export function DashboardTabs() {
  const pathname = usePathname()

  return (
    <nav className={styles.tabs} aria-label="Configuração do dashboard">
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
