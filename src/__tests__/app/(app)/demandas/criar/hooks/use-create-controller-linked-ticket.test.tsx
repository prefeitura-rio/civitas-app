import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { AxiosHeaders, type AxiosResponse } from 'axios'
import type { ReactNode } from 'react'

import { useTicketCreateController } from '@/app/(app)/demandas/criar/hooks/use-create-controller'
import { getTicketNatures } from '@/http/get-ticket-natures/get-ticket-natures'
import { getTeamsList } from '@/http/teams/get-teams'
import { getTicketTypes } from '@/http/ticket-types/get-ticket.types'
import { getTicketById, type TicketOut } from '@/http/tickets/get-ticket-by-id'
import {
  getTicketAttachments,
  type TicketAttachmentOut,
} from '@/http/tickets/ticket-attachments'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('sonner', () => ({
  toast: { error: jest.fn(), warning: jest.fn(), success: jest.fn() },
}))
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

function ticket(id: string, requesterName: string): TicketOut {
  return {
    id,
    created_at: '2026-10-13T12:00:00Z',
    ticket_type_id: 'preliminary-id',
    has_press_alias: false,
    requester: { name: requesterName, email: 'solicitante@example.com' },
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
  } satisfies TicketOut
}

function attachment(id: string): TicketAttachmentOut {
  return {
    id,
    filename: `${id}.pdf`,
    size_bytes: 100,
    created_at: '2026-10-13T12:00:00Z',
  } as TicketAttachmentOut
}

function deferred<T>() {
  let settle!: (value: T) => void
  const promise = new Promise<T>((resolve) => {
    settle = resolve
  })
  return { promise, resolve: settle }
}

async function renderController() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const view = renderHook(() => useTicketCreateController(), { wrapper })
  await waitFor(() => expect(view.result.current.ticketTypes).toHaveLength(1))
  return view
}

beforeEach(() => {
  jest.clearAllMocks()
  jest
    .mocked(getTicketTypes)
    .mockResolvedValue(
      axiosResponse([{ id: 'conventional-id', name: 'Convencional' }]),
    )
  jest.mocked(getTicketNatures).mockResolvedValue(axiosResponse([]))
  jest.mocked(getTeamsList).mockResolvedValue(axiosResponse([]))
})

it('limpar o chamado vinculado tira os anexos dele da tela', async () => {
  jest.mocked(getTicketById).mockResolvedValue(ticket('ticket-a', 'A'))
  jest.mocked(getTicketAttachments).mockResolvedValue([attachment('a-1')])
  const { result } = await renderController()

  await act(async () => {
    await result.current.applyAssociatedTicketFromSearch('ticket-a', 'A', 'LP')
  })
  act(() => {
    result.current.setValue('linked_ticket_id', null)
  })

  expect(result.current.existingAttachments).toEqual([])
})

it('falha ao buscar os anexos não desfaz o vínculo', async () => {
  jest.mocked(getTicketById).mockResolvedValue(ticket('ticket-a', 'A'))
  jest.mocked(getTicketAttachments).mockRejectedValue(new Error('timeout'))
  const { result } = await renderController()

  await act(async () => {
    await result.current
      .applyAssociatedTicketFromSearch('ticket-a', 'A', 'LP')
      .catch(() => undefined)
  })

  expect(result.current.getValues('linked_ticket_id')).toBe('ticket-a')
  expect(result.current.getValues('requester.name')).toBe('A')
  expect(result.current.existingAttachments).toEqual([])
})

it('resposta atrasada de outro chamado não sobrescreve o atual', async () => {
  const slowA = deferred<TicketOut>()
  jest
    .mocked(getTicketById)
    .mockImplementation((id: string) =>
      id === 'ticket-a' ? slowA.promise : Promise.resolve(ticket(id, 'B')),
    )
  jest
    .mocked(getTicketAttachments)
    .mockImplementation(async (id: string) => [attachment(`${id}-1`)])
  const { result } = await renderController()

  let first: Promise<void> = Promise.resolve()
  act(() => {
    first = result.current.applyAssociatedTicketFromSearch(
      'ticket-a',
      'A',
      'LP',
    )
  })
  await act(async () => {
    await result.current.applyAssociatedTicketFromSearch('ticket-b', 'B', 'LP')
  })
  await act(async () => {
    slowA.resolve(ticket('ticket-a', 'A'))
    await first
  })

  expect(result.current.getValues('linked_ticket_id')).toBe('ticket-b')
  expect(result.current.getValues('requester.name')).toBe('B')
  expect(result.current.existingAttachments).toEqual([attachment('ticket-b-1')])
})
