import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { MonitoredPlatesFilter } from '@/app/(app)/placas-monitoradas/components/monitored-plates-filter'
import { getInstitutionAuthorities } from '@/http/institution-authorities'
import { getRequestingInstitutions } from '@/http/requesting-institutions'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@/components/custom/multiselect-with-search', () => ({
  useDebounce: (value: string) => value,
}))

jest.mock('@/http/institution-authorities', () => ({
  getInstitutionAuthorities: jest.fn(),
}))

jest.mock('@/http/requesting-institutions', () => ({
  getRequestingInstitutions: jest.fn(),
}))

jest.mock(
  '@/app/(app)/placas-monitoradas/components/monitored-plates-filter/monitored-plates-filter-combobox',
  () => ({
    MonitoredPlatesFilterCombobox: ({
      id,
      options,
      onOpenChange,
      onSelect,
    }: {
      id: string
      options: Array<{ id: string; label: string }>
      onOpenChange: (open: boolean) => void
      onSelect: (option: { id: string; label: string } | null) => void
    }) => (
      <div>
        <button
          type="button"
          data-testid={id}
          onClick={() => onOpenChange(true)}
        >
          {id}
        </button>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
    ),
  }),
)

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>
const mockedGetInstitutionAuthorities =
  getInstitutionAuthorities as jest.MockedFunction<
    typeof getInstitutionAuthorities
  >
const mockedGetRequestingInstitutions =
  getRequestingInstitutions as jest.MockedFunction<
    typeof getRequestingInstitutions
  >

function renderFilter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MonitoredPlatesFilter />
    </QueryClientProvider>,
  )
}

describe('MonitoredPlatesFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/placas-monitoradas')
    mockUseRouter.mockReturnValue({ replace: jest.fn() } as any)
    mockUseSearchParams.mockReturnValue(new URLSearchParams() as any)
    mockedGetRequestingInstitutions.mockResolvedValue({
      data: {
        items: [{ id: 'institution-1', name: 'Demandante 1' }],
        page: 1,
        size: 100,
        total: 1,
      },
    } as any)
    mockedGetInstitutionAuthorities.mockResolvedValue({
      data: {
        items: [{ id: 'authority-1', name: 'Requisitante 1' }],
        page: 1,
        size: 20,
        total: 1,
      },
    } as any)
  })

  it('loads requisitantes using the selected demandante', async () => {
    renderFilter()

    fireEvent.click(
      screen.getByTestId('monitored-plates-requesting-institution'),
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Demandante 1' }))
    fireEvent.click(screen.getByTestId('monitored-plates-authority'))

    await waitFor(() => {
      expect(mockedGetInstitutionAuthorities).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        search: '',
        requestingInstitutionId: 'institution-1',
      })
    })
  })

  it('syncs the reference number filter to the URL', async () => {
    const replace = jest.fn()
    mockUseRouter.mockReturnValue({ replace } as any)

    renderFilter()
    fireEvent.change(screen.getByLabelText('Número de referência'), {
      target: { value: 'REF-123' },
    })

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        '/placas-monitoradas?referenceNumberContains=REF-123&active=true',
      )
    })
  })
})
