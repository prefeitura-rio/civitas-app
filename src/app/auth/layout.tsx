import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import logoCivitas from '@/assets/civitas_icon.png'
import logoDisqueDenuncia from '@/assets/logo_disque_denuncia.png'
import logoPrefeitura from '@/assets/prefeitura_icon.png'
import { isAuthenticated } from '@/auth/auth'

export const metadata: Metadata = {
  title: 'CIVITAS',
  description: 'Prefeitura do Rio de Janeiro',
  verification: {
    google: 'pD3XzBNLskqsw0Ov-xLZ05eX6wzzq8eXR_YG52xzqjU',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (isAuthenticated()) {
    redirect('/')
  }

  return (
    <>
      <div className="min-h-screen px-4 pt-4">
        <div className="flex h-10 w-full items-center justify-start gap-8">
          <Image
            src={logoPrefeitura}
            alt="Logo Prefeitura Rio"
            className="h-[100%] w-auto"
          />
          <Image
            src={logoCivitas}
            alt="Logo Civitas"
            className="h-[100%] w-auto"
          />
          <Image
            src={logoDisqueDenuncia}
            alt="Logo Disque Denúncia, telefone: 2253 1177"
            className="h-[100%] w-auto"
          />
        </div>
        <div className="-mt-10 flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
          {children}
        </div>
        <span className="mb-4 block w-full text-center text-xs text-muted-foreground">
          Copyright ©{' '}
          <Link href="https://www.dados.rio/" className="underline">
            Escritório de Dados do Rio de Janeiro
          </Link>{' '}
          2024.
        </span>
      </div>
    </>
  )
}
