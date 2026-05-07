'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { MultiSelectWithSearch } from '@/components/custom/multi-select-with-search'
import { Spinner } from '@/components/custom/spinner'
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
import { Switch } from '@/components/ui/switch'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'
import {
  getWorkflowRoleConfig,
  updateWorkflowRoleConfig,
  type UpdateWorkflowRoleConfigRequest,
  type WorkflowPermission,
  type WorkflowRoleEnum,
  type WorkflowTransition,
} from '@/http/workflow/workflow-role-config'
import { getApiErrorMessage } from '@/utils/error-handlers'

import styles from './workflow-roles.module.css'

const WORKFLOW_SCREEN_CODE = 'workflow'

const ROLE_OPTIONS: WorkflowRoleEnum[] = [
  'Coordenador',
  'Administrativo',
  'Adjunto',
  'Líder de Ilha',
  'Operador',
  'Assessor',
]

function createTransition(): WorkflowTransition {
  return {
    from_state_code: '',
    action_code: '',
    to_state_code: '',
    target_profile_codes: [],
  }
}

function WorkflowRolesPageContent() {
  const [role, setRole] = useState<WorkflowRoleEnum>('Coordenador')
  const [permissions, setPermissions] = useState<WorkflowPermission[]>([])
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  const {
    data,
    error,
    isError,
    isLoading,
    isFetching,
    refetch: refetchConfig,
  } = useQuery({
    queryKey: ['workflow-role-config', role],
    queryFn: () => getWorkflowRoleConfig(role),
  })

  useEffect(() => {
    if (!data) return
    const normalizedPermissions = data.states.map((state) => {
      const existing = data.permissions.find(
        (permission) => permission.state_code === state.code,
      )
      return {
        state_code: state.code,
        can_view: existing?.can_view ?? false,
        allowed_action_codes: existing?.allowed_action_codes ?? [],
      }
    })

    setPermissions(normalizedPermissions)
    setTransitions(data.transitions ?? [])
  }, [data])

  useEffect(() => {
    if (!isError) return
    toast.error(getApiErrorMessage(error))
  }, [error, isError])

  const saveMutation = useMutation({
    mutationFn: (payload: UpdateWorkflowRoleConfigRequest) =>
      updateWorkflowRoleConfig(payload),
    onSuccess: () => {
      toast.success('Configuração de workflow salva com sucesso.')
      refetchConfig()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const actionOptions = useMemo(
    () =>
      (data?.actions ?? []).map((action) => ({
        value: action.code,
        label: action.label ?? action.code,
      })),
    [data?.actions],
  )
  const profileOptions = useMemo(
    () =>
      (data?.profiles ?? []).map((profile) => ({
        value: profile.code,
        label: profile.label ?? profile.code,
      })),
    [data?.profiles],
  )

  function updatePermission(index: number, next: WorkflowPermission) {
    setPermissions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? next : item)),
    )
  }

  function updateTransition(index: number, next: WorkflowTransition) {
    setTransitions((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? next : item)),
    )
  }

  function removeTransition(index: number) {
    setTransitions((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  const validationMessage = useMemo(() => {
    for (const transition of transitions) {
      if (
        !transition.from_state_code ||
        !transition.action_code ||
        !transition.to_state_code
      ) {
        return 'Preencha from_state, action e to_state em todas as transições.'
      }
      if (transition.target_profile_codes.length === 0) {
        return 'Selecione ao menos um perfil de destino em cada transição.'
      }
    }

    const duplicates = new Set<string>()
    for (const transition of transitions) {
      const duplicateKey = `${transition.from_state_code}::${transition.action_code}`
      if (duplicates.has(duplicateKey)) {
        return 'Existe duplicidade de transição para a mesma combinação from_state + action.'
      }
      duplicates.add(duplicateKey)
    }

    return null
  }, [transitions])

  async function handleSave() {
    if (validationMessage) {
      toast.error(validationMessage)
      return
    }

    await saveMutation.mutateAsync({
      role,
      permissions,
      transitions,
    })
    setConfirmOpen(false)
  }

  function handleReload() {
    refetchConfig()
  }

  return (
    <div className={`${styles.page} page-content flex flex-col px-6 py-6`}>
      <div className={`content ${styles.content}`}>
        <header className="flex flex-col gap-2">
          <h1 className={styles.title}>Configuração de Workflow por Role</h1>
          <p className={styles.subtitle}>
            Defina permissões por estado e transições permitidas para o role
            selecionado.
          </p>
        </header>

        <section className={styles.card}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full max-w-xs">
              <label className="mb-2 block text-xs uppercase text-[var(--workflow-text-subtle)]">
                Role
              </label>
              <select
                className={styles.select}
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as WorkflowRoleEnum)
                }
                disabled={isLoading || saveMutation.isPending}
              >
                {ROLE_OPTIONS.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
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
                onClick={() => setConfirmOpen(true)}
                disabled={isLoading || saveMutation.isPending}
              >
                {saveMutation.isPending ? <Spinner /> : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Permissões por estado</h2>

          {isLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Can view</th>
                  <th>Ações permitidas</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission, index) => (
                  <tr key={permission.state_code}>
                    <td>{permission.state_code}</td>
                    <td>
                      <Switch
                        checked={permission.can_view}
                        onCheckedChange={(checked) =>
                          updatePermission(index, {
                            ...permission,
                            can_view: checked,
                          })
                        }
                        disabled={saveMutation.isPending}
                      />
                    </td>
                    <td className="min-w-[320px]">
                      <MultiSelectWithSearch
                        options={actionOptions}
                        onValueChange={(values) =>
                          updatePermission(index, {
                            ...permission,
                            allowed_action_codes: values,
                          })
                        }
                        defaultValue={permission.allowed_action_codes}
                        placeholder="Selecione ações"
                        className="min-h-9 bg-transparent text-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={styles.card}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className={styles.sectionTitle}>Transições</h2>
            <button
              type="button"
              className={`${styles.button} flex items-center gap-2`}
              onClick={() =>
                setTransitions((current) => [...current, createTransition()])
              }
              disabled={saveMutation.isPending}
            >
              <Plus className="size-4" />
              Adicionar transição
            </button>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>From</th>
                <th>Action</th>
                <th>To</th>
                <th>Perfis destino</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transitions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-[var(--workflow-text-subtle)]"
                  >
                    Nenhuma transição cadastrada.
                  </td>
                </tr>
              )}

              {transitions.map((transition, index) => (
                <tr
                  key={`${transition.from_state_code}-${transition.action_code}-${index}`}
                >
                  <td className="min-w-[170px]">
                    <select
                      className={styles.select}
                      value={transition.from_state_code}
                      onChange={(event) =>
                        updateTransition(index, {
                          ...transition,
                          from_state_code: event.target.value,
                        })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <option value="">Selecione</option>
                      {(data?.states ?? []).map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.label ?? state.code}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="min-w-[170px]">
                    <select
                      className={styles.select}
                      value={transition.action_code}
                      onChange={(event) =>
                        updateTransition(index, {
                          ...transition,
                          action_code: event.target.value,
                        })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <option value="">Selecione</option>
                      {(data?.actions ?? []).map((action) => (
                        <option key={action.code} value={action.code}>
                          {action.label ?? action.code}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="min-w-[170px]">
                    <select
                      className={styles.select}
                      value={transition.to_state_code}
                      onChange={(event) =>
                        updateTransition(index, {
                          ...transition,
                          to_state_code: event.target.value,
                        })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <option value="">Selecione</option>
                      {(data?.states ?? []).map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.label ?? state.code}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="min-w-[320px]">
                    <MultiSelectWithSearch
                      options={profileOptions}
                      onValueChange={(values) =>
                        updateTransition(index, {
                          ...transition,
                          target_profile_codes: values,
                        })
                      }
                      defaultValue={transition.target_profile_codes}
                      placeholder="Selecione perfis"
                      className="min-h-9 bg-transparent text-white"
                    />
                  </td>

                  <td>
                    <button
                      type="button"
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      onClick={() => removeTransition(index)}
                      disabled={saveMutation.isPending}
                      aria-label="Remover transição"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {validationMessage && (
            <p className={`mt-3 ${styles.errorText}`}>{validationMessage}</p>
          )}
        </section>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              As regras de workflow do role {role} serão atualizadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function WorkflowRolesPage() {
  const { allowed, resolved } =
    useTicketScreenPermissionGate(WORKFLOW_SCREEN_CODE)

  if (!resolved || !allowed) {
    return (
      <div
        className={`${styles.page} flex min-h-screen flex-col items-center justify-center px-6 py-6`}
      >
        <Spinner />
      </div>
    )
  }

  return <WorkflowRolesPageContent />
}
