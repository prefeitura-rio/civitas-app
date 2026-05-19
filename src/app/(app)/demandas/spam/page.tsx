'use client'

import { notFound } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import styles from '../caixa-entrada/caixa-entrada.module.css'
import { SpamList } from './components/spam-list'

const SPAM_SCREEN_CODE = 'spam'

function SpamPageContent() {
  return (
    <div className={`${styles.page} px-6 py-6`}>
      <div className="content w-full">
        <SpamList />
      </div>
    </div>
  )
}

export default function SpamPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } = useTicketScreenPermissionGate(SPAM_SCREEN_CODE)

  if (!resolved || !allowed) {
    return (
      <div
        className={`${styles.page} flex min-h-screen flex-col items-center justify-center px-6 py-6`}
      >
        <Spinner />
      </div>
    )
  }

  return <SpamPageContent />
}
