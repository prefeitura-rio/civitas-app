import { request } from '@/modules/vehicle-intelligence/lib/api'

/** Relato de uma ocorrência, como `/master-graph/occurrences/dynamics` devolve. */
export interface Dynamics {
  event_id: string
  event_time: string | null
  dynamics: string | null
}

/** Relatos das ocorrências, em lotes de 100 (limite da API), na ordem pedida. */
export async function fetchOccurrenceDynamics(
  eventIds: string[],
  signal?: AbortSignal,
): Promise<Dynamics[]> {
  const ids = [...new Set(eventIds)].sort()
  const batches: string[][] = []
  for (let i = 0; i < ids.length; i += 100) batches.push(ids.slice(i, i + 100))
  const results = await Promise.all(
    batches.map((batch) => {
      const query = new URLSearchParams()
      batch.forEach((id) => query.append('event_id', id))
      return request<{ occurrences: Dynamics[] }>(
        `/api/v1/master-graph/occurrences/dynamics?${query}`,
        signal,
      )
    }),
  )
  const byId = new Map(
    results
      .flatMap((result) => result.occurrences)
      .map((row) => [row.event_id, row]),
  )
  return ids.map(
    (id) => byId.get(id) ?? { event_id: id, event_time: '', dynamics: null },
  )
}
