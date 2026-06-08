'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { TeamsController } from '../hooks/use-teams-controller'

interface TeamsHeaderProps {
  controller: TeamsController
}

export function TeamsHeader({ controller }: TeamsHeaderProps) {
  const { openCreateTeamDialog } = controller

  return (
    <div className="flex w-full items-start justify-end gap-4">
      <div className="flex flex-1 flex-col">
        <h1 className="equipes-header-title">Equipes Existentes</h1>
        <p className="equipes-header-subtitle"></p>
      </div>

      <Button
        type="button"
        className="equipes-btn-criar flex items-center gap-2"
        onClick={openCreateTeamDialog}
      >
        <Plus className="size-5 shrink-0" />
        Criar Equipe
      </Button>
    </div>
  )
}
