import { render, screen, within } from '@testing-library/react'

import { DetectionsTable } from '@/app/(app)/veiculos/busca-por-radar/resultado/components/detections-table'
import { EnhancedDetectionsTable } from '@/app/(app)/veiculos/busca-por-radar/resultado-enriquecido/components/enhanced-detections-table'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

const detection = {
  plate: 'ABC1D23',
  timestamp: '2026-11-17T10:00:00-03:00',
  speed: 0,
  equipmentCode: '123',
  location: 'Rua de teste',
  latitude: -22.9,
  longitude: -43.2,
  lane: '',
  brandModel: '',
  color: '',
  modelYear: '',
}

it.each([DetectionsTable, EnhancedDetectionsTable])(
  'shows possible permanence only for flagged rows, including the initial reading in the count (%p)',
  (Table) => {
    render(
      <Table
        isLoading={false}
        data={[
          {
            ...detection,
            parado: true,
            minutos_parado: 15,
            total_deteccoes_parado: 4,
          },
          { ...detection, plate: 'DEF4G56' },
        ]}
      />,
    )

    const flaggedRow = screen.getByText('ABC1D23').closest('tr')!
    const normalRow = screen.getByText('DEF4G56').closest('tr')!
    expect(within(flaggedRow).getByText('5')).toBeInTheDocument()
    expect(within(flaggedRow).getByText('det.')).toBeInTheDocument()
    expect(
      within(flaggedRow).getByRole('button', {
        name: 'Possível permanência: 5 detecções',
      }),
    ).toBeInTheDocument()
    expect(within(normalRow).queryByText(/Possível permanência/)).toBeNull()
  },
)
