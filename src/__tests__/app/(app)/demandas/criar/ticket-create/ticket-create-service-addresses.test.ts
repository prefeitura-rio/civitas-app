import type { FieldErrors } from 'react-hook-form'

import { ticketServicosToReplacePayload } from '@/app/(app)/demandas/[ticketId]/ticket-servicos-mapper'
import {
  buildTicketAssociatePayload,
  mapTicketOutToCreateForm,
} from '@/app/(app)/demandas/criar/ticket-create/ticket-create.mapper'
import { getTicketCreateFormErrorMessage } from '@/app/(app)/demandas/criar/ticket-create/ticket-create-form-errors'
import type { TicketOut } from '@/http/tickets/get-ticket-by-id'
import { normalizeTicketServicosOut } from '@/http/tickets/ticket-servicos'

const address = (text: string) => ({
  id: text,
  created_at: '2026-10-08T12:00:00Z',
  address_text: text,
})

test('maps API address_text into the conversion payload for all three image services', () => {
  const services = {
    image_search: [{ addresses: [address('Rua A, 10')] }],
    image_reservation: [{ addresses: [address('Rua B, 20')] }],
    image_analysis: [{ addresses: [address('Rua C, 30')] }],
  }
  const ticket = {
    operation_id: 'operation',
    nature_id: 'nature',
    requester: { name: 'Pessoa', email: 'pessoa@example.com' },
    has_press_alias: false,
    focal_points: [],
    team_id: 'team',
    ...services,
  } as unknown as TicketOut

  const form = mapTicketOutToCreateForm(ticket, {
    linked_ticket_id: 'ticket',
    ticket_type_id: 'conventional',
  })
  expect(form.image_search[0].addresses).toEqual(['Rua A, 10'])
  expect(form.image_reservation[0].addresses).toEqual(['Rua B, 20'])
  expect(form.image_analysis[0].addresses).toEqual(['Rua C, 30'])

  const payload = buildTicketAssociatePayload(form)
  expect(payload.image_search[0].addresses).toEqual(['Rua A, 10'])
  expect(payload.image_reservation[0].addresses).toEqual(['Rua B, 20'])
  expect(payload.image_analysis[0].addresses).toEqual(['Rua C, 30'])
})

test('saves edited address_text for all three image services', () => {
  const services = {
    image_search: [{ id: 'search', addresses: [address('Rua A, 10')] }],
    image_reservation: [
      { id: 'reservation', addresses: [address('Rua B, 20')] },
    ],
    image_analysis: [{ id: 'analysis', addresses: [address('Rua C, 30')] }],
  } as Parameters<typeof normalizeTicketServicosOut>[0]
  const normalized = normalizeTicketServicosOut(services)

  normalized.image_search[0].addresses![0].address_text = 'Rua Nova A, 10'
  normalized.image_reservation[0].addresses![0].address_text = 'Rua Nova B, 20'
  normalized.image_analysis[0].addresses![0].address_text = 'Rua Nova C, 30'
  const payload = ticketServicosToReplacePayload(normalized)
  expect(payload.image_search[0].addresses).toEqual(['Rua Nova A, 10'])
  expect(payload.image_reservation[0].addresses).toEqual(['Rua Nova B, 20'])
  expect(payload.image_analysis[0].addresses).toEqual(['Rua Nova C, 30'])
})

test('does not restore the API address after the edited field is cleared', () => {
  const services = {
    image_search: [{ id: 'service', addresses: [address('Rua Antiga, 10')] }],
  } as Parameters<typeof normalizeTicketServicosOut>[0]
  const normalized = normalizeTicketServicosOut(services)
  normalized.image_search[0].addresses![0].address_text = ''

  expect(
    ticketServicosToReplacePayload(normalized).image_search[0].addresses,
  ).toEqual([])
})

test('keeps API address_text in all three image service lists', () => {
  const services = {
    image_search: [{ addresses: [address('Rua A, 10')] }],
    image_reservation: [{ addresses: [address('Rua B, 20')] }],
    image_analysis: [{ addresses: [address('Rua C, 30')] }],
  }
  const normalized = normalizeTicketServicosOut(
    services as Parameters<typeof normalizeTicketServicosOut>[0],
  )
  expect(normalized.image_search[0].addresses?.[0].address_text).toBe(
    'Rua A, 10',
  )
  expect(normalized.image_reservation[0].addresses?.[0].address_text).toBe(
    'Rua B, 20',
  )
  expect(normalized.image_analysis[0].addresses?.[0].address_text).toBe(
    'Rua C, 30',
  )
  expect(normalized.image_search[0].addresses?.[0]).not.toHaveProperty(
    'address',
  )
})

test('formats a missing address error with its service and field', () => {
  const errors = {
    image_search: [{ addresses: [{ message: 'Required' }] }],
  } as unknown as FieldErrors

  expect(getTicketCreateFormErrorMessage(errors)).toBe(
    'Busca por imagem 1 — Endereço 1: Campo obrigatório',
  )
})
