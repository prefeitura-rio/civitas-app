import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { ChamadosImpersonationBar } from '@/app/(app)/demandas/chamados-impersonation-bar'
import { useChamadosImpersonation } from '@/app/(app)/demandas/chamados-impersonation-context'
import ForbiddenPage from '@/app/(app)/forbidden/page'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { getUsersOnlyWithRoles } from '@/http/user-roles/get-users-only-with-roles'

let pathname = '/demandas'

jest.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))
jest.mock('@/config', () => ({ config: { enableImpersonation: true } }))
jest.mock('@/hooks/useQueries/useProfile', () => ({ useProfile: jest.fn() }))
jest.mock('@/http/user-roles/get-users-only-with-roles', () => ({
  getUsersOnlyWithRoles: jest.fn(),
}))
jest.mock('@/app/(app)/demandas/chamados-impersonation-context', () => ({
  useChamadosImpersonation: jest.fn(),
}))

const mockedImpersonation = useChamadosImpersonation as jest.Mock
const clearImpersonation = jest.fn()

function impersonating(label: string | null) {
  mockedImpersonation.mockReturnValue({
    subjectUserId: label ? 'u2' : null,
    subjectLabel: label,
    setImpersonation: jest.fn(),
    clearImpersonation,
  })
}

function withClient(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

beforeEach(() => {
  jest.clearAllMocks()
  pathname = '/demandas'
  ;(useProfile as jest.Mock).mockReturnValue({
    data: { id: 'me', username: 'me' },
    isLoading: false,
    isError: false,
  })
  ;(getUsersOnlyWithRoles as jest.Mock).mockResolvedValue({
    data: [
      { id: 'me', username: 'me', full_name: 'Eu', role: 'Coordenador' },
      { id: 'u2', username: 'ana', full_name: 'Ana', role: 'Agente' },
    ],
  })
})

describe('impersonation bar', () => {
  it.failing(
    'warns outside Demandas that impersonation only applies there',
    async () => {
      pathname = '/placas-monitoradas'
      impersonating('Ana')
      withClient(<ChamadosImpersonationBar />)
      expect(
        await screen.findByText('Só no módulo Demandas'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Limpar/ })).toBeInTheDocument()
    },
  )

  it('has no warning inside Demandas', async () => {
    impersonating('Ana')
    withClient(<ChamadosImpersonationBar />)
    await screen.findByRole('button', { name: /Limpar/ })
    expect(screen.queryByText('Só no módulo Demandas')).toBeNull()
  })

  it('has no warning when not impersonating', async () => {
    pathname = '/veiculos'
    impersonating(null)
    withClient(<ChamadosImpersonationBar />)
    await screen.findByRole('combobox')
    expect(screen.queryByText('Só no módulo Demandas')).toBeNull()
  })
})

describe('forbidden page while impersonating', () => {
  it.failing(
    'names the impersonated user and offers to go back to your own',
    () => {
      impersonating('Ana')
      render(<ForbiddenPage />)
      expect(screen.getByText(/Você está vendo como Ana/)).toBeInTheDocument()
      fireEvent.click(
        screen.getByRole('button', { name: 'Voltar ao meu usuário' }),
      )
      expect(clearImpersonation).toHaveBeenCalledWith('/demandas')
    },
  )

  it('keeps the plain message without impersonation', () => {
    impersonating(null)
    render(<ForbiddenPage />)
    expect(screen.getByText('Acesso não permitido')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Voltar ao meu usuário' }),
    ).toBeNull()
  })
})
