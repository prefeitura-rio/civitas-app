'use client'

import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Pagination } from '@/components/ui/pagination'
import { useProfileAccessSearchParams } from '@/hooks/useParams/useProfileAccessSearchParams'
import {
  DEACTIVATION_REASON_LABELS,
  type UserStatusFilter,
} from '@/http/user-roles/deactivation-reasons'
import {
  getUsersWithRoles,
  type UserRoleEnum,
  type UserRoleListItem,
} from '@/http/user-roles/get-users-with-roles'

import styles from '../perfis.module.css'

const roleLabelMap: Record<UserRoleEnum, string> = {
  Coordenador: 'Coordenador',
  Administrativo: 'Administrativo',
  Analista: 'Analista',
  Adjunto: 'Adjunto',
  'Auxiliar de Adjunto': 'Auxiliar de Adjunto',
  Assessor: 'Assessor',
  'Líder de Ilha': 'Líder de Ilha',
  Agente: 'Agente',
  Desenvolvedor: 'Desenvolvedor',
}

const roleBadgeStyleMap: Record<UserRoleEnum, string> = {
  Coordenador: styles.perfisBadgeCoordenador,
  Administrativo: styles.perfisBadgeAdministrativo,
  Analista: styles.perfisBadgeAnalista,
  Adjunto: styles.perfisBadgeAdjunto,
  'Auxiliar de Adjunto': styles.perfisBadgeAuxiliarDeAdjunto,
  Assessor: styles.perfisBadgeAssessor,
  'Líder de Ilha': styles.perfisBadgeLiderIlha,
  Agente: styles.perfisBadgeAgente,
  Desenvolvedor: styles.perfisBadgeDesenvolvedor,
}

function RoleBadge({ role }: { role: UserRoleEnum }) {
  return (
    <span className={`${styles.perfisBadge} ${roleBadgeStyleMap[role]}`}>
      {roleLabelMap[role]}
    </span>
  )
}

const STATUS_TABS: { value: UserStatusFilter; label: string }[] = [
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'all', label: 'Todos' },
]

interface ProfileAccessTableProps {
  onEditUser: (user: UserRoleListItem) => void
}

export function ProfileAccessTable({ onEditUser }: ProfileAccessTableProps) {
  const {
    search,
    status,
    formattedSearchParams,
    queryKey,
    handlePaginate,
    handleSearch,
    handleStatusChange,
  } = useProfileAccessSearchParams()

  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 350)
  const skipSearchInputSyncRef = useRef(false)

  useEffect(() => {
    if (skipSearchInputSyncRef.current) {
      skipSearchInputSyncRef.current = false
      return
    }
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const next = debouncedSearch.trim()
    if (next === search) return
    skipSearchInputSyncRef.current = true
    handleSearch(debouncedSearch)
  }, [debouncedSearch, search, handleSearch])

  const { data: response, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      getUsersWithRoles({
        ...formattedSearchParams,
      }),
  })

  const data = response?.data?.items || []
  const total = response?.data?.total || 0

  return (
    <>
      <div className={styles.perfisContent}>
        <header className={styles.perfisHeader}>
          <h1 className={styles.perfisTitle}>Cadastro de Perfil</h1>
          <p className={styles.perfisSubtitle}></p>
        </header>

        <div className={styles.perfisSearchRow}>
          <Search
            className={styles.perfisSearchIcon}
            size={18}
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            className={styles.perfisSearchInput}
            placeholder="Pesquisar por nome ou usuário..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>

        <div
          className={styles.perfisStatusTabs}
          role="tablist"
          aria-label="Situação do usuário"
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              className={`${styles.perfisStatusTab} ${
                status === tab.value ? styles.perfisStatusTabActive : ''
              }`}
              onClick={() => handleStatusChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.perfisTableCard}>
          <div className={styles.perfisTableContainer}>
            <div className={styles.perfisTableHeaderRow}>
              <div className={styles.perfisTableHeaderCellNome}>
                <span className={styles.perfisTableHeaderText}>NOME</span>
              </div>
              <div className={styles.perfisTableHeaderCellPerfil}>
                <span className={styles.perfisTableHeaderText}>
                  PERFIL DE ACESSO
                </span>
              </div>
              <div className={styles.perfisTableHeaderCellAcoes} />
            </div>

            {isLoading && (
              <div className="flex h-40 items-center justify-center text-[var(--perfis-text-subtle)]">
                Carregando...
              </div>
            )}

            {!isLoading && data.length === 0 && (
              <div className="flex h-40 items-center justify-center text-[var(--perfis-text-subtle)]">
                Nenhum usuário encontrado
              </div>
            )}

            {!isLoading &&
              data.map((user: UserRoleListItem) => {
                const displayName = user.full_name || user.username
                const isInactive = user.is_active === false

                return (
                  <div
                    key={user.id}
                    className={`${styles.perfisTableRow} ${
                      isInactive ? styles.perfisTableRowInactive : ''
                    }`}
                  >
                    <div className={styles.perfisTableRowContent}>
                      <div className={styles.perfisTableCellNome}>
                        <div className="flex min-w-0 flex-col">
                          <div className="flex items-center">
                            <span className={styles.perfisTableCellText}>
                              {displayName}
                            </span>
                            {isInactive && (
                              <span
                                className={`${styles.perfisBadge} ${styles.perfisBadgeInativo}`}
                              >
                                Inativo
                              </span>
                            )}
                          </div>
                          {isInactive && user.deactivation_reason && (
                            <span className={styles.perfisInactiveReason}>
                              {
                                DEACTIVATION_REASON_LABELS[
                                  user.deactivation_reason
                                ]
                              }
                              {user.deactivated_at
                                ? ` · ${format(parseISO(user.deactivated_at), 'dd/MM/yyyy')}`
                                : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.perfisTableCellPerfil}>
                        {user.role ? (
                          <RoleBadge
                            key={`${user.id}-${user.role}`}
                            role={user.role}
                          />
                        ) : (
                          <span className={styles.perfisTableCellText}>
                            Sem perfil
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.perfisTableHeaderCellAcoes}>
                      <button
                        type="button"
                        className={styles.perfisBtnEditar}
                        onClick={() => onEditUser(user)}
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className={styles.perfisPagination}>
          <Pagination
            page={formattedSearchParams.page}
            total={total}
            size={formattedSearchParams.size}
            onPageChange={handlePaginate}
          />
        </div>
      )}
    </>
  )
}
