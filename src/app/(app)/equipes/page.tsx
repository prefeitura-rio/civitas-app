import './equipes.css'

import { notFound } from 'next/navigation'

import { config } from '@/config'
import { TeamsProvider } from '@/contexts/teams-context'

import { TeamsDialogs } from './components/teams-dialogs'
import { TeamsHeader } from './components/teams-header'
import { TeamsList } from './components/teams-list'

export default function EquipesPage() {
  if (!config.enableChamados) {
    notFound()
  }

  return (
    <TeamsProvider>
      <div className="equipes-page page-content flex min-h-screen flex-col gap-[var(--equipes-gap-section)] overflow-y-auto px-6 py-6">
        <div className="content">
          <TeamsHeader />
          <TeamsList />
          <TeamsDialogs />
        </div>
      </div>
    </TeamsProvider>
  )
}
