'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import logoCivitas from '@/assets/civitas_icon.png'
import logoDisqueDenuncia from '@/assets/logo_disque_denuncia.png'
import logoPrefeitura from '@/assets/prefeitura_icon.png'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { isAuthenticated } from '@/utils/isAuthenticated'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  if (!isAuthenticated()) {
    router.push('/auth/sign-in')
  }

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log(error)
      if (error.response?.status === 401) {
        sessionStorage.clear()
        router.push('/auth/sign-in')
      }
      return Promise.reject(error)
    },
  )

  return (
    <div className="min-h-screen px-4 pt-4">
      <div className="flex justify-between">
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
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="secondary">Home</Button>
          </Link>
        </div>
      </div>
      <div className="flex min-h-[calc(100vh-3.5rem)]">{children}</div>
    </div>
  )
}
