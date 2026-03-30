'use client'

import { notFound } from 'next/navigation'

import { config } from '@/config'

import styles from '../caixa-entrada/caixa-entrada.module.css'
import { RespondidosList } from './components/respondidos-list'

export default function RespondidosPage() {
  if (!config.enableChamados) {
    notFound()
  }

  return (
    <div className={`${styles.page} px-6 py-6`}>
      <div className="content w-full">
        <RespondidosList />
      </div>
    </div>
  )
}
