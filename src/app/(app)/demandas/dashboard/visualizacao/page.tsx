'use client'

import { notFound } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { WidgetsConfigForm } from './components/widgets-config-form'

const SLA_CONFIG_SCREEN_CODE = 'sla_config'

function DashboardVisualizacaoPageContent() {
  return <WidgetsConfigForm />
}

export default function DashboardVisualizacaoPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } = useTicketScreenPermissionGate(
    SLA_CONFIG_SCREEN_CODE,
  )

  if (!resolved || !allowed) {
    return (
      <div
        className="flex min-h-[240px] items-center justify-center"
        style={{ backgroundColor: '#0c161f' }}
      >
        <Spinner />
      </div>
    )
  }

  return <DashboardVisualizacaoPageContent />
}
