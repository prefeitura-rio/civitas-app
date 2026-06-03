'use client'

import { getCookie } from 'cookies-next'
import { useMemo } from 'react'

import {
  TACTICAL_DASHBOARD_TAB_SCREEN_CODES,
  TACTICAL_DASHBOARD_TABS,
} from '@/app/(app)/demandas/dashboard-tatico/constants'
import { useResolvedTicketModulePermissions } from '@/hooks/useQueries/useResolvedTicketModulePermissions'
import {
  canViewAnyTicketScreen,
  canViewTicketScreen,
  parseTicketModulePermissionsCookie,
  TICKET_MODULE_PERMISSIONS_COOKIE,
} from '@/http/tickets/ticket-module-permissions-me'

export function useTacticalDashboardTabPermissions() {
  const fromCookie = parseTicketModulePermissionsCookie(
    getCookie(TICKET_MODULE_PERMISSIONS_COOKIE) as string | undefined,
  )
  const { permissions, resolved } =
    useResolvedTicketModulePermissions(fromCookie)

  const allowedTabs = useMemo(
    () =>
      TACTICAL_DASHBOARD_TABS.filter((tab) =>
        canViewTicketScreen(permissions, tab.screenCode),
      ),
    [permissions],
  )

  const canAccessDashboard =
    resolved &&
    canViewAnyTicketScreen(permissions, TACTICAL_DASHBOARD_TAB_SCREEN_CODES)

  return {
    permissions,
    resolved,
    allowedTabs,
    canAccessDashboard,
    firstAllowedHref: allowedTabs[0]?.href ?? null,
  }
}
