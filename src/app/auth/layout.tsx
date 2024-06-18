import Image from 'next/image'

import logoCivitas from '@/assets/civitas_icon.png'
import logoDisqueDenuncia from '@/assets/logo_disque_denuncia.png'
import logoPrefeitura from '@/assets/prefeitura_icon.png'
import { Button } from '@/components/ui/button'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen px-4 pt-4">
      <div className="flex justify-between">
        <div className="relative flex h-10 w-full justify-start gap-4">
          {/* <div className="relative h-10"> */}
          <Image
            src={logoPrefeitura}
            alt="Logo Prefeitura Rio"
            className="h-[100%] w-auto"
          />
          {/* </div> */}
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
          <Button variant="ghost">Home</Button>
          <Button variant="secondary">Login</Button>
        </div>
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        {children}
      </div>
    </div>
  )
}
