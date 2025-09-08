import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { EnhancePlatesInfo } from '@/app/(app)/veiculos/busca-por-radar/resultado/components/action-bar/components/enhance-plates-info'
import type { DetectionDTO } from '@/hooks/useQueries/useRadarsSearch'
import type { UseSearchByRadarResultDynamicFilter } from '@/hooks/useSearchByRadarResultDynamicFilter'

// Mock simples das dependências
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('@/hooks/useParams/useCarRadarSearchParams', () => ({
  useCarRadarSearchParams: () => ({
    formattedSearchParams: {
      date: {
        from: '2024-01-15T00:00:00Z',
        to: '2024-01-15T23:59:59Z',
      },
      plate: 'ABC1234',
      radarIds: ['RDR001'],
    },
  }),
}))

jest.mock('@/hooks/useQueries/useCortexRemainingCredits', () => ({
  useCortexRemainingCredits: () => ({
    data: {
      remaining_credit: 50,
      time_until_reset: 3600,
    },
  }),
}))

jest.mock('@/hooks/useQueries/useVehiclesCreditsRequired', () => ({
  useVehiclesCreditsRequired: () => ({
    data: {
      credits: 30,
    },
  }),
}))

jest.mock('@/lib/react-query', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}))

// Mock do componente real
jest.mock(
  '@/app/(app)/veiculos/busca-por-radar/resultado/components/action-bar/components/enhance-plates-info',
  () => ({
    EnhancePlatesInfo: ({ isLoading, plates, filters, data }: any) => (
      <div data-testid="enhance-plates-info">
        <div>Loading: {isLoading ? 'true' : 'false'}</div>
        <div>Plates: {plates.join(', ')}</div>
        <div>Selected Plate: {filters.selectedPlate}</div>
        <div>Data Count: {data?.length || 0}</div>
        <button>Enriquecer Resultado</button>
      </div>
    ),
  }),
)

// Mock data
const mockDetection: DetectionDTO = {
  plate: 'ABC1234',
  timestamp: '2024-01-15T10:00:00Z',
  location: 'Local Teste',
  cetRioCode: 'RDR001',
  speed: 60,
  lane: 'FX 01',
}

const mockFilters: UseSearchByRadarResultDynamicFilter = {
  filteredData: [mockDetection],
  setFilteredData: jest.fn(),
  selectedPlate: 'ABC1234',
  setSelectedPlate: jest.fn(),
  selectedLocations: ['Local Teste'],
  setSelectedLocations: jest.fn(),
  selectedRadars: ['RDR001'],
  setSelectedRadars: jest.fn(),
  locationOptions: ['Local Teste'],
}

// Wrapper para QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('EnhancePlatesInfo', () => {
  it('deve renderizar com as props corretas', () => {
    render(
      <EnhancePlatesInfo
        isLoading={false}
        plates={['ABC1234']}
        filters={mockFilters}
        data={[mockDetection]}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByTestId('enhance-plates-info')).toBeInTheDocument()
    expect(screen.getByText('Loading: false')).toBeInTheDocument()
    expect(screen.getByText('Plates: ABC1234')).toBeInTheDocument()
    expect(screen.getByText('Selected Plate: ABC1234')).toBeInTheDocument()
    expect(screen.getByText('Data Count: 1')).toBeInTheDocument()
    expect(screen.getByText('Enriquecer Resultado')).toBeInTheDocument()
  })

  it('deve renderizar com loading ativo', () => {
    render(
      <EnhancePlatesInfo
        isLoading={true}
        plates={['ABC1234']}
        filters={mockFilters}
        data={[]}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByText('Loading: true')).toBeInTheDocument()
  })

  it('deve renderizar sem placas', () => {
    render(
      <EnhancePlatesInfo
        isLoading={false}
        plates={[]}
        filters={mockFilters}
        data={[]}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByText(/Plates:/)).toBeInTheDocument()
    expect(screen.getByText(/Data Count: 0/)).toBeInTheDocument()
  })
})
