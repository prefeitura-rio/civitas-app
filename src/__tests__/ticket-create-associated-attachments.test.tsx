import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { AxiosHeaders, type AxiosResponse } from 'axios'
import type { ReactNode } from 'react'

import { useTicketCreateController } from '@/app/(app)/demandas/criar/hooks/use-create-controller'
import { getTicketNatures } from '@/http/get-ticket-natures/get-ticket-natures'
import { getTeamsList } from '@/http/teams/get-teams'
import { getTicketTypes } from '@/http/ticket-types/get-ticket.types'
import { getTicketById, type TicketOut } from '@/http/tickets/get-ticket-by-id'
import { getTicketAttachments } from '@/http/tickets/ticket-attachments'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('@/http/get-ticket-natures/get-ticket-natures', () => ({
  getTicketNatures: jest.fn(),
}))
jest.mock('@/http/teams/get-teams', () => ({ getTeamsList: jest.fn() }))
jest.mock('@/http/ticket-types/get-ticket.types', () => ({
  getTicketTypes: jest.fn(),
}))
jest.mock('@/http/tickets/get-ticket-by-id', () => ({
  getTicketById: jest.fn(),
}))
jest.mock('@/http/tickets/ticket-attachments', () => ({
  getTicketAttachments: jest.fn(),
}))

function axiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  }
}

test('loads email-origin documents from the same attachment list used by ticket details', async () => {
  jest
    .mocked(getTicketTypes)
    .mockResolvedValue(
      axiosResponse([{ id: 'conventional-id', name: 'Convencional' }]),
    )
  jest.mocked(getTicketNatures).mockResolvedValue(axiosResponse([]))
  jest.mocked(getTeamsList).mockResolvedValue(axiosResponse([]))
  jest.mocked(getTicketById).mockResolvedValue({
    id: 'ticket-1',
    created_at: '2026-10-13T12:00:00Z',
    ticket_type_id: 'preliminary-id',
    has_press_alias: false,
    requester: { name: 'Solicitante', email: 'solicitante@example.com' },
    focal_points: [],
    attachments: [],
    plate_search: [],
    radar_search: [],
    electronic_fence: [],
    image_search: [],
    correlated_plates: [],
    joint_plates: [],
    image_reservation: [],
    image_analysis: [],
    other: [],
    atlas_civitas: [],
  } satisfies TicketOut)
  const emailAttachment = {
    id: 'attachment-1',
    filename: 'documento-do-email.pdf',
    size_bytes: 100,
    created_at: '2026-10-13T12:00:00Z',
  }
  jest.mocked(getTicketAttachments).mockResolvedValue([emailAttachment])

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useTicketCreateController(), { wrapper })

  await waitFor(() => expect(result.current.ticketTypes).toHaveLength(1))
  await act(async () => {
    await result.current.applyAssociatedTicketFromSearch(
      'ticket-1',
      'Levantamento Prévio',
      'Levantamento Prévio',
    )
  })

  expect(getTicketAttachments).toHaveBeenCalledWith('ticket-1')
  expect(result.current.existingAttachments).toEqual([emailAttachment])
})
