export function PlateChips({
  plates,
  onOpenPlate,
  highlight = [],
}: {
  plates: string[]
  onOpenPlate: (plate: string) => void
  highlight?: string[]
}) {
  if (!plates.length)
    return (
      <small className="detail-empty">Nenhuma placa citada acompanhada.</small>
    )
  const marked = new Set(highlight)
  return (
    <div className="plate-chips">
      {plates.map((plate) => (
        <button
          type="button"
          key={plate}
          className={marked.has(plate) ? 'cited' : undefined}
          onClick={() => onOpenPlate(plate)}
          title={`Abrir o perfil de ${plate}`}
        >
          {plate}
        </button>
      ))}
    </div>
  )
}
