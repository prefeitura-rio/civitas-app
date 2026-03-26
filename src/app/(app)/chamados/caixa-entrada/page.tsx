'use client'

import styles from './caixa-entrada.module.css'
import { InboxList } from './components/inbox-list'

export default function CaixaEntradaPage() {
  return (
    <div
      className={`${styles.page} flex min-h-screen flex-col overflow-y-auto px-6 py-6`}
    >
      <div className="content w-full">
        <InboxList />
      </div>
    </div>
  )
}
