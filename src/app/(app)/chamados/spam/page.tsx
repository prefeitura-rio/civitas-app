'use client'

import styles from '../caixa-entrada/caixa-entrada.module.css'
import { SpamList } from './components/spam-list'

export default function SpamPage() {
  return (
    <div className={`${styles.page} px-6 py-6`}>
      <div className="content w-full">
        <SpamList />
      </div>
    </div>
  )
}
