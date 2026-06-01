'use client'

import { useEffect } from 'react'

const TOUCH_INTERVAL_MS = 5 * 60 * 1000

export function SessionActivityTracker() {
  useEffect(() => {
    let lastTouch = 0

    async function touchSession() {
      const now = Date.now()
      if (now - lastTouch < TOUCH_INTERVAL_MS) {
        return
      }

      lastTouch = now

      try {
        const response = await fetch('/api/auth/session-touch', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.status === 401) {
          window.location.href = '/auth/sign-in'
        }
      } catch {
        // no-op: next user activity will retry
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        touchSession().catch(() => {
          // no-op
        })
      }
    }

    const onFocus = () => {
      touchSession().catch(() => {
        // no-op
      })
    }

    const onInteraction = () => {
      touchSession().catch(() => {
        // no-op
      })
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('click', onInteraction)
    document.addEventListener('keydown', onInteraction)
    document.addEventListener('submit', onInteraction)

    touchSession().catch(() => {
      // no-op
    })

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('click', onInteraction)
      document.removeEventListener('keydown', onInteraction)
      document.removeEventListener('submit', onInteraction)
    }
  }, [])

  return null
}
