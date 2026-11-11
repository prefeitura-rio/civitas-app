/** A resposta com `ready` falso (camada ainda não calculada): o motivo e o comando que a monta. */
export function NotReadyPanel({
  reason,
  buildCommand,
}: {
  reason?: string
  buildCommand?: string | null
}) {
  return (
    <section className="groups-panel groups-empty">
      <p>{reason}</p>
      {buildCommand && <code>{buildCommand}</code>}
    </section>
  )
}
