import { selectableTeamMembers } from '@/app/(app)/demandas/equipes/components/team-member-form-dialog'
import type { UserRoleListItem } from '@/http/user-roles/get-users-with-roles'

const user = (
  id: string,
  extra: Partial<UserRoleListItem> = {},
): UserRoleListItem => ({
  id,
  username: id,
  full_name: id,
  email: null,
  role: 'Agente',
  is_active: true,
  ...extra,
})

describe('selectableTeamMembers', () => {
  it('never offers a service account for a team', () => {
    const users = [
      user('ana'),
      user('integracao', { is_service_account: true }),
      user('bia', { is_service_account: false }),
    ]
    expect(selectableTeamMembers(users).map((u) => u.id)).toEqual([
      'ana',
      'bia',
    ])
  })
})
