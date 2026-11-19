'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { InputError } from '@/components/custom/input-error'
import { Spinner } from '@/components/custom/spinner'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { config } from '@/config'
import { useOwnUserRole } from '@/hooks/useQueries/useOwnUserRole'
import { useProfile } from '@/hooks/useQueries/useProfile'
import type {
  UserRoleEnum,
  UserRoleListItem,
} from '@/http/user-roles/get-users-with-roles'
import { updateUserRoles } from '@/http/user-roles/update-user-roles'
import { queryClient } from '@/lib/react-query'
import { getApiErrorMessage } from '@/utils/error-handlers'

import styles from '../perfis.module.css'

const roleOptions = [
  { value: 'Coordenador', label: 'Coordenador' },
  { value: 'Administrativo', label: 'Administrativo' },
  { value: 'Analista', label: 'Analista' },
  { value: 'Adjunto', label: 'Adjunto' },
  { value: 'Auxiliar de Adjunto', label: 'Auxiliar de Adjunto' },
  { value: 'Assessor', label: 'Assessor' },
  { value: 'Líder de Ilha', label: 'Líder de Ilha' },
  { value: 'Agente', label: 'Agente' },
  { value: 'Desenvolvedor', label: 'Desenvolvedor' },
] as const satisfies { value: UserRoleEnum; label: string }[]

const DEVELOPER_ROLE: UserRoleEnum = 'Desenvolvedor'

/** Quem pode desativar/reativar: Coordenador (Desenvolvedor vale como Coordenador, como no backend). */
const ACTIVATION_MANAGER_ROLES: UserRoleEnum[] = ['Coordenador', DEVELOPER_ROLE]

const profileAccessFormSchema = z.object({
  role: z
    .enum([
      'Coordenador',
      'Administrativo',
      'Analista',
      'Adjunto',
      'Auxiliar de Adjunto',
      'Assessor',
      'Líder de Ilha',
      'Agente',
      'Desenvolvedor',
    ])
    .optional(),
})

type ProfileAccessForm = z.infer<typeof profileAccessFormSchema>

interface ProfileAccessFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  dialogInitialData: UserRoleListItem | null
  setDialogInitialData: (value: UserRoleListItem | null) => void
  /** Abre o fluxo de desativar/reativar para o usuário em edição. */
  onRequestActivationChange: (user: UserRoleListItem) => void
}

export function ProfileAccessFormDialog({
  isOpen,
  onClose,
  onOpen,
  dialogInitialData,
  setDialogInitialData,
  onRequestActivationChange,
}: ProfileAccessFormDialogProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileAccessForm>({
    resolver: zodResolver(profileAccessFormSchema),
    defaultValues: {
      role: undefined,
    },
  })

  const selectedRole = watch('role')

  // Desenvolvedor só existe onde o civitas-api liga o perfil (staging), e só um Desenvolvedor o concede ou retira
  // (a API confere o mesmo com o usuário real, não o personificado).
  const { data: ownRole } = useOwnUserRole()
  const canManageDeveloper =
    config.enableDeveloperRole && ownRole === DEVELOPER_ROLE
  const targetIsDeveloper = dialogInitialData?.role === DEVELOPER_ROLE
  const lockedByDeveloperRole = targetIsDeveloper && !canManageDeveloper

  const { data: profile } = useProfile()
  const targetIsInactive = dialogInitialData?.is_active === false
  // Como no civitas-api: só um Desenvolvedor desativa outro (reativar não tem essa regra).
  const canManageActivation =
    Boolean(ownRole && ACTIVATION_MANAGER_ROLES.includes(ownRole)) &&
    Boolean(dialogInitialData) &&
    dialogInitialData?.id !== profile?.id &&
    (targetIsInactive || !lockedByDeveloperRole)
  const roleLocked = lockedByDeveloperRole || targetIsInactive
  const availableRoleOptions = roleOptions.filter(
    (option) =>
      option.value !== DEVELOPER_ROLE ||
      canManageDeveloper ||
      targetIsDeveloper,
  )

  const { mutateAsync: updateUserRolesMutation, isPending } = useMutation({
    mutationFn: updateUserRoles,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users-with-roles'],
      })
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
    setDialogInitialData(null)
  }

  function handleToggleRole(role: UserRoleEnum, checked: boolean) {
    setValue('role', checked ? role : undefined, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  async function onSubmit(data: ProfileAccessForm) {
    if (!dialogInitialData?.id) return

    const userDisplayName =
      dialogInitialData.full_name || dialogInitialData.username

    await updateUserRolesMutation({
      userId: dialogInitialData.id,
      role: data.role,
    })

    toast.success(`Perfil de ${userDisplayName} atualizado com sucesso.`)

    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (dialogInitialData && isOpen) {
      reset({
        role: dialogInitialData.role || undefined,
      })
    }
  }, [dialogInitialData, isOpen, reset])

  const isLoading = isSubmitting || isPending

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className={`${styles.perfisModalContent} sm:max-w-lg`}>
        <DialogHeader>
          <DialogTitle className={styles.perfisModalTitle}>
            Editar Perfil de Acesso
          </DialogTitle>
          <DialogDescription className="sr-only">
            Altere o perfil de acesso ou a situação do usuário.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className={`${styles.perfisModalSection} space-y-1`}>
            <p
              className="text-sm"
              style={{ color: 'var(--perfis-text-subtle)' }}
            >
              <span
                className="font-medium"
                style={{ color: 'var(--perfis-text-default)' }}
              >
                Usuário:
              </span>{' '}
              {dialogInitialData?.full_name || dialogInitialData?.username}
            </p>

            {dialogInitialData?.email && (
              <p
                className="text-sm"
                style={{ color: 'var(--perfis-text-subtle)' }}
              >
                {dialogInitialData.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Label
                id="profile-access-roles-label"
                className={styles.perfisModalLabel}
              >
                Perfil de acesso
              </Label>
              <InputError message={errors.role?.message} />
            </div>

            <div
              role="group"
              aria-labelledby="profile-access-roles-label"
              aria-disabled={roleLocked || undefined}
              className={`${styles.perfisModalSection} grid grid-cols-1 gap-3 sm:grid-cols-2 ${
                roleLocked ? styles.perfisModalSectionDisabled : ''
              }`}
            >
              {availableRoleOptions.map((role) => {
                const checked = selectedRole === role.value

                return (
                  <label
                    key={role.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition hover:opacity-90"
                    style={{
                      border: '1px solid var(--perfis-border)',
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        handleToggleRole(role.value, Boolean(value))
                      }
                      disabled={isLoading || roleLocked}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--perfis-text-default)' }}
                    >
                      {role.label}
                    </span>
                  </label>
                )
              })}
            </div>
            {targetIsInactive ? (
              <p className={styles.perfisModalNotice}>
                Usuário inativo. Reative para alterar o perfil.
              </p>
            ) : null}
            {lockedByDeveloperRole ? (
              <p
                className="text-sm"
                style={{ color: 'var(--perfis-text-default)' }}
              >
                Só um Desenvolvedor pode alterar o perfil de quem é
                Desenvolvedor.
              </p>
            ) : null}
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            {canManageActivation && dialogInitialData ? (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onRequestActivationChange(dialogInitialData)}
                className={
                  targetIsInactive
                    ? styles.perfisModalBtnPrimary
                    : styles.perfisModalBtnDanger
                }
              >
                {targetIsInactive ? 'Reativar usuário' : 'Desativar usuário'}
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={isLoading || roleLocked}
              className={`${styles.perfisModalBtnPrimary} flex min-w-[7rem] items-center justify-center gap-2 px-4 py-2`}
            >
              {isLoading ? <Spinner /> : <span>Salvar</span>}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
