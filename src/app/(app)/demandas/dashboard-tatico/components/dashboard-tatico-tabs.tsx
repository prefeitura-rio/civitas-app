'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useTacticalDashboardTabPermissions } from '@/hooks/useTacticalDashboardTabPermissions'

import styles from '../../dashboard/dashboard-tabs.module.css'

export function DashboardTaticoTabs() {
  const pathname = usePathname()
  const { allowedTabs, resolved } = useTacticalDashboardTabPermissions()

  if (!resolved || allowedTabs.length === 0) {
    return null
  }

  return (
    <nav
      className={styles.tabs}
      style={{ marginTop: '24px' }}
      aria-label="Dashboard Tático"
    >
      {allowedTabs.map((tab) => {
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
