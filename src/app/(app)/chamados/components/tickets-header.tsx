'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function TicketsHeader() {
  return (
    <div className="flex w-full items-center justify-between">
      <h2>Chamados</h2>

      <Button asChild>
        <Link href="/chamados/criar">Novo chamado</Link>
      </Button>
    </div>
  )
}
