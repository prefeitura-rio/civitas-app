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
  'shows the end date and count on the first reading, hiding the final row (%p)',
  (Table) => {
    render(
      <Table
        isLoading={false}
        data={[
          {
            ...detection,
            timestamp: '2026-11-18T09:08:04',
          },
          {
            ...detection,
            timestamp: '2026-11-18T10:49:59',
            parado: true,
            minutos_parado: 101,
            total_deteccoes_parado: 4,
          },
          { ...detection, plate: 'EFG4H56' },
        ]}
      />,
    )

    const flaggedRow = screen.getByText('18/11/2026 09:08:04').closest('tr')!
    const normalRow = screen.getByText('EFG4H56').closest('tr')!
    expect(screen.getByText('Possível permanência até')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(
      within(flaggedRow).getByText('18/11/2026 09:08:04'),
    ).toBeInTheDocument()
    expect(
      within(flaggedRow).getByText('18/11/2026 10:49:59'),
    ).toBeInTheDocument()
    expect(within(flaggedRow).getByText('5 detecções')).toBeInTheDocument()
    expect(screen.getAllByText('18/11/2026 10:49:59')).toHaveLength(1)
    expect(within(normalRow).getByText('—')).toBeInTheDocument()
  },
)
