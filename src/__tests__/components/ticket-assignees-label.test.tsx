import { render, screen } from '@testing-library/react'

import { TicketAssigneesLabel } from '@/app/(app)/demandas/[ticketId]/components/ticket-assignees-label'

describe('TicketAssigneesLabel', () => {
  it('lists every responsible by first name and flags the inactive ones', () => {
    const { container } = render(
      <TicketAssigneesLabel
        assignees={[
          { user_id: 'u1', user_name: 'Ana Silva', is_active: true },
          { user_id: 'u2', user_name: 'Bia Souza', is_active: false },
        ]}
      />,
    )

    expect(container).toHaveTextContent('ANA, BIA')
    const badges = screen.getAllByText('Inativo')
    expect(badges).toHaveLength(1)
    expect(badges[0].closest('[data-assignee]')).toHaveTextContent('BIA')
    expect(screen.getByTitle('Bia Souza (usuário inativo)')).toBeInTheDocument()
  })

  it.each([[[]], [undefined]])(
    'shows a dash without responsibles (%p)',
    (assignees) => {
      const { container } = render(
        <TicketAssigneesLabel assignees={assignees} />,
      )
      expect(container).toHaveTextContent('—')
    },
  )
})
