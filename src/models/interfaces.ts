import type { PaginationRequest } from './pagination'

export interface GetReportsRequest extends PaginationRequest {
  semanticallySimilar?: string
  reportId?: string
  originalReportId?: string
  sourceIdContains?: string[]
  minDate?: string
  maxDate?: string
  categoryContains?: string[]
  descriptionContains?: string[]
  keywords?: string[]
  minLat?: number
  maxLat?: number
  minLon?: number
  maxLon?: number
  orderBy?: 'timestamp' | 'distance'
}

export interface GetReportsBackendRequest extends PaginationRequest {
  semantically_similar?: string
  id_report?: string
  id_report_original?: string
  id_source_contains?: string[]
  data_report_min?: string
  data_report_max?: string
  categoria_contains?: string[]
  descricao_contains?: string[]
  keywords?: string[]
  latitude_min?: number
  latitude_max?: number
  longitude_min?: number
  longitude_max?: number
  order_by?: 'timestamp' | 'distance'
}
