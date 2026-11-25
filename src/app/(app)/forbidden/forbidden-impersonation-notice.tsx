'use client'

import { Button } from '@/components/ui/button'

import { useChamadosImpersonation } from '../components/impersonation/chamados-impersonation-context'

/** Com a personificação ativa, a falta de permissão é do usuário personificado, não sua. */
export function ForbiddenImpersonationNotice() {
  const { subjectLabel, clearImpersonation } = useChamadosImpersonation()
  if (!subjectLabel) return null

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="max-w-md text-muted-foreground">
        Você está vendo como {subjectLabel}, que não tem acesso a esta tela.
      </p>
      <Button type="button" onClick={() => clearImpersonation('/demandas')}>
        Voltar ao meu usuário
      </Button>
    </div>
  )
}
