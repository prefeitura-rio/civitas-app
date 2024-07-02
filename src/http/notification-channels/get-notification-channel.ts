import { api } from '@/lib/api'

export interface GetNotificationChannelRequest {
  page?: number
  size?: number
}

export type NotificationChannel = {
  id: string
  title: string
  channel_type: string
  parameters: JSON
  active: boolean
}

export interface GetNotificationChannelResponse {
  items: NotificationChannel[]
  total: number
  page: number
  size: number
  pages: number
}

export async function getNotificationChannel({
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

  return response
}
