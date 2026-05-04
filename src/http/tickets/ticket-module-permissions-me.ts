import { config } from '@/config'
import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'
import { api } from '@/lib/api'
import { getChamadosImpersonateUserId } from '@/lib/chamados-impersonation-storage'

export const TICKET_MODULE_PERMISSIONS_PATH =
  'tickets/me/module-screen-permissions'

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

export function getTicketModulePermissionsImpersonationQuerySegment(): string {
  if (typeof window === 'undefined') return 'ssr'
  if (!config.enableImpersonation) return 'no-imp'
  const id = getChamadosImpersonateUserId()?.trim()
  return id ? `imp:${id}` : 'self'
}
