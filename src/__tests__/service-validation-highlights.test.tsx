import { render, screen } from '@testing-library/react'
import type { FieldErrors } from 'react-hook-form'

import { ServiceList } from '@/app/(app)/demandas/criar/components/services/service-list'
import { ServiceModal } from '@/app/(app)/demandas/criar/components/services/service-modal'
import { getTicketCreateServiceItemError } from '@/app/(app)/demandas/criar/ticket-create/ticket-create-form-errors'

const errors = {
  image_search: [{ addresses: [{ message: 'Required' }] }],
} as unknown as FieldErrors

test('marks the invalid image service and names its missing address', () => {
  render(
    <ServiceList
      label="Busca por imagem"
      fields={[{ id: 'service-1' }, { id: 'service-2' }]}
      onRemove={jest.fn()}
      onEdit={jest.fn()}
      renderRow={() => null}
      errorAtIndex={(index) =>
        getTicketCreateServiceItemError(errors, 'image_search', index)?.label
      }
    />,
  )

  const invalidService = screen.getByRole('button', {
    name: /Busca por imagem · Item 1/,
  }).parentElement
  expect(invalidService).toHaveAttribute('data-invalid', 'true')
  expect(invalidService).toHaveClass('serviceItemError')
  expect(
    screen.getByRole('button', { name: /Busca por imagem · Item 2/ })
      .parentElement,
  ).toHaveAttribute('data-invalid', 'false')
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Busca por imagem 1 — Endereço 1: Campo obrigatório',
  )
})

test.each(['image_search', 'image_reservation', 'image_analysis'] as const)(
  'marks the missing address input in %s',
  (service) => {
    const onSave = jest.fn()
    const serviceErrors = {
      [service]: [{ addresses: [{ message: 'Required' }] }],
    } as unknown as FieldErrors
    render(
      <ServiceModal
        variant="drawer"
        serviceModalOpen={service}
        editIndex={0}
        closeServiceModal={jest.fn()}
        initialBuscaPorImagem={{
          addresses: [''],
          cameras: [],
          period_start: null,
          period_end: null,
          description: null,
        }}
        initialReservaImagem={{
          addresses: [''],
          cameras: [],
          period_start: null,
          period_end: null,
          orientation: null,
        }}
        initialAnaliseImagem={{
          addresses: [''],
          cameras: [],
          period_start: null,
          period_end: null,
          orientation: null,
        }}
        validationError={getTicketCreateServiceItemError(
          serviceErrors,
          service,
          0,
        )}
        onSaveBuscaPorPlaca={onSave}
        onSaveBuscaPorRadar={onSave}
        onSaveCerco={onSave}
        onSaveBuscaPorImagem={onSave}
        onSavePlacasCorrelatas={onSave}
        onSavePlacasConjuntas={onSave}
        onSaveReservaImagem={onSave}
        onSaveAnaliseImagem={onSave}
        onSaveOutros={onSave}
        onSaveAtlasCivitas={onSave}
      />,
    )

    const addressInput = screen.getByPlaceholderText('Endereço')
    expect(addressInput).toHaveAttribute('aria-invalid', 'true')
    expect(addressInput).toHaveClass('border-destructive')
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório')
  },
)
