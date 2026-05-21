'use client'

import { Spinner } from '@/components/custom/spinner'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { SlaConfigForm } from './components/sla-config-form'

const SLA_CONFIG_SCREEN_CODE = 'sla_config'

function SlaConfigPageContent() {
  return <SlaConfigForm />
}

export default function SlaConfigPage() {
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

  return <SlaConfigPageContent />
}
