'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { InputError } from '@/components/custom/input-error'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createTeam } from '@/http/teams/create-team'
import { updateTeam } from '@/http/teams/update-team'
import { queryClient } from '@/lib/react-query'
import { getApiErrorMessage } from '@/utils/error-handlers'

import type { TeamsController } from '../hooks/use-teams-controller'

const teamFormSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
})

type TeamForm = z.infer<typeof teamFormSchema>

interface TeamFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  controller: TeamsController
}

export function TeamFormDialog({
  isOpen,
  onClose,
  onOpen,
  controller,
}: TeamFormDialogProps) {
  const { teamDialogInitialData, setTeamDialogInitialData } = controller

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamForm>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
  })

  const { mutateAsync: createTeamMutation, isPending: isPendingCreate } =
    useMutation({
      mutationFn: createTeam,
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
        toast.success(`Equipe ${data.name} criada com sucesso.`)
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
      },
    })

  const { mutateAsync: updateTeamMutation, isPending: isPendingUpdate } =
    useMutation({
      mutationFn: updateTeam,
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
        toast.success(`Equipe ${data.name} atualizada com sucesso.`)
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
      },
    })

  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
      return
    }

    onClose()
    reset()
    setTeamDialogInitialData(null)
  }

  async function onSubmit(data: TeamForm) {
    if (teamDialogInitialData?.id) {
      await updateTeamMutation({
        teamId: teamDialogInitialData.id,
        name: data.name,
        description: data.description || null,
        is_active: data.is_active,
      })
    } else {
      await createTeamMutation({
        name: data.name,
        description: data.description || null,
        is_active: data.is_active,
      })
    }

    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (teamDialogInitialData && isOpen) {
      reset({
        name: teamDialogInitialData.name || '',
        description: teamDialogInitialData.description || '',
        is_active: teamDialogInitialData.is_active ?? true,
      })
    }

    if (!teamDialogInitialData && isOpen) {
      reset({
        name: '',
        description: '',
        is_active: true,
      })
    }
  }, [teamDialogInitialData, isOpen, reset])

  const isLoading = isSubmitting || isPendingCreate || isPendingUpdate

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="equipes-modal text-[var(--equipes-text-default)] sm:max-w-lg [&_.text-muted-foreground]:text-[var(--equipes-text-subtle)]">
        <DialogHeader>
          <DialogTitle className="equipes-modal-title">
            {teamDialogInitialData?.id ? 'Editar Equipe' : 'Criar Equipe'}
          </DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="name" className="equipes-modal-label">
                Nome
              </Label>
              <InputError message={errors.name?.message} />
            </div>
            <Input
              id="name"
              {...register('name')}
              disabled={isLoading}
              className="equipes-modal-input-wrap"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="description" className="equipes-modal-label">
              Descrição
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              disabled={isLoading}
              className="equipes-modal-input-wrap"
            />
          </div>

          <div className="mt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="equipes-modal-btn-salvar"
            >
              {isLoading ? <Spinner /> : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
