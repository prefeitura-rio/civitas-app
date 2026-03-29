'use client'

import styles from '../caixa-entrada/caixa-entrada.module.css'
import { RespondidosList } from './components/respondidos-list'

export default function RespondidosPage() {
  return (
    <div className={`${styles.page} px-6 py-6`}>
      <div className="content w-full">
        <RespondidosList />
      </div>
    </div>
  )
}
