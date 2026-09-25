import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { HistoryFilter } from '@/app/(app)/placas-monitoradas/historico/components/filter'
import {
  getInstitutionAuthorities,
  getInstitutionAuthority,
} from '@/http/institution-authorities'
import {
  getRequestingInstitution,
  getRequestingInstitutions,
} from '@/http/requesting-institutions'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@/components/custom/multiselect-with-search', () => ({
  useDebounce: (value: string) => value,
}))

jest.mock('@/components/ui/popover', () => {
  const React = jest.requireActual<typeof import('react')>('react')

  return {
    Popover: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    PopoverContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }
})

jest.mock('@/http/institution-authorities', () => ({
  getInstitutionAuthorities: jest.fn(),
  getInstitutionAuthority: jest.fn(),
}))

jest.mock('@/http/requesting-institutions', () => ({
  getRequestingInstitutions: jest.fn(),
  getRequestingInstitution: jest.fn(),
}))

jest.mock('@/components/ui/select', () => {
  const React = jest.requireActual<typeof import('react')>('react')

  return {
    Select: ({
      value,
      onValueChange,
      children,
      disabled,
    }: {
      value?: string
      onValueChange?: (value: string) => void
      children: React.ReactNode
      disabled?: boolean
    }) => {
      const trigger = React.Children.toArray(children).find((child) => {
        return React.isValidElement(child) && child.props.id
      }) as React.ReactElement<{ id?: string }> | undefined

      return (
        <select
          aria-label={trigger?.props.id}
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange?.(event.target.value)}
        >
          {children}
        </select>
      )
    },
    SelectTrigger: ({
      id,
      children,
    }: {
      id?: string
      children: React.ReactNode
    }) => <span id={id}>{children}</span>,
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => children,
    SelectItem: ({
      value,
      children,
    }: {
      value: string
      children: React.ReactNode
    }) => <option value={value}>{children}</option>,
  }
})

jest.mock(
  '@/app/(app)/placas-monitoradas/components/monitored-plates-filter/monitored-plates-filter-combobox',
  () => ({
    MonitoredPlatesFilterCombobox: ({
      id,
      valueLabel,
      options,
      onOpenChange,
      onSelect,
    }: {
      id: string
      valueLabel: string
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
          {valueLabel || id}
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
const mockedGetRequestingInstitution =
  getRequestingInstitution as jest.MockedFunction<
    typeof getRequestingInstitution
  >
const mockedGetInstitutionAuthority =
  getInstitutionAuthority as jest.MockedFunction<typeof getInstitutionAuthority>

function renderFilter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <HistoryFilter />
    </QueryClientProvider>,
  )
}

describe('HistoryFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/placas-monitoradas/historico')
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
    mockedGetRequestingInstitution.mockResolvedValue({
      id: 'institution-9',
      name: 'Demandante fora da lista',
    } as never)
    mockedGetInstitutionAuthority.mockResolvedValue({
      id: 'authority-9',
      name: 'Requisitante fora da lista',
    } as never)
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

    fireEvent.click(screen.getByTestId('history-requesting-institution'))
    fireEvent.click(await screen.findByRole('button', { name: 'Demandante 1' }))
    fireEvent.click(screen.getByTestId('history-authority'))

    await waitFor(() => {
      expect(mockedGetInstitutionAuthorities).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        search: '',
        requestingInstitutionId: 'institution-1',
      })
    })
  })

  it('applies demandante and requisitante filters to the URL', async () => {
    const replace = jest.fn()
    mockUseRouter.mockReturnValue({ replace } as any)

    renderFilter()

    fireEvent.click(screen.getByTestId('history-requesting-institution'))
    fireEvent.click(await screen.findByRole('button', { name: 'Demandante 1' }))
    fireEvent.click(screen.getByTestId('history-authority'))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Requisitante 1' }),
    )
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Aplicar filtros' }).at(-1)!,
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        '/placas-monitoradas/historico?requestingInstitutionId=institution-1&institutionAuthorityId=authority-1&page=1',
      )
    })
  })

  it('shows deep-linked demandante and requisitante missing from the first page', async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'requestingInstitutionId=institution-9&institutionAuthorityId=authority-9',
      ) as any,
    )

    renderFilter()

    expect(
      await screen.findByText('Demandante fora da lista'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Requisitante fora da lista'),
    ).toBeInTheDocument()
  })

  it('drops end reason when applying filters with active status', async () => {
    const replace = jest.fn()
    mockUseRouter.mockReturnValue({ replace } as any)
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('status=active&endReason=expired') as any,
    )

    renderFilter()

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Aplicar filtros' }).at(-1)!,
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        '/placas-monitoradas/historico?status=active&page=1',
      )
    })
  })

  it('clears only the period from the popover', async () => {
    const replace = jest.fn()
    mockUseRouter.mockReturnValue({ replace } as any)
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'plate=ABC1D23&startTimeCreate=2026-01-01T00:00:00.000Z&endTimeDelete=2026-02-01T00:00:00.000Z',
      ) as any,
    )

    renderFilter()

    const heading = screen.getByRole('heading', {
      name: 'Período e mais filtros',
    })
    fireEvent.click(
      within(heading.parentElement!.parentElement as HTMLElement).getByRole(
        'button',
        { name: 'Limpar' },
      ),
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        '/placas-monitoradas/historico?plate=ABC1D23&page=1',
      )
    })
  })

  it('applies tipo de desativação to the URL', async () => {
    const replace = jest.fn()
    mockUseRouter.mockReturnValue({ replace } as any)

    renderFilter()

    fireEvent.change(screen.getByLabelText('endReason'), {
      target: { value: 'expired' },
    })
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Aplicar filtros' }).at(-1)!,
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        '/placas-monitoradas/historico?endReason=expired&page=1',
      )
    })
  })
})
