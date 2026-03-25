'use client'

import type { TeamsController } from '../hooks/use-teams-controller'
import { DeleteTeamMemberAlertDialog } from './delete-team-member-alert-dialog'
import { TeamFormDialog } from './team-form-dialog'
import { TeamMemberFormDialog } from './team-member-form-dialog'

interface TeamsDialogsProps {
  controller: TeamsController
}

export function TeamsDialogs({ controller }: TeamsDialogsProps) {
  const {
    teamFormDisclosure,
    memberFormDisclosure,
    deleteTeamMemberProps,
    closeDeleteTeamMemberDialog,
  } = controller

  return (
    <>
      <TeamFormDialog
        isOpen={teamFormDisclosure.isOpen}
        onOpen={teamFormDisclosure.onOpen}
        onClose={teamFormDisclosure.onClose}
        controller={controller}
      />

      <TeamMemberFormDialog
        isOpen={memberFormDisclosure.isOpen}
        onOpen={memberFormDisclosure.onOpen}
        onClose={memberFormDisclosure.onClose}
        controller={controller}
      />

      <DeleteTeamMemberAlertDialog
        isOpen={Boolean(deleteTeamMemberProps)}
        onOpen={() => {}}
        onClose={closeDeleteTeamMemberDialog}
        controller={controller}
      />
    </>
  )
}
