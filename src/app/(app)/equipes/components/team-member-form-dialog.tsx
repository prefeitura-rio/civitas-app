'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTeams } from '@/hooks/useContexts/use-teams-context'
import { listIslands } from '@/http/islands/list-islands'
import { createTeamMember } from '@/http/teams/create-team-member'
import { updateTeamMember } from '@/http/teams/update-team-member'
import { getUserRolesById } from '@/http/user-roles/get-user-roles-by-id'
import { getUsersOnlyWithRoles } from '@/http/user-roles/get-users-only-with-roles'
import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'
import { queryClient } from '@/lib/react-query'
import { getApiErrorMessage } from '@/utils/error-handlers'

const roleEnumValues = [
  'Coordenador',
  'Administrativo',
  'Adjunto',
  'Líder de Ilha',
  'Operador',
] as const satisfies readonly UserRoleEnum[]

const memberFormSchema = z
  .object({
    user_id: z.string().min(1, 'Usuário obrigatório'),
    team_id: z.string().min(1, 'Equipe obrigatória'),
    role: z.string().min(1, 'Função obrigatória').pipe(z.enum(roleEnumValues)),
    island_id: z.string().nullable().optional(),
    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const needsIsland = data.role === 'Adjunto' || data.role === 'Operador'

    if (needsIsland && !data.island_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['island_id'],
        message: 'Ilha obrigatória para Adjunto ou Operador',
      })
    }
  })

type MemberForm = z.infer<typeof memberFormSchema>

const roleLabelMap: Record<UserRoleEnum, string> = {
  Coordenador: 'Coordenador',
  Administrativo: 'Administrativo',
  Adjunto: 'Adjunto',
  'Líder de Ilha': 'Líder de Ilha',
  Operador: 'Operador',
}

interface TeamMemberFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function TeamMemberFormDialog({
  isOpen,
  onClose,
  onOpen,
}: TeamMemberFormDialogProps) {
  const { memberDialogInitialData, setMemberDialogInitialData } = useTeams()

  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MemberForm>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      user_id: '',
      team_id: '',
      role: '' as unknown as MemberForm['role'],
      island_id: null,
      is_active: true,
    },
  })

  const selectedUserId = watch('user_id')
  const selectedRole = watch('role')
  const didApplyInitialDataRef = useRef(false)

  const { data: usersResponse } = useQuery({
    queryKey: ['users-with-assigned-roles'],
    queryFn: getUsersOnlyWithRoles,
    enabled: isOpen,
  })

  const { data: islandsResponse } = useQuery({
    queryKey: ['islands'],
    queryFn: () => listIslands({ isActive: true }),
    enabled: isOpen,
  })

  const users = usersResponse?.data || []
  const islands = islandsResponse?.data?.items ?? []

  const { data: selectedUserRolesResponse } = useQuery({
    queryKey: ['user-roles-by-id', selectedUserId],
    queryFn: () => getUserRolesById(selectedUserId),
    enabled: isOpen && Boolean(selectedUserId),
  })

  const availableRoles = useMemo(() => {
    return selectedUserRolesResponse?.data.roles || []
  }, [selectedUserRolesResponse])

  const shouldShowIsland =
    selectedRole === 'Adjunto' || selectedRole === 'Operador'

  const { mutateAsync: createTeamMemberMutation, isPending: isPendingCreate } =
    useMutation({
      mutationFn: createTeamMember,
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
        toast.success(
          `Colaborador ${data.user_name || 'selecionado'} adicionado com sucesso.`,
        )
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
      },
    })

  const { mutateAsync: updateTeamMemberMutation, isPending: isPendingUpdate } =
    useMutation({
      mutationFn: updateTeamMember,
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
        toast.success(
          `Colaborador ${data.user_name || 'selecionado'} atualizado com sucesso.`,
        )
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
    setMemberDialogInitialData(null)
  }

  async function onSubmit(data: MemberForm) {
    if (memberDialogInitialData?.id) {
      await updateTeamMemberMutation({
        memberId: memberDialogInitialData.id,
        island_id: shouldShowIsland ? (data.island_id ?? null) : null,
        role: data.role,
        is_active: data.is_active,
      })
    } else {
      await createTeamMemberMutation({
        user_id: data.user_id,
        team_id: data.team_id,
        island_id: shouldShowIsland ? (data.island_id ?? null) : null,
        role: data.role,
        is_active: data.is_active,
      })
    }

    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (!isOpen) {
      didApplyInitialDataRef.current = false
      return
    }

    if (didApplyInitialDataRef.current) return
    didApplyInitialDataRef.current = true

    if (memberDialogInitialData?.id) {
      const initialRole = memberDialogInitialData.role as
        | UserRoleEnum
        | undefined
      const needsIsland =
        initialRole === 'Adjunto' || initialRole === 'Operador'
      reset({
        user_id: memberDialogInitialData.user_id || '',
        team_id: memberDialogInitialData.team_id,
        role: initialRole ?? ('' as unknown as MemberForm['role']),
        island_id: needsIsland
          ? (memberDialogInitialData.island_id ?? null)
          : null,
        is_active: memberDialogInitialData.is_active ?? true,
      })
      return
    }

    if (memberDialogInitialData) {
      reset({
        user_id: '',
        team_id: memberDialogInitialData.team_id,
        role: '' as unknown as MemberForm['role'],
        island_id: null,
        is_active: true,
      })
    }
  }, [memberDialogInitialData, isOpen, reset])

  useEffect(() => {
    if (!selectedUserId || memberDialogInitialData?.id) return

    setValue('role', '' as unknown as MemberForm['role'], {
      shouldDirty: true,
      shouldValidate: false,
    })
    setValue('island_id', null, { shouldDirty: true, shouldValidate: false })
  }, [selectedUserId, memberDialogInitialData?.id, setValue])

  useEffect(() => {
    if (selectedRole !== 'Adjunto' && selectedRole !== 'Operador') {
      setValue('island_id', null, { shouldDirty: true, shouldValidate: true })
    }
  }, [selectedRole, setValue])

  const isLoading = isSubmitting || isPendingCreate || isPendingUpdate

  const [userSelectOpen, setUserSelectOpen] = useState(false)
  const [roleSelectOpen, setRoleSelectOpen] = useState(false)
  const [islandSelectOpen, setIslandSelectOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="equipes-modal flex max-h-[90vh] flex-col text-[var(--equipes-text-default)] sm:max-w-2xl [&_.text-muted-foreground]:text-[var(--equipes-text-subtle)]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="equipes-modal-title">
            {memberDialogInitialData?.id
              ? 'Editar Colaborador'
              : 'Adicionar Colaborador'}
          </DialogTitle>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col gap-4">
              <div className="equipes-modal-card">
                <p className="equipes-modal-label">Equipe</p>
                <p className="text-base font-medium text-[var(--equipes-text-default)]">
                  {memberDialogInitialData?.team_name || '-'}
                </p>
              </div>

              {!memberDialogInitialData?.id && (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Label htmlFor="user_id" className="equipes-modal-label">
                      Usuário
                    </Label>
                    <InputError message={errors.user_id?.message} />
                  </div>

                  <Controller
                    control={control}
                    name="user_id"
                    render={({ field }) => (
                      <Popover
                        open={userSelectOpen}
                        onOpenChange={setUserSelectOpen}
                      >
                        <PopoverTrigger asChild>
                          <button
                            id="user_id"
                            type="button"
                            disabled={isLoading}
                            className="equipes-select-trigger-wrap equipes-select-trigger"
                          >
                            <span
                              className={
                                !field.value
                                  ? 'equipes-select-trigger-placeholder'
                                  : ''
                              }
                            >
                              {field.value
                                ? users.find((u) => u.id === field.value)
                                    ?.full_name ||
                                  users.find((u) => u.id === field.value)
                                    ?.username ||
                                  'Selecione um usuário'
                                : 'Selecione um usuário'}
                            </span>
                            <ChevronDown
                              className="equipes-select-chevron"
                              size={16}
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          sideOffset={8}
                          className="equipes-select-dropdown w-[var(--radix-popover-trigger-width)] !rounded-[10px] !border !border-[rgba(77,109,137,0.55)] !bg-[#0d1c28] p-0 !shadow-[0_20px_40px_rgba(0,0,0,0.28)]"
                        >
                          {users.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              className="equipes-select-option w-full"
                              onClick={() => {
                                field.onChange(user.id)
                                setUserSelectOpen(false)
                              }}
                            >
                              {user.full_name || user.username}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
              )}

              {memberDialogInitialData?.id && (
                <div className="equipes-modal-card">
                  <p className="equipes-modal-label">Usuário</p>
                  <p className="text-base font-medium text-[var(--equipes-text-default)]">
                    {memberDialogInitialData.user_name || '-'}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Label htmlFor="role" className="equipes-modal-label">
                    Função
                  </Label>
                  <InputError message={errors.role?.message} />
                </div>

                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => {
                    const roleOptions = memberDialogInitialData?.id
                      ? availableRoles.length > 0
                        ? availableRoles
                        : field.value
                          ? [field.value as UserRoleEnum]
                          : []
                      : availableRoles
                    const placeholder =
                      !memberDialogInitialData?.id && !selectedUserId
                        ? 'Selecione um usuário primeiro'
                        : 'Selecione a função'
                    return (
                      <Popover
                        open={roleSelectOpen}
                        onOpenChange={setRoleSelectOpen}
                      >
                        <PopoverTrigger asChild>
                          <button
                            id="role"
                            type="button"
                            disabled={
                              isLoading ||
                              (!memberDialogInitialData?.id &&
                                availableRoles.length === 0)
                            }
                            className="equipes-select-trigger-wrap equipes-select-trigger"
                          >
                            <span
                              className={
                                !field.value
                                  ? 'equipes-select-trigger-placeholder'
                                  : ''
                              }
                            >
                              {field.value
                                ? roleLabelMap[field.value]
                                : placeholder}
                            </span>
                            <ChevronDown
                              className="equipes-select-chevron"
                              size={16}
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          sideOffset={8}
                          className="equipes-select-dropdown w-[var(--radix-popover-trigger-width)] !rounded-[10px] !border !border-[rgba(77,109,137,0.55)] !bg-[#0d1c28] p-0 !shadow-[0_20px_40px_rgba(0,0,0,0.28)]"
                        >
                          {roleOptions.map((role) => (
                            <button
                              key={role}
                              type="button"
                              className="equipes-select-option w-full"
                              onClick={() => {
                                const value = role as MemberForm['role']
                                setValue('role', value, {
                                  shouldValidate: true,
                                })
                                setRoleSelectOpen(false)
                              }}
                            >
                              {roleLabelMap[role]}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    )
                  }}
                />

                {!memberDialogInitialData?.id &&
                  selectedUserId &&
                  availableRoles.length === 0 && (
                    <p className="equipes-modal-label text-sm">
                      Nenhuma função disponível para este usuário.
                    </p>
                  )}
              </div>

              {shouldShowIsland && (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Label htmlFor="island_id" className="equipes-modal-label">
                      Ilha
                    </Label>
                    <InputError message={errors.island_id?.message} />
                  </div>

                  <Controller
                    control={control}
                    name="island_id"
                    render={({ field }) => (
                      <Popover
                        open={islandSelectOpen}
                        onOpenChange={setIslandSelectOpen}
                      >
                        <PopoverTrigger asChild>
                          <button
                            id="island_id"
                            type="button"
                            disabled={isLoading}
                            className="equipes-select-trigger-wrap equipes-select-trigger"
                          >
                            <span
                              className={
                                !field.value
                                  ? 'equipes-select-trigger-placeholder'
                                  : ''
                              }
                            >
                              {field.value
                                ? (islands.find((i) => i.id === field.value)
                                    ?.name ?? 'Selecione a ilha')
                                : 'Selecione a ilha'}
                            </span>
                            <ChevronDown
                              className="equipes-select-chevron"
                              size={16}
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          sideOffset={8}
                          className="equipes-select-dropdown w-[var(--radix-popover-trigger-width)] !rounded-[10px] !border !border-[rgba(77,109,137,0.55)] !bg-[#0d1c28] p-0 !shadow-[0_20px_40px_rgba(0,0,0,0.28)]"
                        >
                          {islands.map((island) => (
                            <button
                              key={island.id}
                              type="button"
                              className="equipes-select-option w-full"
                              onClick={() => {
                                field.onChange(island.id)
                                setIslandSelectOpen(false)
                              }}
                            >
                              {island.name}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
              )}
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
