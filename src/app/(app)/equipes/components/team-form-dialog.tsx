'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { createTeam } from '@/http/teams/create-team'
import { updateTeam } from '@/http/teams/update-team'
import { queryClient } from '@/lib/react-query'
import { getApiErrorMessage } from '@/utils/error-handlers'

import type { TeamsController } from '../hooks/use-teams-controller'

const islandSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Nome da Ilha é obrigatório'),
  is_active: z.boolean(),
})

const teamFormSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório'),
  is_active: z.boolean(),
  islands: z.array(islandSchema),
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
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamForm>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: '',
      is_active: true,
      islands: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'islands',
  })

  const { mutateAsync: createTeamMutation, isPending: isPendingCreate } =
    useMutation({
      mutationFn: createTeam,
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
        queryClient.invalidateQueries({ queryKey: ['islands'] })
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
        queryClient.invalidateQueries({ queryKey: ['islands'] })
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
    reset({
      name: '',
      is_active: true,
      islands: [],
    })
    setTeamDialogInitialData(null)
  }

  async function onSubmit(data: TeamForm) {
    const payload = {
      name: data.name.trim(),
      is_active: data.is_active,
      islands: data.islands.map((island) => ({
        ...(island.id ? { id: island.id } : {}),
        name: island.name.trim(),
        is_active: island.is_active,
      })),
    }

    if (teamDialogInitialData?.id) {
      await updateTeamMutation({
        teamId: teamDialogInitialData.id,
        ...payload,
      })
    } else {
      await createTeamMutation(payload)
    }

    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (!isOpen) return

    if (teamDialogInitialData?.id) {
      reset({
        name: teamDialogInitialData.name || '',
        is_active: teamDialogInitialData.is_active ?? true,
        islands:
          teamDialogInitialData.islands?.map((island) => ({
            id: island.id,
            name: island.name || '',
            is_active: island.is_active ?? true,
          })) ?? [],
      })
      return
    }

    reset({
      name: '',
      is_active: true,
      islands: [],
    })
  }, [teamDialogInitialData, isOpen, reset])

  const isLoading = isSubmitting || isPendingCreate || isPendingUpdate

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="equipes-modal flex max-h-[90vh] flex-col text-[var(--equipes-text-default)] sm:max-w-2xl [&_.text-muted-foreground]:text-[var(--equipes-text-subtle)]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="equipes-modal-title">
            {teamDialogInitialData?.id ? 'Editar Equipe' : 'Criar Equipe'}
          </DialogTitle>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col gap-4">
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

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label className="equipes-modal-label">Ilhas</Label>

                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      append({
                        name: '',
                        is_active: true,
                      })
                    }
                    className="h-9 gap-2 rounded-[10px] border border-[var(--equipes-border)] bg-transparent px-3 text-[var(--equipes-text-default)] hover:bg-[var(--equipes-bg-label)]"
                  >
                    <Plus size={16} />
                    Adicionar Ilha
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <div className="equipes-modal-card">
                    <p className="equipes-modal-label">
                      Nenhuma Ilha adicionada.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="equipes-modal-card">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                              <Label
                                htmlFor={`islands.${index}.name`}
                                className="equipes-modal-label"
                              >
                                Nome
                              </Label>
                              <InputError
                                message={errors.islands?.[index]?.name?.message}
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              disabled={isLoading}
                              onClick={() => remove(index)}
                              className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>

                          <Input
                            id={`islands.${index}.name`}
                            {...register(`islands.${index}.name`)}
                            disabled={isLoading}
                            className="equipes-modal-input-wrap"
                          />

                          <input
                            type="hidden"
                            {...register(`islands.${index}.id`)}
                          />

                          <input
                            type="hidden"
                            value="true"
                            {...register(`islands.${index}.is_active`)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 shrink-0 border-t border-[var(--equipes-border)] pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="equipes-modal-btn-salvar w-full sm:w-auto"
            >
              {isLoading ? <Spinner /> : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
