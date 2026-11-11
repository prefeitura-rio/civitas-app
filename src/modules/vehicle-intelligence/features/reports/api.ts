import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { ApiError, fetchApi } from '@/modules/vehicle-intelligence/lib/api'

export type ReportFormat = 'pdf' | 'html' | 'mp4'

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
  try {
    return (await (await fetchApi(path, init)).json()) as ReportStatus
  } catch (reason) {
    // 409 no POST devolve o estado corrente: outra geração já está em andamento.
    if (
      init.method === 'POST' &&
      reason instanceof ApiError &&
      reason.status === 409
    )
      return reason.body as ReportStatus
    throw reason
  }
}

/** Baixa por fetch, e não por um `<a href>`, para mostrar o erro da API na tela em vez de abrir uma página de erro. */
async function downloadFile(path: string, fileName: string): Promise<void> {
  const response = await fetchApi(path)
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

/** Relatório do perfil de um RO: a query é a da tela do perfil (`ro`, janelas, filtros de placa e ordem), então o PDF
 * sai com as listas da tela. O nome do arquivo é o do servidor (a barra do RO vira traço). */
export function occurrenceReportPaths(ro: string, query: string): ReportPaths {
  const base = '/api/v1/reports/occurrence'
  const name = ro
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return {
    status: withQuery(base, query),
    file: withQuery(`${base}/file`, query),
    fileName: `relatorio_ro_${name || 'sem-numero'}`,
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

/** As opções do vídeo da timeline (`relatorios/video`): tema, conteúdo e resolução. */
export interface TimelineVideoOptions {
  tema: 'claro' | 'escuro'
  modo: 'completo' | 'anonimizado'
  resolucao: '1664x624' | '1920x1080'
}

/** Quantos dias cabem num vídeo (`MAX_DIAS` em `relatorios/video/gravacao.py`). */
export const TIMELINE_VIDEO_MAX_DAYS = 10

/**
 * Vídeo (MP4) da timeline da placa, de um dia ou de vários em sequência (até `TIMELINE_VIDEO_MAX_DAYS`), no recorte de
 * fatos da tela; o nome é o mesmo que o servidor dá (`nome_arquivo`).
 */
export function timelineVideoPaths(
  plate: string,
  scope: string,
  days: string[],
  options: TimelineVideoOptions,
): ReportPaths {
  const base = `/api/v1/reports/video/${encodeURIComponent(plate)}`
  const ordered = [...new Set(days)].sort()
  const params = new URLSearchParams(scope)
  params.delete('dia')
  for (const day of ordered) params.append('dia', day)
  params.set('tema', options.tema)
  params.set('modo', options.modo)
  params.set('resolucao', options.resolucao)
  const query = params.toString()
  const period =
    ordered.length === 1
      ? ordered[0]
      : `${ordered[0]}_a_${ordered[ordered.length - 1]}_${ordered.length}dias`
  const name =
    options.modo === 'anonimizado'
      ? `timeline_anonimizado_${period}`
      : `timeline_${plate}_${period}`
  return {
    status: withQuery(base, query),
    file: withQuery(`${base}/file`, query),
    fileName: `${name}_${options.tema}_${options.resolucao}`,
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
