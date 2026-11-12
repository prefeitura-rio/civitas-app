const MAX_PLATES_PER_ROW = 6

/** Placas da linha; a que também tem base em outro complexo ganha "↔" (o título diz onde). */
export function PlateList({
  plates,
  otherBases,
}: {
  plates: string[]
  otherBases: Map<string, string[]>
}) {
  if (!plates.length) return <span className="group-label">—</span>
  const rest = plates.length - MAX_PLATES_PER_ROW
  return (
    <span className="territory-plates">
      {plates.slice(0, MAX_PLATES_PER_ROW).map((p) => {
        const alsoIn = otherBases.get(p) ?? []
        return (
          <span
            key={p}
            className="group-plate small"
            title={
              alsoIn.length
                ? `Também tem base em: ${alsoIn.join(', ')}`
                : undefined
            }
          >
            {p}
            {alsoIn.length > 0 && (
              <sup
                className="territory-also"
                aria-label={`também em ${alsoIn.join(', ')}`}
              >
                ↔
              </sup>
            )}
          </span>
        )
      })}
      {rest > 0 && <span className="group-label">+{rest}</span>}
    </span>
  )
}
