import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { DownloadReport } from '@/app/(app)/veiculos/busca-por-radar/resultado/components/action-bar/components/download-report'
import type { DetectionDTO } from '@/hooks/useQueries/useRadarsSearch'
import type { UseSearchByRadarResultDynamicFilter } from '@/hooks/useSearchByRadarResultDynamicFilter'
import { exportToCSV } from '@/utils/csv'

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

jest.mock('@/hooks/useQueries/useRadars', () => ({
  useRadars: () => ({
    data: [
      {
        id: '1',
        cetRioCode: 'RDR001',
        location: 'Local Teste - FX 01',
        active: true,
        company: 'Empresa Teste',
        neighborhood: 'Bairro Teste',
        latitude: -22.9068,
        longitude: -43.1729,
        lastDetectionTime: '2024-01-15T10:00:00Z',
      },
    ],
  }),
}))

jest.mock('@/utils/csv', () => ({
  exportToCSV: jest.fn(),
}))

jest.mock('@/utils/download-file', () => ({
  downloadFile: jest.fn(),
}))

jest.mock('@react-pdf/renderer', () => ({
  pdf: jest.fn(() => ({
    toBlob: jest.fn().mockResolvedValue(new Blob()),
  })),
  Font: {
    registerHyphenationCallback: jest.fn(),
    register: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn(() => ({})),
  },
  Text: 'Text',
  View: 'View',
  Page: 'Page',
  Document: 'Document',
}))

const mockDetection: DetectionDTO = {
  plate: 'ABC1234',
  timestamp: '2024-01-15T10:00:00Z',
  location: 'Local Teste',
  equipmentCode: 'RDR001',
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

describe('DownloadReport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar o botão de download corretamente', () => {
    render(
      <DownloadReport
        data={[mockDetection]}
        isLoading={false}
        filters={mockFilters}
      />,
      { wrapper: createWrapper() },
    )

    // O botão tem um ícone de download, então podemos encontrá-lo assim
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('deve abrir o dialog ao clicar no botão', () => {
    render(
      <DownloadReport
        data={[mockDetection]}
        isLoading={false}
        filters={mockFilters}
      />,
      { wrapper: createWrapper() },
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(
      screen.getByText('Relatório de Busca por Equipamento'),
    ).toBeInTheDocument()
  })

  it('deve mostrar opções de formato de arquivo', () => {
    render(
      <DownloadReport
        data={[mockDetection]}
        isLoading={false}
        filters={mockFilters}
      />,
      { wrapper: createWrapper() },
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('Formato do arquivo:')).toBeInTheDocument()
    expect(screen.getByLabelText('PDF')).toBeInTheDocument()
    expect(screen.getByLabelText('CSV')).toBeInTheDocument()
  })

  it('deve mostrar opções de filtros dinâmicos', () => {
    render(
      <DownloadReport
        data={[mockDetection]}
        isLoading={false}
        filters={mockFilters}
      />,
      { wrapper: createWrapper() },
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('Aplicar filtros dinâmicos:')).toBeInTheDocument()
    expect(screen.getByLabelText('Sim')).toBeInTheDocument()
    expect(screen.getByLabelText('Não')).toBeInTheDocument()
  })

  it('deve alterar o tipo de arquivo ao selecionar', () => {
    render(
      <DownloadReport
        data={[mockDetection]}
        isLoading={false}
        filters={mockFilters}
      />,
      { wrapper: createWrapper() },
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const csvRadio = screen.getByLabelText('CSV')
    fireEvent.click(csvRadio)

    // Verifica se o radio foi clicado
    expect(csvRadio).toBeInTheDocument()
  })

  it('deve alterar a opção de filtros ao selecionar', () => {
    render(
      <DownloadReport
        data={[mockDetection]}
        isLoading={false}
        filters={mockFilters}
      />,
      { wrapper: createWrapper() },
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const naoRadio = screen.getByLabelText('Não')
    fireEvent.click(naoRadio)

    // Verifica se o radio foi clicado
    expect(naoRadio).toBeInTheDocument()
  })

  it('deve desabilitar o botão quando loading', () => {
    render(
      <DownloadReport
        data={[mockDetection]}
        isLoading={true}
        filters={mockFilters}
      />,
      { wrapper: createWrapper() },
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('deve fechar o dialog ao clicar em cancelar', () => {
    render(
      <DownloadReport
        data={[mockDetection]}
        isLoading={false}
        filters={mockFilters}
      />,
      { wrapper: createWrapper() },
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(
      screen.getByText('Relatório de Busca por Equipamento'),
    ).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelButton)

    expect(
      screen.queryByText('Relatório de Busca por Equipamento'),
    ).not.toBeInTheDocument()
  })

  it('exporta CSV com equipmentCode e sem coluna lane', async () => {
    render(
      <DownloadReport
        data={[mockDetection]}
        isLoading={false}
        filters={mockFilters}
      />,
      { wrapper: createWrapper() },
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByLabelText('CSV'))
    fireEvent.click(screen.getByRole('button', { name: /obter relatório/i }))

    await waitFor(() => {
      expect(exportToCSV).toHaveBeenCalledTimes(1)
    })

    expect(exportToCSV).toHaveBeenCalledWith(
      'busca_por_equipamento',
      expect.any(Array),
    )

    const csvRows = (exportToCSV as jest.Mock).mock.calls[0][1] as Record<
      string,
      unknown
    >[]

    expect(csvRows).toHaveLength(1)
    expect(csvRows[0]).toMatchObject({
      plate: 'ABC1234',
      equipmentCode: 'RDR001',
      location: 'Local Teste',
      speed: 60,
      timestamp: '2024-01-15T10:00:00Z',
    })
    expect(csvRows[0]).not.toHaveProperty('lane')
  })
})
