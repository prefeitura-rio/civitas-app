'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { MultiSelectWithSearch } from '@/components/custom/multi-select-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'
import {
  getTicketModulePermissionsByRole,
  type GetTicketModulePermissionsByRoleResponse,
  type TicketModuleRolePermissionItem,
  updateTicketModulePermissionsByRole,
} from '@/http/tickets/ticket-module-permissions-role'
import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'
import { getApiErrorMessage } from '@/utils/error-handlers'

import tcFormStyles from '../criar/ticket-create/ticket-create-form.module.css'
import styles from './permissoes-por-role.module.css'

const SCREEN_PERMISSIONS_SCREEN_CODE = 'screen_permissions'

const ROLE_OPTIONS: UserRoleEnum[] = [
  'Coordenador',
  'Administrativo',
  'Adjunto',
  'Líder de Ilha',
  'Operador',
  'Assessor',
]

interface ScreenPermissionRow extends TicketModuleRolePermissionItem {
  available_actions: GetTicketModulePermissionsByRoleResponse['screens_catalog'][number]['actions']
}

function TicketModulePermissionsByRolePageContent() {
  const queryClient = useQueryClient()
  const [role, setRole] = useState<UserRoleEnum>('Coordenador')
  const [permissions, setPermissions] = useState<ScreenPermissionRow[]>([])

  const {
    data,
    error,
    isError,
    isLoading,
    isFetching,
    refetch: refetchPermissions,
  } = useQuery({
    queryKey: ['ticket-module-permissions-role', role],
    queryFn: () => getTicketModulePermissionsByRole(role),
  })

  useEffect(() => {
    if (!data) return

    const permissionsByCode = new Map(
      data.permissions.map((permission) => [
        permission.screen_code,
        permission,
      ]),
    )

    const normalized = data.screens_catalog.map((screen) => {
      const existing = permissionsByCode.get(screen.screen_code)
      const allowedActionCodes = screen.actions.map((action) => action.code)
      const selectedActions = (existing?.allowed_action_codes ?? []).filter(
        (code) => allowedActionCodes.includes(code),
      )
      const canView = existing?.can_view ?? false

      return {
        screen_code: screen.screen_code,
        screen_label: screen.screen_label,
        can_view: canView,
        allowed_action_codes: canView ? selectedActions : [],
        available_actions: screen.actions,
      }
    })

    setPermissions(normalized)
  }, [data])

  useEffect(() => {
    if (!isError) return
    toast.error(getApiErrorMessage(error))
  }, [error, isError])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateTicketModulePermissionsByRole(role, {
        permissions: permissions.map((permission) => ({
          screen_code: permission.screen_code,
          can_view: permission.can_view,
          allowed_action_codes: permission.can_view
            ? permission.allowed_action_codes
            : [],
        })),
      }),
    onSuccess: async () => {
      toast.success('Permissões por role salvas com sucesso.')
      await queryClient.invalidateQueries({
        queryKey: ['ticket-module-permissions-role', role],
      })
    },
    onError: (mutationError) => {
      toast.error(getApiErrorMessage(mutationError))
    },
  })

  const canSave = useMemo(
    () =>
      permissions.length > 0 &&
      !isLoading &&
      !isFetching &&
      !saveMutation.isPending,
    [isFetching, isLoading, permissions.length, saveMutation.isPending],
  )

  function updatePermission(index: number, next: ScreenPermissionRow) {
    setPermissions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? next : item)),
    )
  }

  function handleReload() {
    refetchPermissions()
  }

  return (
    <div className={`${styles.page} page-content flex flex-col px-6 py-6`}>
      <div className={`${tcFormStyles.root} content ${styles.content}`}>
        <header className="flex flex-col gap-2">
          <h1 className={styles.title}>Permissões de Tela por Role</h1>
          <p className={styles.subtitle}>
            Configure visualização e ações permitidas para cada tela.
          </p>
        </header>

        <section className={styles.card}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full max-w-xs space-y-1.5">
              <Label className={tcFormStyles.fieldLabel}>Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRoleEnum)}
                disabled={isLoading || saveMutation.isPending}
              >
                <SelectTrigger
                  className={`h-11 w-full ${tcFormStyles.inputBg}`}
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className={tcFormStyles.selectContentForm}>
                  {ROLE_OPTIONS.map((roleOption) => (
                    <SelectItem
                      key={roleOption}
                      value={roleOption}
                      className={tcFormStyles.selectItemForm}
                    >
                      {roleOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary} flex items-center gap-2`}
                onClick={handleReload}
                disabled={isFetching || saveMutation.isPending}
              >
                <RefreshCw className="size-4" />
                Recarregar
              </button>
              <button
                type="button"
                className={`${styles.button} flex items-center gap-2`}
                onClick={() => saveMutation.mutate()}
                disabled={!canSave}
              >
                {saveMutation.isPending ? <Spinner /> : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Permissões por tela</h2>

          {isLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tela</th>
                  <th>Can view</th>
                  <th>Ações permitidas</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission, index) => {
                  const actionsOptions = permission.available_actions.map(
                    (action) => ({
                      value: action.code,
                      label: action.label,
                    }),
                  )

                  return (
                    <tr key={permission.screen_code}>
                      <td>{permission.screen_label}</td>
                      <td>
                        <Switch
                          checked={permission.can_view}
                          onCheckedChange={(checked) =>
                            updatePermission(index, {
                              ...permission,
                              can_view: checked,
                              allowed_action_codes: checked
                                ? permission.allowed_action_codes
                                : [],
                            })
                          }
                          disabled={saveMutation.isPending}
                        />
                      </td>
                      <td className="min-w-[320px]">
                        <MultiSelectWithSearch
                          options={actionsOptions}
                          onValueChange={(values) =>
                            updatePermission(index, {
                              ...permission,
                              allowed_action_codes: values,
                            })
                          }
                          defaultValue={permission.allowed_action_codes}
                          placeholder={
                            permission.can_view
                              ? 'Selecione ações'
                              : 'Habilite can view para escolher ações'
                          }
                          className="min-h-9 bg-transparent text-white"
                          disabled={
                            !permission.can_view || saveMutation.isPending
                          }
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}

export default function TicketModulePermissionsByRolePage() {
  const { allowed, resolved } = useTicketScreenPermissionGate(
    SCREEN_PERMISSIONS_SCREEN_CODE,
  )

  if (!resolved || !allowed) {
    return (
      <div
        className={`${styles.page} flex min-h-screen flex-col items-center justify-center px-6 py-6`}
      >
        <Spinner />
      </div>
    )
  }

  return <TicketModulePermissionsByRolePageContent />
}
