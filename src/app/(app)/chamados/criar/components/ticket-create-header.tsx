'use client'

export function TicketCreateHeader() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 space-y-4">
      <h2>Cadastro Manual de Chamado</h2>
      <p className="text-sm text-muted-foreground">
        Preencha as informações abaixo para criar um novo chamado.
      </p>
    </div>
  )
}
