import { config } from '@/config'
import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'
import { api } from '@/lib/api'
import { getChamadosImpersonateUserId } from '@/lib/chamados-impersonation-storage'

/** GET `/me/module-screen-permissions` — permissões de telas do módulo Ticket para o usuário. */
export const TICKET_MODULE_PERMISSIONS_PATH =
  'tickets/me/module-screen-permissions'

/** Nome do cookie preenchido no login com o JSON de `TicketModulePermissionsMeOut`. */
export const TICKET_MODULE_PERMISSIONS_COOKIE = 'ticket_module_permissions'

export interface TicketModuleScreenActionPermissionOut {
  code: string
  label: string
}

export interface TicketModuleScreenMePermissionOut {
  screen_code: string
  screen_label: string
  can_view: boolean
  allowed_actions: TicketModuleScreenActionPermissionOut[]
}

export interface TicketModulePermissionsMeOut {
  role: UserRoleEnum | null
  screens: TicketModuleScreenMePermissionOut[]
}

export async function getTicketModulePermissionsMe() {
  const { data } = await api.get<TicketModulePermissionsMeOut>(
    TICKET_MODULE_PERMISSIONS_PATH,
  )
  return data
}

export function canViewTicketScreen(
  permissions: TicketModulePermissionsMeOut | undefined,
  screenCode: string,
): boolean {
  if (!permissions) return false
  const screen = permissions.screens.find((s) => s.screen_code === screenCode)
  return screen?.can_view === true
}

export function parseTicketModulePermissionsCookie(
  raw: string | undefined,
): TicketModulePermissionsMeOut | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as TicketModulePermissionsMeOut
  } catch {
    return null
  }
}

/**
 * Com impersonação ativa, o cookie reflete só o login — força nova leitura na API
 * (com `impersonate_user_id` nas rotas `/chamados`).
 */
export function getEffectiveTicketModulePermissionsFromCookie(
  parsedFromCookie: TicketModulePermissionsMeOut | null,
): TicketModulePermissionsMeOut | null {
  if (
    typeof window !== 'undefined' &&
    config.enableImpersonation &&
    getChamadosImpersonateUserId()?.trim()
  ) {
    return null
  }
  return parsedFromCookie
}

/** Segmento estável para `queryKey` (muda ao trocar/limpar impersonação). */
export function getTicketModulePermissionsImpersonationQuerySegment(): string {
  if (typeof window === 'undefined') return 'ssr'
  if (!config.enableImpersonation) return 'no-imp'
  const id = getChamadosImpersonateUserId()?.trim()
  return id ? `imp:${id}` : 'self'
}
