'use server'

import { api } from '@/lib/api'
import type { NotificationChannel } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

export interface GetNotificationChannelRequest extends PaginationRequest {}

export interface GetNotificationChannelResponse extends PaginationResponse {
  items: NotificationChannel[]
}

export async function getNotificationChannels({
  page,
  size,
}: GetNotificationChannelRequest) {
  const response = await api.get<GetNotificationChannelResponse>(
    'notification-channels',
    {
      params: {
        page,
        size,
      },
    },
  )

  return response.data
}
