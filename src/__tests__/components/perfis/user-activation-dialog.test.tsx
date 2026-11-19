import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'

import {
  describeDeactivationResult,
  UserActivationDialog,
} from '@/app/(app)/demandas/perfis/components/user-activation-dialog'
import {
  deactivateUser,
  type UserActivation,
} from '@/http/user-roles/deactivate-user'
import { getDeactivationPreview } from '@/http/user-roles/get-deactivation-preview'
import { reactivateUser } from '@/http/user-roles/reactivate-user'

jest.mock('@/http/user-roles/deactivate-user', () => ({
  deactivateUser: jest.fn(),
}))
jest.mock('@/http/user-roles/reactivate-user', () => ({
  reactivateUser: jest.fn(),
}))
jest.mock('@/http/user-roles/get-deactivation-preview', () => ({
  getDeactivationPreview: jest.fn(),
}))
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockedDeactivate = deactivateUser as jest.Mock
const mockedReactivate = reactivateUser as jest.Mock
const mockedPreview = getDeactivationPreview as jest.Mock

const active = {
  id: 'u1',
  username: 'ana',
  full_name: 'Ana',
  email: null,
  role: 'Agente' as const,
  is_active: true,
}
const inactive = { ...active, is_active: false }

const result: UserActivation = {
  id: 'u1',
  is_active: false,
  deactivated_at: '2026-11-18T12:00:00Z',
  deactivated_by_id: 'me',
  deactivation_reason: 'DESLIGAMENTO',
  deactivation_note: null,
  transferred_tickets: 0,
  removed_from_shared_tickets: 0,
  left_teams: [],
  previous_teams: [],
}

function renderDialog(user = active, onClose = jest.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const invalidate = jest.spyOn(client, 'invalidateQueries')
  render(
    <QueryClientProvider client={client}>
      <UserActivationDialog user={user} onClose={onClose} />
    </QueryClientProvider>,
  )
  return { onClose, invalidate }
}

async function waitForPreview() {
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Desativar' })).toBeEnabled(),
  )
}

describe('describeDeactivationResult', () => {
  it('summarizes what happened to tickets and teams', () => {
    expect(
      describeDeactivationResult(
        {
          ...result,
          transferred_tickets: 2,
          removed_from_shared_tickets: 1,
          left_teams: ['Equipe A'],
        },
        'Bruno',
      ),
    ).toBe(
      '2 chamados transferidos para Bruno. Saiu de 1 chamado compartilhado. Removido(a) da equipe Equipe A.',
    )
    expect(
      describeDeactivationResult(
        { ...result, transferred_tickets: 1, left_teams: ['A', 'B'] },
        'Bruno',
      ),
    ).toBe('1 chamado transferido para Bruno. Removido(a) das equipes A, B.')
    expect(describeDeactivationResult(result)).toBeUndefined()
  })
})

describe('UserActivationDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedPreview.mockResolvedValue({
      sole_open_tickets: 0,
      shared_open_tickets: 0,
      teams: [],
      transfer_candidates: [],
    })
  })

  it('deactivates without transfer when nothing depends only on the user', async () => {
    mockedDeactivate.mockResolvedValue({ ...result, left_teams: ['Equipe A'] })
    const { onClose, invalidate } = renderDialog()

    await waitFor(() => expect(mockedPreview).toHaveBeenCalledWith('u1'))
    fireEvent.click(screen.getByLabelText('Desligamento'))
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))

    await waitFor(() =>
      expect(mockedDeactivate).toHaveBeenCalledWith({
        userId: 'u1',
        reason: 'DESLIGAMENTO',
        note: '',
        transferToUserId: undefined,
      }),
    )
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(screen.queryByLabelText(/Transferir/)).toBeNull()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['users-with-roles'] })
    expect(toast.success).toHaveBeenCalledWith('Ana foi desativado(a).', {
      description: 'Removido(a) da equipe Equipe A.',
    })
  })

  it('requires choosing who takes the tickets, ticket team first', async () => {
    mockedPreview.mockResolvedValue({
      sole_open_tickets: 2,
      shared_open_tickets: 1,
      teams: ['Equipe A'],
      transfer_candidates: [
        {
          user_id: 'u2',
          user_name: 'Bruno',
          role: 'Adjunto',
          team_name: 'Equipe A',
          in_ticket_team: true,
        },
        {
          user_id: 'u3',
          user_name: 'Carla',
          role: 'Agente',
          team_name: 'Equipe B',
          in_ticket_team: false,
        },
        {
          user_id: 'u4',
          user_name: 'Dani',
          role: 'Coordenador',
          team_name: null,
          in_ticket_team: false,
        },
      ],
    })
    mockedDeactivate.mockResolvedValue({ ...result, transferred_tickets: 2 })
    renderDialog()

    const select = await screen.findByLabelText(
      'Transferir 2 chamados abertos para',
    )
    const groups = select.querySelectorAll('optgroup')
    expect([...groups].map((g) => g.label)).toEqual([
      'Equipe A',
      'Outras equipes',
    ])
    expect(groups[0]).toHaveTextContent('Bruno')
    expect(groups[1]).toHaveTextContent('Carla (Equipe B)')
    expect(groups[1]).toHaveTextContent('Dani (sem equipe)')
    expect(screen.getByText(/1 chamado compartilhado/)).toBeInTheDocument()
    expect(screen.queryByText(/Sai da equipe/)).toBeNull()

    // motivo vem antes da transferência
    const reasonLegend = screen.getByText('Motivo')
    expect(
      reasonLegend.compareDocumentPosition(select) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    fireEvent.click(screen.getByLabelText('Desligamento'))
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))
    expect(
      await screen.findByText('Escolha quem recebe os chamados.'),
    ).toBeInTheDocument()
    expect(mockedDeactivate).not.toHaveBeenCalled()

    fireEvent.change(select, { target: { value: 'u2' } })
    // o erro some assim que o campo é corrigido
    expect(screen.queryByText('Escolha quem recebe os chamados.')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))

    await waitFor(() =>
      expect(mockedDeactivate).toHaveBeenCalledWith(
        expect.objectContaining({ transferToUserId: 'u2' }),
      ),
    )
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Ana foi desativado(a).', {
        description: '2 chamados transferidos para Bruno.',
      }),
    )
  })

  it.each([
    [1, 'Ana é o(a) único(a) responsável por esse chamado'],
    [3, 'Ana é o(a) único(a) responsável por esses chamados'],
  ])('agrees in number with %i sole ticket(s)', async (count, text) => {
    mockedPreview.mockResolvedValue({
      sole_open_tickets: count,
      shared_open_tickets: 0,
      teams: [],
      transfer_candidates: [],
    })
    renderDialog()
    expect(
      await screen.findByText(new RegExp(text.replace(/[().]/g, '\\$&'))),
    ).toBeInTheDocument()
  })

  it('does not render an empty notice list when the user only has teams', async () => {
    mockedPreview.mockResolvedValue({
      sole_open_tickets: 0,
      shared_open_tickets: 0,
      teams: ['Equipe A'],
      transfer_candidates: [],
    })
    renderDialog()
    await waitFor(() => expect(mockedPreview).toHaveBeenCalled())
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('does not submit with a stale cached preview while it refetches', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    client.setQueryData(['users-roles', 'deactivation-preview', 'u1'], {
      sole_open_tickets: 0,
      shared_open_tickets: 0,
      teams: [],
      transfer_candidates: [],
    })
    mockedPreview.mockReturnValue(new Promise(() => {}))
    render(
      <QueryClientProvider client={client}>
        <UserActivationDialog user={active} onClose={jest.fn()} />
      </QueryClientProvider>,
    )

    fireEvent.click(screen.getByLabelText('Desligamento'))
    expect(screen.getByRole('button', { name: 'Desativar' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(mockedDeactivate).not.toHaveBeenCalled()
  })

  it('blocks the deactivation until the preview loads, offering a retry', async () => {
    mockedPreview.mockRejectedValueOnce(new Error('falhou'))
    renderDialog()

    expect(
      await screen.findByText(
        'Não foi possível carregar os chamados e equipes do usuário.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desativar' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    await waitForPreview()
    expect(mockedPreview).toHaveBeenCalledTimes(2)
    expect(
      screen.queryByText(
        'Não foi possível carregar os chamados e equipes do usuário.',
      ),
    ).toBeNull()
  })

  it('scrolls inside the dialog on short screens', () => {
    renderDialog()
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toMatch(/max-h-\[90vh\]/)
    expect(dialog.className).toMatch(/overflow-y-auto/)
  })

  it('clears each validation error as soon as its field is fixed', async () => {
    renderDialog()
    await waitFor(() => expect(mockedPreview).toHaveBeenCalled())
    fireEvent.click(screen.getByLabelText('Outro'))
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))
    expect(await screen.findByText('Descreva o motivo.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Observação/), {
      target: { value: 'Projeto encerrado' },
    })
    expect(screen.queryByText('Descreva o motivo.')).toBeNull()
  })

  it('requires a reason and a note for OUTRO', async () => {
    renderDialog()
    await waitForPreview()
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))
    expect(await screen.findByText('Selecione o motivo.')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Outro'))
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))
    expect(await screen.findByText('Descreva o motivo.')).toBeInTheDocument()
    expect(mockedDeactivate).not.toHaveBeenCalled()
  })

  it('does not offer automatic reasons', () => {
    renderDialog()
    expect(screen.queryByText(/Bloqueio automático/)).toBeNull()
  })

  it('shows the API error and keeps the dialog open', async () => {
    mockedDeactivate.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          detail: 'Não é possível desativar o último coordenador ativo.',
        },
      },
    })
    const { onClose } = renderDialog()
    await waitForPreview()
    fireEvent.click(screen.getByLabelText('Desligamento'))
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(onClose).not.toHaveBeenCalled()
  })

  it('reactivates and says which teams to add the user back to', async () => {
    mockedReactivate.mockResolvedValue({
      ...result,
      is_active: true,
      previous_teams: ['teste (Adjunto)'],
    })
    const { onClose } = renderDialog(inactive)

    expect(
      screen.getByText(/não volta para as equipes automaticamente/),
    ).toBeInTheDocument()
    expect(mockedPreview).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Reativar' }))

    await waitFor(() => expect(mockedReactivate).toHaveBeenCalledWith('u1'))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(toast.success).toHaveBeenCalledWith('Ana foi reativado(a).', {
      description:
        'O acesso volta no próximo login. Era da equipe teste (Adjunto); adicione de novo pela tela de Equipes.',
    })
  })

  it('reactivates someone who had no team', async () => {
    mockedReactivate.mockResolvedValue({ ...result, is_active: true })
    renderDialog(inactive)

    fireEvent.click(screen.getByRole('button', { name: 'Reativar' }))

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Ana foi reativado(a).', {
        description: 'O acesso volta no próximo login.',
      }),
    )
  })
})
