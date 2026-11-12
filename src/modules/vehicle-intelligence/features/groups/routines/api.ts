/** Caminhos das motos de rotina parecida (`/api/<recorte>/v1/routines/...`), lidos com `useApi`. */

/** As 10 motos de rotina mais parecida com a placa. */
export const routineSimilarPath = (plate: string) =>
  `/api/v1/routines/similar?placa=${encodeURIComponent(plate)}`

/** As 10 motos de fora do grupo de rotina mais parecida com algum membro. */
export function routineGroupPath(plates: string[]) {
  const query = new URLSearchParams()
  ;[...plates].sort().forEach((plate) => query.append('placa', plate))
  return `/api/v1/routines/group?${query}`
}
