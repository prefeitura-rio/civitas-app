import {
  recorte,
  recorteApiPath,
} from '@/modules/vehicle-intelligence/config/recortes'
import { responseError } from '@/modules/vehicle-intelligence/lib/api'

export type ReportFormat = 'pdf' | 'html'

/** Estado da última geração de um relatório (geral ou de uma placa), como `relatorios/geracao.py` devolve. */
export interface ReportStatus {
  estado: 'ocioso' | 'gerando' | 'concluido' | 'falhou'
  etapa?: string | null
  run_id?: string | null
  build_id?: string | null
  iniciado_em?: string | null
  concluido_em?: string | null
  detalhe?: string | null
  formatos?: ReportFormat[]
}

const GENERAL_STATUS_PATH = '/api/v1/reports/general'
const GENERAL_FILE_PATH = '/api/v1/reports/general/file'

/** Estado sem cache: muda a cada etapa da geração. */
async function fetchReportStatus(
  path: string,
  init: RequestInit = {},
): Promise<ReportStatus> {
  const response = await fetch(recorteApiPath(path), {
    cache: 'no-store',
    ...init,
  })
  // 409 no POST devolve o estado corrente: outra geração já está em andamento.
  if (!response.ok && !(init.method === 'POST' && response.status === 409))
    throw await responseError(response)
  return response.json() as Promise<ReportStatus>
}

/** Baixa por fetch, e não por um `<a href>`, para mostrar o erro da API na tela em vez de abrir uma página de erro. */
async function downloadFile(path: string, fileName: string): Promise<void> {
  const response = await fetch(recorteApiPath(path), { cache: 'no-store' })
  if (!response.ok) throw await responseError(response)
  const objectUrl = URL.createObjectURL(await response.blob())
  try {
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = fileName
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
  } finally {
    // O clique já iniciou a leitura; revogar no próximo tick evita vazar a URL.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
  }
}

export const getGeneralReportStatus = (signal?: AbortSignal) =>
  fetchReportStatus(GENERAL_STATUS_PATH, { signal })
export const startGeneralReport = (signal?: AbortSignal) =>
  fetchReportStatus(GENERAL_STATUS_PATH, { method: 'POST', signal })
export const downloadGeneralReport = (format: ReportFormat) =>
  downloadFile(
    `${GENERAL_FILE_PATH}?formato=${format}`,
    `${recorte.report?.fileName ?? 'relatorio'}.${format}`,
  )

/** Os caminhos de um relatório de placa: o estado (GET) e a geração (POST) no mesmo caminho, e o arquivo pronto. */
export interface ReportPaths {
  status: string
  file: string
  fileName: string
}

function withQuery(path: string, query: string): string {
  return query ? `${path}?${query}` : path
}

/** Relatório de correlações de uma placa: mesmo estado do geral, no recorte de fatos pedido (a query das rotas da placa). */
export function plateReportPaths(plate: string, scope: string): ReportPaths {
  const base = `/api/v1/reports/plate/${encodeURIComponent(plate)}`
  return {
    status: withQuery(base, scope),
    file: withQuery(`${base}/file`, scope),
    fileName: `relatorio_placa_${plate}`,
  }
}

/** Período do relatório de tendências (dias AAAA-MM-DD, horário de Brasília). */
export interface TrendPeriod {
  inicio: string
  fim: string
}

/** Estado do relatório de tendências, com o período resolvido e o padrão (o da aba de tendências). */
export interface TrendReportStatus extends ReportStatus {
  periodo?: TrendPeriod & { padrao: TrendPeriod }
}

/** Relatório de tendências de uma placa; sem período, o servidor usa o da aba de tendências. */
export function trendReportPaths(
  plate: string,
  period: TrendPeriod | null,
): ReportPaths {
  const base = `/api/v1/reports/trends/${encodeURIComponent(plate)}`
  const query = period
    ? new URLSearchParams({ inicio: period.inicio, fim: period.fim }).toString()
    : ''
  return {
    status: withQuery(base, query),
    file: withQuery(`${base}/file`, query),
    fileName: `relatorio_tendencias_${plate}`,
  }
}

export const getReportStatus = <T extends ReportStatus = ReportStatus>(
  paths: ReportPaths,
  signal?: AbortSignal,
) => fetchReportStatus(paths.status, { signal }) as Promise<T>
export const startReport = <T extends ReportStatus = ReportStatus>(
  paths: ReportPaths,
) => fetchReportStatus(paths.status, { method: 'POST' }) as Promise<T>
export const downloadReport = (paths: ReportPaths, format: ReportFormat) =>
  downloadFile(
    `${paths.file}${paths.file.includes('?') ? '&' : '?'}formato=${format}`,
    `${paths.fileName}.${format}`,
  )
