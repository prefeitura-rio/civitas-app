import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FieldErrors } from 'react-hook-form'

import { ServiceModal } from '@/app/(app)/demandas/criar/components/services/service-modal'
import { getTicketCreateServiceItemError } from '@/app/(app)/demandas/criar/ticket-create/ticket-create-form-errors'

const SERVICES = [
  'image_search',
  'image_reservation',
  'image_analysis',
] as const

function renderModal(service: (typeof SERVICES)[number]) {
  const onSave = jest.fn()
  const initial = {
    addresses: ['', 'Rua B'],
    cameras: [],
    period_start: null,
    period_end: null,
  }
  render(
    <ServiceModal
      variant="drawer"
      serviceModalOpen={service}
      editIndex={0}
      closeServiceModal={jest.fn()}
      initialBuscaPorImagem={{ ...initial, description: null }}
      initialReservaImagem={{ ...initial, orientation: null }}
      initialAnaliseImagem={{ ...initial, orientation: null }}
      validationError={getTicketCreateServiceItemError(
        {
          [service]: [{ addresses: [{ message: 'Required' }] }],
        } as unknown as FieldErrors,
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
}

test.failing.each(SERVICES)(
  'em %s, apagar o endereço com erro não passa o erro para o seguinte',
  async (service) => {
    renderModal(service)

    await userEvent.click(screen.getAllByTitle('Remover endereço')[0])

    const [remaining] = screen.getAllByPlaceholderText('Endereço')
    expect(remaining).toHaveValue('Rua B')
    expect(remaining).toHaveAttribute('aria-invalid', 'false')
  },
)
