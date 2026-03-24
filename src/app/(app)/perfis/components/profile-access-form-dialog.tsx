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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useProfileAccess } from '@/hooks/useContexts/use-profile-access-context'
import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'
import { updateUserRoles } from '@/http/user-roles/update-user-roles'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

import styles from '../perfis.module.css'

const roleOptions = [
  { value: 'Coordenador', label: 'Coordenador' },
  { value: 'Administrativo', label: 'Administrativo' },
  { value: 'Adjunto', label: 'Adjunto' },
  { value: 'Líder de Ilha', label: 'Líder de Ilha' },
  { value: 'Operador', label: 'Operador' },
] as const satisfies { value: UserRoleEnum; label: string }[]

const profileAccessFormSchema = z.object({
  roles: z
    .array(
      z.enum([
        'Coordenador',
        'Administrativo',
        'Adjunto',
        'Líder de Ilha',
        'Operador',
      ]),
    )
    .default([]),
})

type ProfileAccessForm = z.infer<typeof profileAccessFormSchema>

interface ProfileAccessFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function ProfileAccessFormDialog({
  isOpen,
  onClose,
  onOpen,
}: ProfileAccessFormDialogProps) {
  const { dialogInitialData, setDialogInitialData } = useProfileAccess()

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileAccessForm>({
    resolver: zodResolver(profileAccessFormSchema),
    defaultValues: {
      roles: [],
    },
  })

  const selectedRoles = watch('roles')

  const { mutateAsync: updateUserRolesMutation, isPending } = useMutation({
    mutationFn: updateUserRoles,
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ['users-with-roles'],
      })

      toast.success(
        `Perfis de ${data.full_name || data.username} atualizados com sucesso.`,
      )
    },
    onError: () => {
      toast.error(genericErrorMessage)
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
    const currentRoles = selectedRoles || []

    if (checked) {
      if (!currentRoles.includes(role)) {
        setValue('roles', [...currentRoles, role], {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
      return
    }

    setValue(
      'roles',
      currentRoles.filter((item) => item !== role),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    )
  }

  async function onSubmit(data: ProfileAccessForm) {
    if (!dialogInitialData?.id) return

    await updateUserRolesMutation({
      userId: dialogInitialData.id,
      roles: data.roles,
    })

    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (dialogInitialData && isOpen) {
      reset({
        roles: dialogInitialData.roles || [],
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
              <Label className={styles.perfisModalLabel}>
                Perfis de acesso
              </Label>
              <InputError message={errors.roles?.message} />
            </div>

            <div
              className={`${styles.perfisModalSection} grid grid-cols-1 gap-3 sm:grid-cols-2`}
            >
              {roleOptions.map((role) => {
                const checked = selectedRoles?.includes(role.value)

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
                      disabled={isLoading}
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
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
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
