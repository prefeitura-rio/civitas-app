'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTeams } from '@/hooks/useContexts/use-teams-context'

export function TeamsHeader() {
  const { teamFormDisclosure, setTeamDialogInitialData } = useTeams()

  return (
    <div className="flex w-full items-start justify-end gap-4">
      <div className="flex flex-1 flex-col">
        <h1 className="equipes-header-title">Equipes Existentes</h1>
        <p className="equipes-header-subtitle">
          Preencha as informações abaixo para criar um novo chamado.
        </p>
      </div>

      <Button
        type="button"
        className="equipes-btn-criar flex items-center gap-2"
        onClick={() => {
          setTeamDialogInitialData(null)
          teamFormDisclosure.onOpen()
        }}
      >
        <Plus className="size-5 shrink-0" />
        Criar Equipe
      </Button>
    </div>
  )
}
