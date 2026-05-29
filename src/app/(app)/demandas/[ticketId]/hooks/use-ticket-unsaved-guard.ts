'use client'

import { useEffect, useRef } from 'react'

import type { TicketDetailPendingNavigation } from '../components/ticket-detail-tab-handle'

type Options = {
  enabled: boolean
  isDirty: () => boolean
  isDirtyNow: boolean
  onNavigateAttempt: (target: TicketDetailPendingNavigation) => void
  dialogOpen: boolean
}

function isSameOriginHref(href: string): boolean {
  if (!href || href.startsWith('#')) return false
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false
  try {
    const url = new URL(href, window.location.origin)
    return url.origin === window.location.origin
  } catch {
    return false
  }
}

function normalizePathname(href: string): string {
  try {
    const url = new URL(href, window.location.origin)
    return url.pathname + url.search + url.hash
  } catch {
    return href
  }
}

export function useTicketUnsavedGuard({
  enabled,
  isDirty,
  isDirtyNow,
  onNavigateAttempt,
  dialogOpen,
}: Options) {
  const isDirtyRef = useRef(isDirty)
  const onNavigateAttemptRef = useRef(onNavigateAttempt)
  const dialogOpenRef = useRef(dialogOpen)
  const backTrapActiveRef = useRef(false)

  isDirtyRef.current = isDirty
  onNavigateAttemptRef.current = onNavigateAttempt
  dialogOpenRef.current = dialogOpen

  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirtyRef.current()) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const handleClick = (event: MouseEvent) => {
      if (dialogOpenRef.current || !isDirtyRef.current()) return

      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-unsaved-guard-ignore]')) return

      const anchor = target.closest('a[href]')
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || !isSameOriginHref(href)) return

      const nextPath = normalizePathname(href)
      const currentPath =
        window.location.pathname + window.location.search + window.location.hash
      if (nextPath === currentPath) return

      event.preventDefault()
      event.stopPropagation()
      onNavigateAttemptRef.current({ type: 'route', href: nextPath })
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      backTrapActiveRef.current = false
      return
    }

    if (!isDirtyNow) {
      if (backTrapActiveRef.current) {
        backTrapActiveRef.current = false
        releaseTicketUnsavedBackTrap()
      }
      return
    }

    if (!backTrapActiveRef.current) {
      window.history.pushState(
        { ticketUnsavedGuard: true },
        '',
        window.location.href,
      )
      backTrapActiveRef.current = true
    }

    const handlePopState = () => {
      if (dialogOpenRef.current) {
        window.history.pushState(
          { ticketUnsavedGuard: true },
          '',
          window.location.href,
        )
        return
      }

      if (!isDirtyRef.current()) {
        backTrapActiveRef.current = false
        return
      }

      window.history.pushState(
        { ticketUnsavedGuard: true },
        '',
        window.location.href,
      )
      onNavigateAttemptRef.current({ type: 'back' })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [enabled, isDirtyNow, dialogOpen])
}

export function releaseTicketUnsavedBackTrap() {
  if (window.history.state?.ticketUnsavedGuard) {
    window.history.back()
  }
}
