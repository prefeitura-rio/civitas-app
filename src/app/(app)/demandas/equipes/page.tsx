'use client'

import './equipes.css'

import { notFound } from 'next/navigation'

import { Spinner } from '@/components/custom/spinner'
import { config } from '@/config'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'

import { TeamsDialogs } from './components/teams-dialogs'
import { TeamsHeader } from './components/teams-header'
import { TeamsList } from './components/teams-list'
import { useTeamsController } from './hooks/use-teams-controller'

const TEAMS_SCREEN_CODE = 'teams'

function EquipesPageContent() {
  const controller = useTeamsController()

  return (
    <div className="equipes-page page-content flex min-h-screen flex-col gap-[var(--equipes-gap-section)] overflow-y-auto px-6 py-6">
      <div className="content">
        <TeamsHeader controller={controller} />
        <TeamsList controller={controller} />
        <TeamsDialogs controller={controller} />
      </div>
    </div>
  )
}

export default function EquipesPage() {
  if (!config.enableChamados) {
    notFound()
  }

  const { allowed, resolved } = useTicketScreenPermissionGate(TEAMS_SCREEN_CODE)

  if (!resolved || !allowed) {
    return (
      <div className="equipes-page page-content flex min-h-screen flex-col items-center justify-center px-6 py-6">
        <Spinner />
      </div>
    )
  }

  return <EquipesPageContent />
}
