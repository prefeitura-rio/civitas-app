/** As pontas de uma conexão entre polos (as duas telas usam esses campos). */
type ConnectionEnds = {
  origin_latitude: number
  origin_longitude: number
  destination_latitude: number
  destination_longitude: number
}

/**
 * Com um polo aberto, os nomes de território perto dele e das pontas das conexões ficam fortes (o `focus` da
 * TerritoriesLayer); sem polo aberto, nenhum foco.
 */
export function territoryFocusOf(
  selected: { latitude: number; longitude: number } | null,
  connections: ConnectionEnds[],
): Array<[number, number]> | null {
  if (!selected) return null
  return [
    [selected.latitude, selected.longitude],
    ...connections.flatMap((connection) => [
      [connection.origin_latitude, connection.origin_longitude] as [
        number,
        number,
      ],
      [connection.destination_latitude, connection.destination_longitude] as [
        number,
        number,
      ],
    ]),
  ]
}
