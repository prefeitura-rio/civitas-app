'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTeams } from '@/hooks/useContexts/use-teams-context'
import { deleteTeamMember } from '@/http/teams/delete-team-member'
import { queryClient } from '@/lib/react-query'
import { getApiErrorMessage } from '@/utils/error-handlers'

interface DeleteTeamMemberAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function DeleteTeamMemberAlertDialog({
  isOpen,
  onClose,
  onOpen,
}: DeleteTeamMemberAlertDialogProps) {
  const { deleteTeamMemberProps, setDeleteTeamMemberProps } = useTeams()

  const { mutateAsync: deleteTeamMemberMutation } = useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  async function handleDeleteTeamMember() {
    try {
      if (!deleteTeamMemberProps) return

      const response = deleteTeamMemberMutation(deleteTeamMemberProps.id)

      toast.promise(response, {
        loading: `Removendo ${deleteTeamMemberProps.user_name} da equipe ${deleteTeamMemberProps.team_name}...`,
        success: () =>
          `${deleteTeamMemberProps.user_name} removido(a) com sucesso da equipe ${deleteTeamMemberProps.team_name}!`,
        error: (error) => getApiErrorMessage(error),
      })

      await response
      handleOnOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
    } else {
      onClose()
      setDeleteTeamMemberProps(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent className="equipes-alert-content">
        <AlertDialogHeader>
          <AlertDialogTitle className="equipes-alert-title">
            Tem certeza que deseja remover{' '}
            <span className="font-semibold text-destructive">
              {deleteTeamMemberProps?.user_name}
            </span>{' '}
            da equipe{' '}
            <span className="font-semibold text-destructive">
              {deleteTeamMemberProps?.team_name}
            </span>
            ?
          </AlertDialogTitle>

          <AlertDialogDescription className="equipes-alert-description">
            Essa ação removerá o colaborador da equipe e não poderá ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-[var(--equipes-border)] bg-transparent text-[var(--equipes-text-subtle)] hover:bg-[var(--equipes-bg-label)] hover:text-[var(--equipes-text-default)]">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteTeamMember}
            className="equipes-modal-btn-salvar bg-destructive hover:bg-destructive/90"
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
