'use client'

import { notFound, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTacticalDashboardTabPermissions } from '@/hooks/useTacticalDashboardTabPermissions'

export default function DashboardTaticoPage() {
  const router = useRouter()
  const { canAccessDashboard, firstAllowedHref, resolved } =
    useTacticalDashboardTabPermissions()

  useEffect(() => {
    if (!resolved) return
    if (!canAccessDashboard) {
      router.replace('/forbidden')
      return
    }
    if (firstAllowedHref) {
      router.replace(firstAllowedHref)
    }
  }, [canAccessDashboard, firstAllowedHref, resolved, router])

  if (!config.enableChamados) {
    notFound()
  }

  return (
    <div
      className="flex min-h-[240px] items-center justify-center"
      style={{ backgroundColor: '#0c161f' }}
    >
      <Spinner />
    </div>
  )
}
