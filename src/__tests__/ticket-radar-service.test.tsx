import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ticketServicosToReplacePayload } from '@/app/(app)/demandas/[ticketId]/ticket-servicos-mapper'
import { ServiceModal } from '@/app/(app)/demandas/criar/components/services/service-modal'
import {
  buildTicketAssociatePayload,
  mapTicketOutToCreateForm,
} from '@/app/(app)/demandas/criar/ticket-create/ticket-create.mapper'
import type { TicketOut } from '@/http/tickets/get-ticket-by-id'
import { normalizeTicketServicosOut } from '@/http/tickets/ticket-servicos'

test('keeps the equipment number in conversion and service update payloads', () => {
  const radarSearch = {
    id: 'service-1',
    equipments: [
      {
        id: 'equipment-1',
        created_at: '2026-10-09T12:00:00Z',
        equipment_number: '12345678901234567890',
      },
    ],
  }
  const ticket = {
    operation_id: 'operation',
    nature_id: 'nature',
    requester: { name: 'Pessoa', email: 'pessoa@example.com' },
    has_press_alias: false,
    focal_points: [],
    team_id: 'team',
    radar_search: [radarSearch],
  } as unknown as TicketOut

  const form = mapTicketOutToCreateForm(ticket, {
    linked_ticket_id: 'ticket-1',
    ticket_type_id: 'conventional',
  })
  expect(form.radar_search[0].equipments).toEqual(['12345678901234567890'])
  expect(buildTicketAssociatePayload(form).radar_search[0].equipments).toEqual([
    '12345678901234567890',
  ])

  const services = normalizeTicketServicosOut({
    radar_search: [radarSearch],
  } as Parameters<typeof normalizeTicketServicosOut>[0])
  expect(
    ticketServicosToReplacePayload(services).radar_search[0].equipments,
  ).toEqual(['12345678901234567890'])
})

test('asks for equipment numbers without applying the vehicle plate mask', async () => {
  const onSave = jest.fn()
  render(
    <ServiceModal
      variant="drawer"
      serviceModalOpen="radar_search"
      editIndex={null}
      closeServiceModal={jest.fn()}
      onSaveBuscaPorPlaca={jest.fn()}
      onSaveBuscaPorRadar={onSave}
      onSaveCerco={jest.fn()}
      onSaveBuscaPorImagem={jest.fn()}
      onSavePlacasCorrelatas={jest.fn()}
      onSavePlacasConjuntas={jest.fn()}
      onSaveReservaImagem={jest.fn()}
      onSaveAnaliseImagem={jest.fn()}
      onSaveOutros={jest.fn()}
      onSaveAtlasCivitas={jest.fn()}
    />,
  )

  expect(screen.getByText('Equipamentos')).toBeInTheDocument()
  await userEvent.click(
    screen.getByRole('button', { name: 'Adicionar equipamento' }),
  )
  const input = screen.getByPlaceholderText('Número do equipamento')
  await userEvent.type(input, '1234567890')
  expect((input as HTMLInputElement).value).toBe('1234567890')

  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ equipments: ['1234567890'] }),
    null,
  )
})
