import { api } from '@/lib/api'
import type { BackendReport, Report } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

export interface GetReportsRequest extends PaginationRequest {
  semanticallySimilar?: string
  reportId?: string
  originalReportId?: string
  sourceIdContains?: string[]
  minDate?: string
  maxDate?: string
  categoryContains?: string[]
  descriptionContains?: string[]
  minLat?: number
  maxLat?: number
  minLon?: number
  maxLon?: number
}

interface GetReportsBackendRequest extends PaginationRequest {
  semantically_similar?: string
  id_report?: string
  id_report_original?: string
  id_source_contains?: string[]
  data_report_min?: string
  data_report_max?: string
  categoria_contains?: string[]
  descricao_contains?: string[]
  latitude_min?: number
  latitude_max?: number
  longitude_min?: number
  longitude_max?: number
}

interface GetReportsBackendResponse extends PaginationResponse {
  items: BackendReport[]
}

export interface ReportsResponse extends PaginationResponse {
  items: Report[]
}

export async function getReports(props: GetReportsRequest) {
  const query = new URLSearchParams()

  const newProps: GetReportsBackendRequest = {
    semantically_similar: props.semanticallySimilar,
    id_report: props.reportId,
    id_report_original: props.originalReportId,
    id_source_contains: props.sourceIdContains,
    data_report_min: props.minDate,
    data_report_max: props.maxDate,
    categoria_contains: props.categoryContains,
    descricao_contains: props.descriptionContains,
    latitude_min: props.minLat,
    latitude_max: props.maxLat,
    longitude_min: props.minLon,
    longitude_max: props.maxLon,
    page: props.page,
    size: props.size,
  }

  Object.entries(newProps).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          query.append(key, item)
        })
      } else {
        query.set(key, value)
      }
    }
  })

  const response = await api.get<GetReportsBackendResponse>(
    `/reports?${query.toString()}`,
  )

  const items = response.data.items.map(
    (item) =>
      ({
        reportId: item.id_report,
        additionalInfo: {
          certainty: item.additional_info.certainty,
        },
        category: item.categoria,
        date: item.data_report,
        description: item.descricao,
        entities: item.orgaos.map((orgao) => ({
          name: orgao.nome,
        })),
        latitude: item.latitude,
        location: item.logradouro,
        locationNumber: item.numero_logradouro,
        longitude: item.longitude,
        sourceId: item.id_source,
        originalReportId: item.id_report_original,
        typeAndSubtype: item.tipo_subtipo.map((type) => ({
          type: type.tipo,
          subtype: type.subtipo,
        })),
      }) as Report,
  )

  return {
    ...response.data,
    items,
  } as ReportsResponse
}
