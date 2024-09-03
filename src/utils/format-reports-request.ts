import type {
  GetReportsBackendRequest,
  GetReportsRequest,
} from '@/models/interfaces'

export function formatReportsRequest(
  props: GetReportsRequest,
): GetReportsBackendRequest {
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

  return newProps
}
