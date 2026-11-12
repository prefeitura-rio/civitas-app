/** Pós-evento: os caminhos da API das duas telas (copassagem e entorno), para o `useApi`. */

/** O pós-evento do recorte; a query é montada por cada tela, porque os filtros das duas estratégias são outros. */
export const postEventPath = (query: string) =>
  `/api/v1/master-graph/post-event${query ? `?${query}` : ''}`
