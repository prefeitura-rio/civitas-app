import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center">
        <h1 className="text-2xl font-semibold">Acesso negado</h1>
        <p className="text-sm text-muted-foreground">
          Voce nao tem permissao para acessar este recurso.
        </p>
        <Button asChild>
          <Link href="/">Voltar para a pagina inicial</Link>
        </Button>
      </section>
    </main>
  )
}
