import type { QueryClient } from '@tanstack/react-query'

/**
 * Consultas que mostram ou filtram usuários pela situação (ativo/inativo). Ao desativar ou reativar alguém,
 * todas ficam velhas: listas de perfis, seletores (personificação, membro de equipe, responsáveis), filtro de
 * fechamentos, equipes, os dados da desativação no diálogo do perfil e o selo "Inativo" no responsável do chamado.
 */
const USER_ACTIVATION_QUERY_PREFIXES = [
  ['users-with-roles'],
  ['users-with-assigned-roles'],
  ['shift-closings-adjuncts'],
  ['teams'],
  ['user-activation'],
] as const

function isTicketHeaderQuery(queryKey: readonly unknown[]) {
  return queryKey[0] === 'ticket' && queryKey[2] === 'cabecalho'
}

export async function invalidateUserActivationQueries(client: QueryClient) {
  await Promise.all([
    ...USER_ACTIVATION_QUERY_PREFIXES.map((queryKey) =>
      client.invalidateQueries({ queryKey: [...queryKey] }),
    ),
    client.invalidateQueries({
      predicate: (query) => isTicketHeaderQuery(query.queryKey),
    }),
  ])
}
