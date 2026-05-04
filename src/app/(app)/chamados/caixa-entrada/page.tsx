'use client'

import { notFound } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import styles from './caixa-entrada.module.css'
import { InboxList } from './components/inbox-list'

const INBOX_SCREEN_CODE = 'inbox'

function CaixaEntradaPageContent() {
  return (
    <div className={`${styles.page} px-6 py-6`}>
      <div className="content w-full">
        <InboxList />
      </div>
    </div>
  )
}

export default function CaixaEntradaPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } = useTicketScreenPermissionGate(INBOX_SCREEN_CODE)

  if (!resolved || !allowed) {
    return (
      <div
        className={`${styles.page} flex min-h-screen flex-col items-center justify-center px-6 py-6`}
      >
        <Spinner />
      </div>
    )
  }

  return <CaixaEntradaPageContent />
}
