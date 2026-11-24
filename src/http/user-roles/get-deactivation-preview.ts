import { api } from '@/lib/api'

import type { UserRoleEnum } from './get-users-with-roles'

export interface TransferCandidate {
  user_id: string
  user_name: string
  role: UserRoleEnum | null
  /** Equipe com vínculo ativo do candidato, se houver. */
  team_name: string | null
  /** Membro da equipe de algum dos chamados a transferir. */
  in_ticket_team: boolean
}

export interface UserDeactivationPreview {
  /** Chamados abertos em que o usuário é o único responsável: exigem transferência. */
  sole_open_tickets: number
  /** Chamados abertos compartilhados: o usuário apenas sai deles. */
  shared_open_tickets: number
  /** Equipes cujo vínculo será encerrado. */
  teams: string[]
  /** Quem pode receber os chamados; equipe dos chamados primeiro. */
  transfer_candidates: TransferCandidate[]
  /** Equipes em que o usuário é o único adjunto ativo: novos chamados para elas passam a ser recusados. */
  teams_left_without_adjunto?: string[]
}

export async function getDeactivationPreview(userId: string) {
  const { data } = await api.get<UserDeactivationPreview>(
    `/users-roles/${encodeURIComponent(userId)}/deactivation-preview`,
  )
  return data
}
