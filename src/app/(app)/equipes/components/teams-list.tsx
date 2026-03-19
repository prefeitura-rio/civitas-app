'use client'

import { useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronRight,
  PencilLine,
  Plus,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useTeams } from '@/hooks/useContexts/use-teams-context'
import type { Team, TeamMember } from '@/http/teams/get-teams'
import { getTeams } from '@/http/teams/get-teams'
import type { UserRoleEnum } from '@/http/user-roles/get-users-with-roles'

const roleLabelMap: Record<UserRoleEnum, string> = {
  Coordenador: 'Coordenador',
  Administrativo: 'Administrativo',
  Adjunto: 'Adjunto',
  'Líder de Ilha': 'Líder de Ilha',
  Operador: 'Operador',
}

function formatRole(role: UserRoleEnum) {
  return roleLabelMap[role] ?? role
}

function resolveIsland(member: TeamMember) {
  return member.island_name || '-'
}

export function TeamsList() {
  const [openTeams, setOpenTeams] = useState<string[]>([])

  const {
    memberFormDisclosure,
    setMemberDialogInitialData,
    teamFormDisclosure,
    setTeamDialogInitialData,
    setDeleteTeamMemberProps,
  } = useTeams()

  const { data: response, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const teams = response?.data.items || []

  function toggleTeam(teamId: string) {
    setOpenTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((item) => item !== teamId)
        : [...prev, teamId],
    )
  }

  const normalizedOpenTeams = useMemo(() => {
    if (openTeams.length > 0) return openTeams
    return teams.length > 0 ? [teams[0].id] : []
  }, [openTeams, teams])

  if (isLoading) {
    return (
      <div className="equipes-card p-8 text-[var(--equipes-text-subtle)]">
        Carregando equipes...
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="equipes-card p-8 text-[var(--equipes-text-subtle)]">
        Nenhuma equipe encontrada.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[var(--equipes-gap-subsection)]">
      {teams.map((team: Team) => {
        const isOpen = normalizedOpenTeams.includes(team.id)

        return (
          <div key={team.id} className="equipes-card">
            <button
              type="button"
              className="equipes-card-header w-full cursor-pointer text-left transition hover:opacity-90"
              onClick={() => toggleTeam(team.id)}
            >
              <div className="flex items-center gap-4">
                <span className="equipes-card-badge">{team.name}</span>
                <span className="equipes-card-count">
                  {team.members.length}
                </span>
              </div>
              {isOpen ? (
                <ChevronDown className="size-6 shrink-0 text-[var(--equipes-text-subtle)]" />
              ) : (
                <ChevronRight className="size-6 shrink-0 text-[var(--equipes-text-subtle)]" />
              )}
            </button>

            {isOpen && (
              <>
                <div className="equipes-table-wrap">
                  <div className="equipes-table-row equipes-table-header">
                    <div className="equipes-table-cell equipes-table-cell-ilha">
                      Ilha
                    </div>
                    <div className="equipes-table-cell equipes-table-cell-funcao">
                      Função
                    </div>
                    <div className="equipes-table-cell equipes-table-cell-nome">
                      Nome
                    </div>
                    <div className="ml-auto w-[80px] shrink-0" />
                  </div>
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="equipes-table-row group items-center justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-center">
                        <div className="equipes-table-cell equipes-table-cell-ilha">
                          {resolveIsland(member)}
                        </div>
                        <div className="equipes-table-cell equipes-table-cell-funcao">
                          {formatRole(member.role)}
                        </div>
                        <div className="equipes-table-cell equipes-table-cell-nome">
                          {member.user_name || '-'}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-end gap-2">
                        <Button
                          type="button"
                          className="equipes-btn-editar flex items-center gap-1"
                          onClick={() => {
                            setMemberDialogInitialData({
                              id: member.id,
                              team_id: team.id,
                              team_name: team.name,
                              user_id: member.user_id,
                              user_name: member.user_name,
                              island_id: member.island_id,
                              island_name: member.island_name,
                              role: member.role,
                              is_active: member.is_active,
                            })
                            memberFormDisclosure.onOpen()
                          }}
                        >
                          <PencilLine className="size-3.5" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-6 border-red-900/50 bg-transparent px-2 text-[10px] text-red-300 hover:bg-red-950/30 hover:text-red-200"
                          onClick={() => {
                            setDeleteTeamMemberProps({
                              id: member.id,
                              user_name: member.user_name || 'Colaborador',
                              team_id: team.id,
                              team_name: team.name,
                            })
                          }}
                        >
                          <Trash2 className="size-3.5" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="equipes-table-footer">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[var(--equipes-border)] bg-transparent text-[var(--equipes-text-subtle)] hover:bg-[var(--equipes-bg-label)] hover:text-[var(--equipes-text-default)]"
                      onClick={() => {
                        setTeamDialogInitialData({
                          id: team.id,
                          name: team.name,
                          description: team.description,
                          is_active: team.is_active,
                        })
                        teamFormDisclosure.onOpen()
                      }}
                    >
                      <PencilLine className="mr-2 size-4" />
                      Editar Equipe
                    </Button>
                  </div>
                  <Button
                    type="button"
                    className="equipes-btn-adicionar flex items-center gap-2"
                    onClick={() => {
                      setMemberDialogInitialData({
                        team_id: team.id,
                        team_name: team.name,
                      })
                      memberFormDisclosure.onOpen()
                    }}
                  >
                    <Plus className="size-5 shrink-0" />
                    Adicionar Colaborador
                  </Button>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
