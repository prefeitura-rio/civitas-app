import { api } from '@/lib/api'

import type {
  ManualDeactivationReason,
  UserDeactivationReason,
} from './deactivation-reasons'

export interface UserActivation {
  id: string
  is_active: boolean
  deactivated_at: string | null
  deactivated_by_id: string | null
  deactivation_reason: UserDeactivationReason | null
  deactivation_note: string | null
  /** Chamados abertos transferidos (o usuário era o único responsável). */
  transferred_tickets: number
  /** Chamados abertos compartilhados dos quais o usuário saiu. */
  removed_from_shared_tickets: number
  /** Equipes de que o usuário saiu na desativação (não volta ao reativar). */
  left_teams: string[]
  /** Na reativação: equipes (com função) que ele tinha antes, para readicionar. */
  previous_teams: string[]
}

interface DeactivateUserRequest {
  userId: string
  reason: ManualDeactivationReason
  note?: string
  /** Obrigatório quando há chamados abertos em que o usuário é o único responsável. */
  transferToUserId?: string
}

export async function deactivateUser({
  userId,
  reason,
  note,
  transferToUserId,
}: DeactivateUserRequest) {
  const trimmedNote = note?.trim()
  const { data } = await api.patch<UserActivation>(
    `/users-roles/${encodeURIComponent(userId)}/deactivate`,
    {
      reason,
      ...(trimmedNote ? { note: trimmedNote } : {}),
      ...(transferToUserId ? { transfer_to_user_id: transferToUserId } : {}),
    },
  )
  return data
}
