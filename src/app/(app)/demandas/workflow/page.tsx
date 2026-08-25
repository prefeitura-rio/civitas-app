'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { MultiSelectWithSearch } from '@/components/custom/multi-select-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'
import { getTicketTypes } from '@/http/ticket-types/get-ticket.types'
import { resetWorkflowToDefaults } from '@/http/workflow/reset-workflow-to-defaults'
import {
  getWorkflowRoleConfig,
  updateWorkflowRoleConfig,
  type UpdateWorkflowRoleConfigRequest,
  type WorkflowCatalogItem,
  type WorkflowPermission,
  type WorkflowRoleEnum,
  type WorkflowTransition,
} from '@/http/workflow/workflow-role-config'
import { getApiErrorMessage } from '@/utils/error-handlers'

import tdStyles from '../[ticketId]/ticket-detail.module.css'
import tcFormStyles from '../criar/ticket-create/ticket-create-form.module.css'
import styles from './workflow-roles.module.css'

const WORKFLOW_SCREEN_CODE = 'workflow'

const ROLE_OPTIONS: WorkflowRoleEnum[] = [
  'Coordenador',
  'Administrativo',
  'Adjunto',
  'Auxiliar de Adjunto',
  'Líder de Ilha',
  'Agente',
  'Assessor',
]

/** Perfis destino garantidos no seletor além do catálogo da API. */
const WORKFLOW_TARGET_PROFILE_FALLBACKS: WorkflowCatalogItem[] = [
  { code: 'EXECUTOR_DA_ACAO', label: 'Executor da ação' },
  { code: 'MANTER_ATUAL', label: 'Manter Atual' },
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
  const [ticketTypeId, setTicketTypeId] = useState<string | null>(null)
  const [role, setRole] = useState<WorkflowRoleEnum>('Coordenador')
  const [permissions, setPermissions] = useState<WorkflowPermission[]>([])
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  const ticketTypesQuery = useQuery({
    queryKey: ['ticket-types', 'select', 'workflow'],
    queryFn: () => getTicketTypes({ isActive: true }),
  })

  const ticketTypes = ticketTypesQuery.data?.data ?? []

  useEffect(() => {
    if (ticketTypes.length === 0) return
    setTicketTypeId((current) => {
      if (current && ticketTypes.some((t) => t.id === current)) {
        return current
      }
      return ticketTypes[0]?.id ?? null
    })
  }, [ticketTypes])

  const {
    data,
    error,
    isError,
    isLoading,
    refetch: refetchConfig,
  } = useQuery({
    queryKey: ['workflow-role-config', ticketTypeId, role],
    queryFn: () => getWorkflowRoleConfig(ticketTypeId!, role),
    enabled: Boolean(ticketTypeId),
  })

  useEffect(() => {
    if (!data) return
    const normalizedPermissions = data.states.map((state) => {
      const existing = data.permissions.find(
        (permission) => permission.state_code === state.code,
      )
      return {
        state_code: state.code,
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

  const resetMutation = useMutation({
    mutationFn: resetWorkflowToDefaults,
    onSuccess: () => {
      toast.success(
        'Configurações de workflow restauradas ao padrão de fábrica.',
      )
      setResetConfirmOpen(false)
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
  const profileOptions = useMemo(() => {
    const fromApi = (data?.profiles ?? []).map((profile) => ({
      value: profile.code,
      label: profile.label ?? profile.code,
    }))
    const codes = new Set(fromApi.map((option) => option.value))
    const fallbacks = WORKFLOW_TARGET_PROFILE_FALLBACKS.filter(
      (profile) => !codes.has(profile.code),
    ).map((profile) => ({
      value: profile.code,
      label: profile.label ?? profile.code,
    }))
    return [...fromApi, ...fallbacks]
  }, [data?.profiles])

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

    if (!ticketTypeId) {
      toast.error('Selecione um tipo de demanda.')
      return
    }

    await saveMutation.mutateAsync({
      ticket_type_id: ticketTypeId,
      role,
      permissions,
      transitions,
    })
    setConfirmOpen(false)
  }

  async function handleResetToDefaults() {
    await resetMutation.mutateAsync()
  }

  const isBusy = saveMutation.isPending || resetMutation.isPending

  return (
    <div
      className="page-content space-y-4 overflow-y-scroll pb-24"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="content">
        <div className={tcFormStyles.root}>
          <div className="w-full space-y-8">
            <header className="w-full space-y-2">
              <h1
                className="font-semibold leading-10 text-[var(--tc-heading,#f9fafa)]"
                style={{ fontSize: '20px' }}
              >
                Configuração de Workflow por Tipo de Demanda e Role
              </h1>
              <p className="mt-0 text-[length:12px] leading-4 text-[var(--tc-muted,#97a2ab)]">
                Defina permissões por estado e transições para o tipo de demanda
                e role selecionados. A API mescla com a configuração global
                quando não houver linhas específicas daquele tipo.
              </p>
            </header>

            <div
              className={`${tcFormStyles.sectionCard} ${tcFormStyles.sectionCardFirst}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
                <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className={tcFormStyles.fieldLabel}>
                      Tipo de demanda
                    </Label>
                    <Select
                      value={ticketTypeId ?? ''}
                      onValueChange={(value) => setTicketTypeId(value || null)}
                      disabled={
                        ticketTypesQuery.isLoading ||
                        isBusy ||
                        ticketTypes.length === 0
                      }
                    >
                      <SelectTrigger
                        className={`h-11 w-full ${tcFormStyles.inputBg}`}
                      >
                        <SelectValue
                          placeholder={
                            ticketTypesQuery.isLoading
                              ? 'Carregando…'
                              : ticketTypes.length === 0
                                ? 'Nenhum tipo disponível'
                                : 'Selecione'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className={tcFormStyles.selectContentForm}>
                        {ticketTypes.map((type) => (
                          <SelectItem
                            key={type.id}
                            value={type.id}
                            className={tcFormStyles.selectItemForm}
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={tcFormStyles.fieldLabel}>Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value) =>
                        setRole(value as WorkflowRoleEnum)
                      }
                      disabled={!ticketTypeId || isLoading || isBusy}
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
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className={`${tcFormStyles.cancelButton} !min-w-0 gap-2`}
                    onClick={() => setResetConfirmOpen(true)}
                    disabled={
                      !ticketTypeId || isBusy || ticketTypesQuery.isLoading
                    }
                  >
                    <RotateCcw className="size-4" />
                    Restaurar padrão
                  </Button>
                  <Button
                    type="button"
                    className={`${tcFormStyles.saveButton} gap-2`}
                    onClick={() => setConfirmOpen(true)}
                    disabled={
                      !ticketTypeId ||
                      isLoading ||
                      isBusy ||
                      ticketTypesQuery.isLoading
                    }
                  >
                    {saveMutation.isPending ? <Spinner /> : 'Salvar alterações'}
                  </Button>
                </div>
              </div>
            </div>

            <div
              className={`${tcFormStyles.sectionCard} ${tcFormStyles.sectionCardFirst}`}
            >
              <h2 className={styles.sectionTitle}>Permissões por estado</h2>

              {ticketTypesQuery.isError && (
                <p className={`mb-3 ${styles.errorText}`}>
                  {getApiErrorMessage(ticketTypesQuery.error)}
                </p>
              )}

              {isLoading ? (
                <div className="flex h-24 items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Ações permitidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission, index) => (
                      <tr key={permission.state_code}>
                        <td>{permission.state_code}</td>
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
            </div>

            <div
              className={`${tcFormStyles.sectionCard} ${tcFormStyles.sectionCardFirst}`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className={styles.sectionTitle}>Transições</h2>
                <Button
                  type="button"
                  className={`${tcFormStyles.saveButton} gap-2`}
                  onClick={() =>
                    setTransitions((current) => [
                      ...current,
                      createTransition(),
                    ])
                  }
                  disabled={isBusy}
                >
                  <Plus className="size-4" />
                  Adicionar transição
                </Button>
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
                        className="text-center text-[var(--tc-muted,#97a2ab)]"
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
                        <Select
                          value={
                            transition.from_state_code
                              ? transition.from_state_code
                              : '__none__'
                          }
                          onValueChange={(value) =>
                            updateTransition(index, {
                              ...transition,
                              from_state_code:
                                value === '__none__' ? '' : value,
                            })
                          }
                          disabled={isBusy}
                        >
                          <SelectTrigger
                            className={`h-11 w-full ${tcFormStyles.inputBg} ${styles.transitionSelectTrigger}`}
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent
                            className={tcFormStyles.selectContentForm}
                          >
                            <SelectItem
                              value="__none__"
                              className={tcFormStyles.selectItemForm}
                            >
                              Selecione
                            </SelectItem>
                            {(data?.states ?? []).map((state) => (
                              <SelectItem
                                key={state.code}
                                value={state.code}
                                className={tcFormStyles.selectItemForm}
                              >
                                {state.label ?? state.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="min-w-[170px]">
                        <Select
                          value={
                            transition.action_code
                              ? transition.action_code
                              : '__none__'
                          }
                          onValueChange={(value) =>
                            updateTransition(index, {
                              ...transition,
                              action_code: value === '__none__' ? '' : value,
                            })
                          }
                          disabled={isBusy}
                        >
                          <SelectTrigger
                            className={`h-11 w-full ${tcFormStyles.inputBg} ${styles.transitionSelectTrigger}`}
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent
                            className={tcFormStyles.selectContentForm}
                          >
                            <SelectItem
                              value="__none__"
                              className={tcFormStyles.selectItemForm}
                            >
                              Selecione
                            </SelectItem>
                            {(data?.actions ?? []).map((action) => (
                              <SelectItem
                                key={action.code}
                                value={action.code}
                                className={tcFormStyles.selectItemForm}
                              >
                                {action.label ?? action.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="min-w-[170px]">
                        <Select
                          value={
                            transition.to_state_code
                              ? transition.to_state_code
                              : '__none__'
                          }
                          onValueChange={(value) =>
                            updateTransition(index, {
                              ...transition,
                              to_state_code: value === '__none__' ? '' : value,
                            })
                          }
                          disabled={isBusy}
                        >
                          <SelectTrigger
                            className={`h-11 w-full ${tcFormStyles.inputBg} ${styles.transitionSelectTrigger}`}
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent
                            className={tcFormStyles.selectContentForm}
                          >
                            <SelectItem
                              value="__none__"
                              className={tcFormStyles.selectItemForm}
                            >
                              Selecione
                            </SelectItem>
                            {(data?.states ?? []).map((state) => (
                              <SelectItem
                                key={state.code}
                                value={state.code}
                                className={tcFormStyles.selectItemForm}
                              >
                                {state.label ?? state.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 shrink-0 text-[var(--tc-icon-subtle,#97a2ab)] hover:bg-[var(--tc-soft,#18344d)] hover:text-[var(--tc-text,#f9fafa)]"
                          onClick={() => removeTransition(index)}
                          disabled={isBusy}
                          aria-label="Remover transição"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validationMessage && (
                <p className={`mt-3 ${styles.errorText}`}>
                  {validationMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className={`${tdStyles.reassignDialogContent} ${tdStyles.unsavedDialogContent}`}
          aria-describedby={undefined}
          onPointerDownOutside={(event) => {
            if (isBusy) event.preventDefault()
          }}
          onEscapeKeyDown={(event) => {
            if (isBusy) event.preventDefault()
          }}
        >
          <div
            className={`${tdStyles.reassignDialogInner} ${tdStyles.unsavedDialogInner}`}
          >
            <DialogHeader className={tdStyles.reassignDialogHeader}>
              <DialogTitle className={tdStyles.reassignDialogTitle}>
                Salvar alterações?
              </DialogTitle>
            </DialogHeader>

            <p className={tdStyles.reassignFieldMessage}>
              As regras específicas do tipo selecionado e do role {role} serão
              gravadas (a configuração global não é alterada).
            </p>

            <DialogFooter
              className={`${tdStyles.footerActions} ${tdStyles.unsavedDialogFooter}`}
            >
              <button
                type="button"
                className={`${tdStyles.footerBtn} ${tdStyles.footerBtnDefault}`}
                disabled={isBusy}
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`${tdStyles.footerBtn} ${tdStyles.footerBtnPrimary}`}
                disabled={isBusy}
                onClick={handleSave}
              >
                {saveMutation.isPending ? 'Salvando…' : 'Confirmar'}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent
          className={`${tdStyles.reassignDialogContent} ${tdStyles.unsavedDialogContent}`}
          aria-describedby={undefined}
          onPointerDownOutside={(event) => {
            if (resetMutation.isPending) event.preventDefault()
          }}
          onEscapeKeyDown={(event) => {
            if (resetMutation.isPending) event.preventDefault()
          }}
        >
          <div
            className={`${tdStyles.reassignDialogInner} ${tdStyles.unsavedDialogInner}`}
          >
            <DialogHeader className={tdStyles.reassignDialogHeader}>
              <DialogTitle className={tdStyles.reassignDialogTitle}>
                Restaurar configurações padrão?
              </DialogTitle>
            </DialogHeader>

            <p className={tdStyles.reassignFieldMessage}>
              Esta ação irá restabelecer todas as configurações de workflow para
              o padrão de fábrica. Permissões por estado, transições e
              personalizações realizadas serão descartadas de forma permanente.
              Deseja continuar?
            </p>

            <DialogFooter
              className={`${tdStyles.footerActions} ${tdStyles.unsavedDialogFooter}`}
            >
              <button
                type="button"
                className={`${tdStyles.footerBtn} ${tdStyles.footerBtnDefault}`}
                disabled={resetMutation.isPending}
                onClick={() => setResetConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`${tdStyles.footerBtn} ${tdStyles.footerBtnPrimary}`}
                disabled={resetMutation.isPending}
                onClick={handleResetToDefaults}
              >
                {resetMutation.isPending
                  ? 'Restaurando…'
                  : 'Restaurar padrão de fábrica'}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function WorkflowRolesPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } =
    useTicketScreenPermissionGate(WORKFLOW_SCREEN_CODE)

  if (!resolved || !allowed) {
    return (
      <div
        className="page-content flex min-h-screen flex-col items-center justify-center pb-24"
        style={{ backgroundColor: '#0c161f' }}
      >
        <Spinner />
      </div>
    )
  }

  return <WorkflowRolesPageContent />
}
