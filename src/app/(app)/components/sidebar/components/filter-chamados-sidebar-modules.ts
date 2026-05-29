import {
  canViewAnyTicketScreen,
  canViewTicketScreen,
  type TicketModulePermissionsMeOut,
} from '@/http/tickets/ticket-module-permissions-me'

import type { Module, ModuleWithChildren, SidebarModule } from './constants'
import { isModuleWithChildren } from './constants'

function moduleTicketScreenVisible(
  mod: Pick<Module, 'ticketScreenCode' | 'ticketScreenCodes'>,
  permissions: TicketModulePermissionsMeOut | undefined,
  permissionsResolved: boolean,
): boolean {
  if (mod.ticketScreenCodes?.length) {
    if (!permissionsResolved) return false
    return canViewAnyTicketScreen(permissions, mod.ticketScreenCodes)
  }
  if (mod.ticketScreenCode) {
    if (!permissionsResolved) return false
    return canViewTicketScreen(permissions, mod.ticketScreenCode)
  }
  return true
}

function childVisible(
  child: Module,
  permissions: TicketModulePermissionsMeOut | undefined,
  permissionsResolved: boolean,
): boolean {
  return moduleTicketScreenVisible(child, permissions, permissionsResolved)
}

export function filterChamadosSidebarModules(
  modules: SidebarModule[],
  permissions: TicketModulePermissionsMeOut | undefined,
  permissionsResolved: boolean,
): SidebarModule[] {
  return modules
    .map((m) => {
      if (isModuleWithChildren(m)) {
        const mw = m as ModuleWithChildren
        const filteredChildren = mw.children.filter((child) =>
          childVisible(child, permissions, permissionsResolved),
        )
        if (mw.ticketScreenCode || mw.ticketScreenCodes?.length) {
          if (
            !moduleTicketScreenVisible(mw, permissions, permissionsResolved)
          ) {
            return null
          }
        }
        return { ...mw, children: filteredChildren } as ModuleWithChildren
      }
      const mod = m as Module
      if (mod.ticketScreenCode || mod.ticketScreenCodes?.length) {
        if (!moduleTicketScreenVisible(mod, permissions, permissionsResolved)) {
          return null
        }
      }
      return mod
    })
    .filter((m): m is SidebarModule => m != null)
}
