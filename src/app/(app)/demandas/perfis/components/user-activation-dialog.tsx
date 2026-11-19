'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { InputError } from '@/components/custom/input-error'
import { Spinner } from '@/components/custom/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  deactivateUser,
  type UserActivation,
} from '@/http/user-roles/deactivate-user'
import {
  DEACTIVATION_REASON_LABELS,
  MANUAL_DEACTIVATION_REASONS,
  type ManualDeactivationReason,
} from '@/http/user-roles/deactivation-reasons'
import { getDeactivationPreview } from '@/http/user-roles/get-deactivation-preview'
import type { UserRoleListItem } from '@/http/user-roles/get-users-with-roles'
import { reactivateUser } from '@/http/user-roles/reactivate-user'
import { invalidateUserActivationQueries } from '@/lib/user-activation-cache'
import { getApiErrorMessage } from '@/utils/error-handlers'

import styles from '../perfis.module.css'

const NOTE_MAX_LENGTH = 1000

function plural(n: number, singular: string, pluralForm: string) {
  return `${n} ${n === 1 ? singular : pluralForm}`
}

/** Resumo do que a desativação fez com chamados abertos e equipes. */
export function describeDeactivationResult(
  result: UserActivation,
  transferredToName?: string,
): string | undefined {
  const parts: string[] = []
  if (result.transferred_tickets > 0) {
    parts.push(
      `${plural(
        result.transferred_tickets,
        'chamado transferido',
        'chamados transferidos',
      )} para ${transferredToName ?? 'o novo responsável'}.`,
    )
  }
  if (result.removed_from_shared_tickets > 0) {
    parts.push(
      `Saiu de ${plural(
        result.removed_from_shared_tickets,
        'chamado compartilhado',
        'chamados compartilhados',
      )}.`,
    )
  }
  if (result.left_teams.length > 0) {
    parts.push(
      `Removido(a) ${
        result.left_teams.length === 1 ? 'da equipe' : 'das equipes'
      } ${result.left_teams.join(', ')}.`,
    )
  }
  return parts.length ? parts.join(' ') : undefined
}

/** Aviso da reativação: de quais equipes a pessoa era, para readicionar. */
export function describeReactivationResult(result: UserActivation): string {
  const teams = result.previous_teams ?? []
  if (!teams.length) return 'O acesso volta no próximo login.'
  return `O acesso volta no próximo login. Era ${
    teams.length === 1 ? 'da equipe' : 'das equipes'
  } ${teams.join(', ')}; adicione de novo pela tela de Equipes.`
}

interface UserActivationDialogProps {
  /** Usuário alvo; `null` fecha o diálogo. */
  user: UserRoleListItem | null
  onClose: () => void
}

export function UserActivationDialog({
  user,
  onClose,
}: UserActivationDialogProps) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState<ManualDeactivationReason | null>(null)
  const [note, setNote] = useState('')
  const [transferToUserId, setTransferToUserId] = useState('')
  const [errors, setErrors] = useState<{
    reason?: string
    note?: string
    transfer?: string
  }>({})

  useEffect(() => {
    setReason(null)
    setNote('')
    setTransferToUserId('')
    setErrors({})
  }, [user?.id])

  const displayName = user ? user.full_name || user.username : ''
  const isDeactivating = user?.is_active !== false

  // `isFetching`, e não `isLoading`: ao reabrir, a prévia em cache pode estar velha (ex.: ganhou um chamado).
  const {
    data: preview,
    isFetching: isPreviewLoading,
    isError: isPreviewError,
    refetch: refetchPreview,
  } = useQuery({
    queryKey: ['users-roles', 'deactivation-preview', user?.id],
    queryFn: () => getDeactivationPreview(user!.id),
    enabled: Boolean(user) && isDeactivating,
    staleTime: 0,
  })
  // Sem a prévia não dá para saber se há chamados a transferir: o envio espera por ela.
  const previewBlocksSubmit =
    isDeactivating && (isPreviewLoading || isPreviewError || !preview)
  const soleOpenTickets = preview?.sole_open_tickets ?? 0
  const needsTransfer = soleOpenTickets > 0

  // O backend já devolve os candidatos ordenados: equipe dos chamados primeiro.
  const transferCandidates = preview?.transfer_candidates ?? []
  const ticketTeamCandidates = transferCandidates.filter(
    (c) => c.in_ticket_team,
  )
  const otherCandidates = transferCandidates.filter((c) => !c.in_ticket_team)
  const ticketTeamNames = [
    ...new Set(ticketTeamCandidates.map((c) => c.team_name).filter(Boolean)),
  ]
  const ticketTeamGroupLabel =
    ticketTeamNames.length === 1
      ? (ticketTeamNames[0] as string)
      : 'Equipes dos chamados'
  const transferToName = transferCandidates.find(
    (c) => c.user_id === transferToUserId,
  )?.user_name

  function clearError(field: keyof typeof errors) {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('missing user')
      return isDeactivating
        ? deactivateUser({
            userId: user.id,
            reason: reason!,
            note,
            transferToUserId: needsTransfer ? transferToUserId : undefined,
          })
        : reactivateUser(user.id)
    },
    onSuccess: (result) => {
      // A operação já terminou: avisa e fecha sem esperar as listas recarregarem.
      invalidateUserActivationQueries(queryClient)
      if (isDeactivating) {
        toast.success(`${displayName} foi desativado(a).`, {
          description: describeDeactivationResult(result, transferToName),
        })
      } else {
        toast.success(`${displayName} foi reativado(a).`, {
          description: describeReactivationResult(result),
        })
      }
      onClose()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  function handleConfirm() {
    if (previewBlocksSubmit) return
    if (isDeactivating) {
      const nextErrors: typeof errors = {}
      if (!reason) nextErrors.reason = 'Selecione o motivo.'
      if (reason === 'OUTRO' && !note.trim()) {
        nextErrors.note = 'Descreva o motivo.'
      }
      if (needsTransfer && !transferToUserId) {
        nextErrors.transfer = 'Escolha quem recebe os chamados.'
      }
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length) return
    }
    mutate()
  }

  return (
    <Dialog
      open={Boolean(user)}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose()
      }}
    >
      <DialogContent
        className={`${styles.perfisModalContent} max-h-[90vh] overflow-y-auto sm:max-w-lg`}
      >
        <DialogHeader>
          <DialogTitle className={styles.perfisModalTitle}>
            {isDeactivating ? 'Desativar usuário' : 'Reativar usuário'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isDeactivating
              ? 'Escolha o motivo para desativar o acesso deste usuário.'
              : 'Confirme a reativação do acesso deste usuário.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <p className="text-sm" style={{ color: 'var(--perfis-text-subtle)' }}>
            <span
              className="font-medium"
              style={{ color: 'var(--perfis-text-default)' }}
            >
              Usuário:
            </span>{' '}
            {displayName}
          </p>

          {isDeactivating ? (
            <>
              <p
                className="text-sm"
                style={{ color: 'var(--perfis-text-subtle)' }}
              >
                O acesso é bloqueado na hora e a sessão atual é encerrada. O
                usuário sai das equipes e dos chamados abertos; o histórico e os
                arquivados continuam com o nome dele.
              </p>

              <fieldset className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <legend className={styles.perfisModalLabel}>Motivo</legend>
                  <InputError message={errors.reason} />
                </div>
                <div
                  className={`${styles.perfisModalSection} grid grid-cols-1 gap-3`}
                >
                  {MANUAL_DEACTIVATION_REASONS.map((value) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition hover:opacity-90"
                      style={{ border: '1px solid var(--perfis-border)' }}
                    >
                      <input
                        type="radio"
                        name="deactivation-reason"
                        value={value}
                        checked={reason === value}
                        onChange={() => {
                          setReason(value)
                          clearError('reason')
                          if (value !== 'OUTRO') clearError('note')
                        }}
                        disabled={isPending}
                      />
                      <span
                        className="text-sm"
                        style={{ color: 'var(--perfis-text-default)' }}
                      >
                        {DEACTIVATION_REASON_LABELS[value]}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="deactivation-note"
                    className={styles.perfisModalLabel}
                  >
                    Observação{reason === 'OUTRO' ? ' (obrigatória)' : ''}
                  </Label>
                  <InputError message={errors.note} />
                </div>
                <Textarea
                  id="deactivation-note"
                  value={note}
                  maxLength={NOTE_MAX_LENGTH}
                  onChange={(event) => {
                    setNote(event.target.value)
                    if (event.target.value.trim()) clearError('note')
                  }}
                  disabled={isPending}
                  rows={3}
                />
              </div>

              {isPreviewLoading ? (
                <Spinner />
              ) : isPreviewError ? (
                <div className="flex items-center justify-between gap-3">
                  <p className={styles.perfisModalNotice} role="alert">
                    Não foi possível carregar os chamados e equipes do usuário.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchPreview()}
                    className={`${styles.perfisModalBtnSecondary} shrink-0 px-3 py-1`}
                  >
                    Tentar de novo
                  </button>
                </div>
              ) : needsTransfer ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="deactivation-transfer"
                      className={styles.perfisModalLabel}
                    >
                      {`Transferir ${plural(
                        soleOpenTickets,
                        'chamado aberto',
                        'chamados abertos',
                      )} para`}
                    </Label>
                    <InputError message={errors.transfer} />
                  </div>
                  <select
                    id="deactivation-transfer"
                    className={styles.perfisModalSelect}
                    value={transferToUserId}
                    onChange={(event) => {
                      setTransferToUserId(event.target.value)
                      if (event.target.value) clearError('transfer')
                    }}
                    disabled={isPending}
                  >
                    <option value="">Selecione quem assume</option>
                    {ticketTeamCandidates.length > 0 && (
                      <optgroup label={ticketTeamGroupLabel}>
                        {ticketTeamCandidates.map((candidate) => (
                          <option
                            key={candidate.user_id}
                            value={candidate.user_id}
                          >
                            {candidate.user_name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {otherCandidates.length > 0 && (
                      <optgroup label="Outras equipes">
                        {otherCandidates.map((candidate) => (
                          <option
                            key={candidate.user_id}
                            value={candidate.user_id}
                          >
                            {`${candidate.user_name} (${
                              candidate.team_name ?? 'sem equipe'
                            })`}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className={styles.perfisModalNotice}>
                    {`${displayName} é o(a) único(a) responsável por ${
                      soleOpenTickets === 1 ? 'esse chamado' : 'esses chamados'
                    }`}
                  </p>
                </div>
              ) : null}

              {preview && preview.shared_open_tickets > 0 ? (
                <p className={styles.perfisModalNotice}>
                  {`Sai de ${plural(
                    preview.shared_open_tickets,
                    'chamado compartilhado',
                    'chamados compartilhados',
                  )}; os outros responsáveis continuam.`}
                </p>
              ) : null}
            </>
          ) : (
            <p
              className="text-sm"
              style={{ color: 'var(--perfis-text-subtle)' }}
            >
              O usuário volta a acessar a CIVITAS no próximo login, com o mesmo
              perfil. Ele não volta para as equipes automaticamente: adicione de
              novo pela tela de Equipes.
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className={`${styles.perfisModalBtnSecondary} flex min-w-[7rem] items-center justify-center px-4 py-2`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending || previewBlocksSubmit}
              className={`${
                isDeactivating
                  ? styles.perfisModalBtnDanger
                  : styles.perfisModalBtnPrimary
              } flex min-w-[7rem] items-center justify-center gap-2 px-4 py-2`}
            >
              {isPending ? (
                <Spinner />
              ) : (
                <span>{isDeactivating ? 'Desativar' : 'Reativar'}</span>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
