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
import { deleteTeam } from '@/http/teams/delete-team'
import { queryClient } from '@/lib/react-query'
import { getApiErrorMessage } from '@/utils/error-handlers'

import type { TeamsController } from '../hooks/use-teams-controller'

interface DeleteTeamAlertDialogProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  controller: TeamsController
}

export function DeleteTeamAlertDialog({
  isOpen,
  onOpen,
  onClose,
  controller,
}: DeleteTeamAlertDialogProps) {
  const { deleteTeamProps, setDeleteTeamProps } = controller

  const { mutateAsync: deleteTeamMutation } = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  async function handleDeleteTeam() {
    try {
      if (!deleteTeamProps) return

      const response = deleteTeamMutation(deleteTeamProps.id)

      toast.promise(response, {
        loading: `Excluindo a equipe ${deleteTeamProps.name}...`,
        success: () =>
          `A equipe ${deleteTeamProps.name} foi excluída com sucesso.`,
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
      setDeleteTeamProps(null)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent className="equipes-alert-content">
        <AlertDialogHeader>
          <AlertDialogTitle className="equipes-alert-title">
            Excluir a equipe{' '}
            <span className="font-semibold text-destructive">
              {deleteTeamProps?.name}
            </span>
            ?
          </AlertDialogTitle>

          <AlertDialogDescription className="equipes-alert-description">
            Todos os vínculos de colaboradores com esta equipe serão removidos.
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-[var(--equipes-border)] bg-transparent text-[var(--equipes-text-subtle)] hover:bg-[var(--equipes-bg-label)] hover:text-[var(--equipes-text-default)]">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteTeam}
            className="equipes-modal-btn-salvar bg-destructive hover:bg-destructive/90"
          >
            Excluir equipe
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
