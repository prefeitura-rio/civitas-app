export interface PaginationRequest {
  page?: number
  size?: number
}

export interface PaginationResponse {
  total: number
  page: number
  size: number
  pages: number
}
