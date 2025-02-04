import { api } from '@/lib/api'
import type { BackendReport, Report } from '@/models/entities'
import type { GetReportsRequest } from '@/models/interfaces'
import type { PaginationResponse } from '@/models/pagination'
import { formatReportsRequest } from '@/utils/format-reports-request'
import { toQueryParams } from '@/utils/to-query-params'

interface GetReportsBackendResponse extends PaginationResponse {
  items: BackendReport[]
}

export interface ReportsResponse extends PaginationResponse {
  items: Report[]
}

export async function getReports(props: GetReportsRequest) {
  const newProps = formatReportsRequest(props)
  const query = toQueryParams(newProps)

  const response = await api.get<GetReportsBackendResponse>(
    `/reports?${query.toString()}`,
  )

  const items = response.data.items.map((item) => {
    return {
      reportId: item.id_report,
      additionalInfo: {
        certainty: item.additional_info?.certainty,
      },
      category: item.categoria,
      date: item.data_report,
      description: item.descricao,
      entities: item.orgaos,
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
    }
  })

  return {
    ...response.data,
    items,
  } as ReportsResponse
}
