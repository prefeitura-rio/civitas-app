import {
  canViewTicketScreen,
  type TicketModulePermissionsMeOut,
} from '@/http/tickets/ticket-module-permissions-me'

import type { Module, ModuleWithChildren, SidebarModule } from './constants'
import { isModuleWithChildren } from './constants'

function childVisible(
  child: Module,
  permissions: TicketModulePermissionsMeOut | undefined,
  permissionsResolved: boolean,
): boolean {
  if (child.ticketScreenCode) {
    if (!permissionsResolved) return false
    return canViewTicketScreen(permissions, child.ticketScreenCode)
  }
  return true
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
        if (mw.ticketScreenCode) {
          if (!permissionsResolved) return null
          if (!canViewTicketScreen(permissions, mw.ticketScreenCode)) {
            return null
          }
        }
        return { ...mw, children: filteredChildren } as ModuleWithChildren
      }
      const mod = m as Module
      if (mod.ticketScreenCode) {
        if (!permissionsResolved) return null
        if (!canViewTicketScreen(permissions, mod.ticketScreenCode)) {
          return null
        }
      }
      return mod
    })
    .filter((m): m is SidebarModule => m != null)
}
