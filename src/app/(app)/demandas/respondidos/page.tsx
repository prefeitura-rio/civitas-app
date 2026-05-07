'use client'

import { notFound } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import styles from '../caixa-entrada/caixa-entrada.module.css'
import { RespondidosList } from './components/respondidos-list'

const RESPONDED_SCREEN_CODE = 'responded'

function RespondidosPageContent() {
  return (
    <div className={`${styles.page} px-6 py-6`}>
      <div className="content w-full">
        <RespondidosList />
      </div>
    </div>
  )
}

export default function RespondidosPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } = useTicketScreenPermissionGate(
    RESPONDED_SCREEN_CODE,
  )

  if (!resolved || !allowed) {
    return (
      <div
        className={`${styles.page} flex min-h-screen flex-col items-center justify-center px-6 py-6`}
      >
        <Spinner />
      </div>
    )
  }

  return <RespondidosPageContent />
}
