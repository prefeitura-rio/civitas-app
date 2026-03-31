'use client'

import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Pagination } from '@/components/ui/pagination'
import { useProfileAccessSearchParams } from '@/hooks/useParams/useProfileAccessSearchParams'
import {
  getUsersWithRoles,
  type UserRoleEnum,
  type UserRoleListItem,
} from '@/http/user-roles/get-users-with-roles'

import styles from '../perfis.module.css'

const roleLabelMap: Record<UserRoleEnum, string> = {
  Coordenador: 'Coordenador',
  Administrativo: 'Administrativo',
  Adjunto: 'Adjunto',
  'Líder de Ilha': 'Líder de Ilha',
  Operador: 'Operador',
}

const roleBadgeStyleMap: Record<UserRoleEnum, string> = {
  Coordenador: styles.perfisBadgeCoordenador,
  Administrativo: styles.perfisBadgeAdministrativo,
  Adjunto: styles.perfisBadgeAdjunto,
  'Líder de Ilha': styles.perfisBadgeLiderIlha,
  Operador: styles.perfisBadgeOperador,
}

function RoleBadge({ role }: { role: UserRoleEnum }) {
  return (
    <span className={`${styles.perfisBadge} ${roleBadgeStyleMap[role]}`}>
      {roleLabelMap[role]}
    </span>
  )
}

interface ProfileAccessTableProps {
  onEditUser: (user: UserRoleListItem) => void
}

export function ProfileAccessTable({ onEditUser }: ProfileAccessTableProps) {
  const {
    search,
    formattedSearchParams,
    queryKey,
    handlePaginate,
    handleSearch,
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
          <p className={styles.perfisSubtitle}>
            Preencha as informações abaixo para criar um novo chamado.
          </p>
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
              data.map((user: UserRoleListItem) => (
                <div key={user.id} className={styles.perfisTableRow}>
                  <div className={styles.perfisTableRowContent}>
                    <div className={styles.perfisTableCellNome}>
                      <span className={styles.perfisTableCellText}>
                        {user.full_name || user.username}
                      </span>
                    </div>
                    <div className={styles.perfisTableCellPerfil}>
                      {user.roles.map((role) => (
                        <RoleBadge key={`${user.id}-${role}`} role={role} />
                      ))}
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
              ))}
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
