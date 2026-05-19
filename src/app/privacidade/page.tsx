import type { Metadata } from 'next'
import Link from 'next/link'

import { PrivacyNoticeContent } from './content'

export const metadata: Metadata = {
  title: 'Aviso de Privacidade | CIVITAS',
  description:
    'Aviso de Privacidade do Sistema CIVITAS — Prefeitura do Rio de Janeiro',
  robots: {
    index: false,
    follow: true,
  },
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="page-content mx-auto max-w-3xl overflow-y-scroll">
        <div className="markdown">
          <h1>Aviso de Privacidade</h1>
          <PrivacyNoticeContent />
          <p className="mt-8 text-sm text-muted-foreground">
            <Link href="/auth/sign-in" className="underline hover:text-primary">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
