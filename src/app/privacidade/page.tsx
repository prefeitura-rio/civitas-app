import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import logoDisqueDenuncia from '@/assets/logo_disque_denuncia.png'
import logoPrefeituraCivitas from '@/assets/pref-civitas-horizontal-03-bco-cor-SB.png'
import { config } from '@/config'

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
  if (!config.enablePrivacyPage) {
    notFound()
  }

  return (
    <div className="min-h-screen px-4 pt-4">
      <Link
        href="/"
        className="flex h-10 w-full items-center justify-start gap-8"
      >
        <Image
          src={logoPrefeituraCivitas}
          alt="Logo Prefeitura do Rio de Janeiro e CIVITAS Rio"
          className="h-[100%] w-auto"
        />
        <Image
          src={logoDisqueDenuncia}
          alt="Logo Disque Denúncia, telefone: 2253 1177"
          className="h-[100%] w-auto"
        />
      </Link>
      <div className="page-content mx-auto overflow-y-scroll">
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
