'use client'

import { useTeams } from '@/hooks/useContexts/use-teams-context'

import { DeleteTeamMemberAlertDialog } from './delete-team-member-alert-dialog'
import { TeamFormDialog } from './team-form-dialog'
import { TeamMemberFormDialog } from './team-member-form-dialog'

export function TeamsDialogs() {
  const {
    teamFormDisclosure,
    memberFormDisclosure,
    deleteTeamMemberProps,
    setDeleteTeamMemberProps,
  } = useTeams()

  const deleteTeamMemberDisclosure = {
    isOpen: Boolean(deleteTeamMemberProps),
    onOpen: () => {},
    onClose: () => setDeleteTeamMemberProps(null),
  }

  return (
    <>
      <TeamFormDialog
        isOpen={teamFormDisclosure.isOpen}
        onOpen={teamFormDisclosure.onOpen}
        onClose={teamFormDisclosure.onClose}
      />

      <TeamMemberFormDialog
        isOpen={memberFormDisclosure.isOpen}
        onOpen={memberFormDisclosure.onOpen}
        onClose={memberFormDisclosure.onClose}
      />

      <DeleteTeamMemberAlertDialog
        isOpen={deleteTeamMemberDisclosure.isOpen}
        onOpen={deleteTeamMemberDisclosure.onOpen}
        onClose={deleteTeamMemberDisclosure.onClose}
      />
    </>
  )
}
