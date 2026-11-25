/** Perfis de acesso, na ordem da API. */
export const USER_ROLES = [
  'Coordenador',
  'Administrativo',
  'Analista',
  'Adjunto',
  'Auxiliar de Adjunto',
  'Assessor',
  'Líder de Ilha',
  'Agente',
  'Desenvolvedor',
] as const

export type UserRoleEnum = (typeof USER_ROLES)[number]
