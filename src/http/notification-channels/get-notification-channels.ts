import { api } from '@/lib/api'
import type { NotificationChannel } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

interface BackendNotificationChannelItem {
  id: string
  title: string | null
  channel_type: string
  active: boolean
}

interface BackendGetNotificationChannelResponse extends PaginationResponse {
  items: BackendNotificationChannelItem[]
}

export interface GetNotificationChannelRequest extends PaginationRequest {}

export interface GetNotificationChannelResponse extends PaginationResponse {
  items: NotificationChannel[]
}

function mapBackendNotificationChannel(
  item: BackendNotificationChannelItem,
): NotificationChannel {
  return {
    id: item.id,
    title: item.title ?? '',
    channelType: item.channel_type,
    active: item.active,
  }
}

export async function getNotificationChannels({
  page,
  size,
}: GetNotificationChannelRequest) {
  const response = await api.get<BackendGetNotificationChannelResponse>(
    'notification-channels',
    {
      params: {
        page,
        size,
      },
    },
  )

  return {
    ...response,
    data: {
      ...response.data,
      items: response.data.items.map(mapBackendNotificationChannel),
    } satisfies GetNotificationChannelResponse,
  }
}
