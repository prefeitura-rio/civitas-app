'use client'

import { notFound } from 'next/navigation'

import { config } from '@/config'

import styles from '../caixa-entrada/caixa-entrada.module.css'
import { SpamList } from './components/spam-list'

export default function SpamPage() {
  if (!config.enableChamados) {
    notFound()
  }

  return (
    <div className={`${styles.page} px-6 py-6`}>
      <div className="content w-full">
        <SpamList />
      </div>
    </div>
  )
}
