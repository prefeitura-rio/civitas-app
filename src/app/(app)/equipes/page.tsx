'use client'

import './equipes.css'

import { notFound } from 'next/navigation'

import { config } from '@/config'

import { TeamsDialogs } from './components/teams-dialogs'
import { TeamsHeader } from './components/teams-header'
import { TeamsList } from './components/teams-list'
import { useTeamsController } from './hooks/use-teams-controller'

export default function EquipesPage() {
  if (!config.enableChamados) {
    notFound()
  }
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
