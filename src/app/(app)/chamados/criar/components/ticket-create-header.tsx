'use client'

export function TicketCreateHeader() {
  return (
    <div className="flex w-full flex-col items-start gap-0">
      <h1
        className="font-semibold leading-10 text-[var(--tc-heading,#f9fafa)]"
        style={{ fontSize: '20px' }}
      >
        Cadastro Manual de Chamado
      </h1>
      <p className="mt-0 text-[length:12px] leading-4 text-[var(--tc-muted,#97a2ab)]">
        Preencha as informações abaixo para criar um novo chamado.
      </p>
    </div>
  )
}
