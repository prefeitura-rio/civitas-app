'use client'

import tcFormStyles from '../criar/ticket-create/ticket-create-form.module.css'
import { DashboardTabs } from './components/dashboard-tabs'

export default function DemandasDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="page-content overflow-y-scroll pb-24"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="content px-10 pb-10 pt-0">
        <div className={tcFormStyles.root}>
          <DashboardTabs />
          {children}
        </div>
      </div>
    </div>
  )
}
