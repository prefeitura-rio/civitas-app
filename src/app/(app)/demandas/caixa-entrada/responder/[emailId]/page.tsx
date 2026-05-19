import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { config } from '@/config'

import caixaStyles from '../../caixa-entrada.module.css'
import { ResponderEmailView } from './components/responder-email-view'

export default function ResponderEmailPage() {
  if (!config.enableChamados) {
    notFound()
  }

  return (
    <div className={`${caixaStyles.page} px-6 py-6`}>
      <div className="content w-full min-w-0">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#97a2ab]">
              Carregando…
            </div>
          }
        >
          <ResponderEmailView />
        </Suspense>
      </div>
    </div>
  )
}
