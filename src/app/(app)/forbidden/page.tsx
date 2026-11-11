import { ShieldX } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

// Destino de quem abre uma tela sem permissão (useTicketScreenPermissionGate, interceptor 403 do `api` e os guards
// de layout no servidor).
export default function ForbiddenPage() {
  return (
    <div className="page-content flex flex-col items-center justify-center gap-4 text-center">
      <ShieldX className="size-12 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Acesso não permitido</h1>
      <p className="max-w-md text-muted-foreground">
        Seu perfil não tem permissão para abrir esta tela. Se precisar do
        acesso, fale com a coordenação.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
