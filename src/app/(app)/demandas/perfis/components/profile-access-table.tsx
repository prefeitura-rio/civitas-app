'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Pagination } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type ProfileAccessFilterKey,
  useProfileAccessSearchParams,
  WITHOUT_ROLE,
} from '@/hooks/useParams/useProfileAccessSearchParams'
import {
  DEACTIVATION_REASON_LABELS,
  type UserDeactivationReason,
  type UserStatusFilter,
} from '@/http/user-roles/deactivation-reasons'
import {
  getUsersWithRoles,
  type UserRoleListItem,
} from '@/http/user-roles/get-users-with-roles'
import { USER_ROLES, type UserRoleEnum } from '@/http/user-roles/user-roles'

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

const STATUS_OPTIONS: { value: UserStatusFilter; label: string }[] = [
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'all', label: 'Todos' },
]

/** Radix Select não aceita valor vazio: "Todos" usa este marcador. */
const ANY = '__any__'

const ROLE_OPTIONS = [
  ...USER_ROLES.map((role) => ({ value: role, label: roleLabelMap[role] })),
  { value: WITHOUT_ROLE, label: 'Sem perfil' },
]

const REASON_OPTIONS = (
  Object.keys(DEACTIVATION_REASON_LABELS) as UserDeactivationReason[]
).map((reason) => ({
  value: reason,
  label: DEACTIVATION_REASON_LABELS[reason],
}))

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  anyLabel?: string
  disabled?: boolean
  hint?: string
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  anyLabel,
  disabled,
  hint,
}: FilterSelectProps) {
  return (
    <div className={styles.perfisFilterField}>
      <span className={styles.perfisFilterLabel} aria-hidden>
        {label}
      </span>
      <Select
        value={value || ANY}
        onValueChange={(next) => onChange(next === ANY ? '' : next)}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label={label}
          title={disabled ? hint : undefined}
          className={styles.perfisFilterTrigger}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={styles.perfisFilterContent}>
          {anyLabel ? (
            <SelectItem value={ANY} className={styles.perfisFilterItem}>
              {anyLabel}
            </SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={styles.perfisFilterItem}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function formatDate(value: string | null | undefined) {
  return value ? format(parseISO(value), 'dd/MM/yyyy') : '—'
}

interface ProfileAccessTableProps {
  onEditUser: (user: UserRoleListItem) => void
}

export function ProfileAccessTable({ onEditUser }: ProfileAccessTableProps) {
  const {
    search,
    status,
    role,
    reason,
    formattedSearchParams,
    queryKey,
    handlePaginate,
    handleSearch,
    handleStatusChange,
    handleFilterChange,
  } = useProfileAccessSearchParams()
  const showDeactivation = status !== 'active'
  const setFilter = (key: ProfileAccessFilterKey) => (value: string) =>
    handleFilterChange(key, value || null)

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

  // Mantém a página atual na tela até a próxima chegar, em vez de piscar "Carregando...".
  const {
    data: response,
    isLoading,
    isPlaceholderData,
  } = useQuery({
    queryKey,
    queryFn: () =>
      getUsersWithRoles({
        ...formattedSearchParams,
      }),
    placeholderData: keepPreviousData,
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

        <div className={styles.perfisFiltersRow}>
          <label
            className={`${styles.perfisFilterField} ${styles.perfisFilterFieldSearch}`}
          >
            <span className={styles.perfisFilterLabel}>Buscar</span>
            <span className={styles.perfisSearchBox}>
              <Search
                className={styles.perfisSearchIcon}
                size={16}
                strokeWidth={2}
                aria-hidden
              />
              <input
                type="search"
                className={styles.perfisSearchInput}
                placeholder="Nome, usuário, e-mail ou CPF"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoComplete="off"
                enterKeyHint="search"
              />
            </span>
          </label>
          <FilterSelect
            label="Situação"
            value={status}
            onChange={(value) =>
              handleStatusChange((value || 'active') as UserStatusFilter)
            }
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            label="Perfil de acesso"
            value={role}
            onChange={setFilter('role')}
            options={ROLE_OPTIONS}
            anyLabel="Todos"
          />
          <FilterSelect
            label="Motivo da desativação"
            value={reason}
            onChange={setFilter('reason')}
            options={REASON_OPTIONS}
            anyLabel="Todos"
            disabled={!showDeactivation}
            hint="Escolha a situação Inativos ou Todos para filtrar pelo motivo."
          />
        </div>

        <div className={styles.perfisTableCard}>
          <div
            className={`${styles.perfisTableContainer} ${
              isPlaceholderData ? styles.perfisTableContainerStale : ''
            }`}
            aria-busy={isPlaceholderData || undefined}
          >
            <div className={styles.perfisTableHeaderRow}>
              <div className={styles.perfisTableHeaderCellNome}>
                <span className={styles.perfisTableHeaderText}>NOME</span>
              </div>
              <div className={styles.perfisTableHeaderCellPerfil}>
                <span className={styles.perfisTableHeaderText}>
                  PERFIL DE ACESSO
                </span>
              </div>
              {showDeactivation ? (
                <>
                  <div className={styles.perfisTableCellMotivo}>
                    <span className={styles.perfisTableHeaderText}>MOTIVO</span>
                  </div>
                  <div className={styles.perfisTableCellData}>
                    <span className={styles.perfisTableHeaderText}>
                      DESATIVADO EM
                    </span>
                  </div>
                </>
              ) : null}
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
                // Em "Todos" o esmaecido distingue os inativos; em "Inativos" só atrapalharia a leitura.
                const fadeRow = isInactive && status === 'all'

                return (
                  <div
                    key={user.id}
                    className={`${styles.perfisTableRow} ${
                      fadeRow ? styles.perfisTableRowInactive : ''
                    }`}
                  >
                    <div className={styles.perfisTableRowContent}>
                      <div className={styles.perfisTableCellNome}>
                        <span className={styles.perfisTableCellText}>
                          {displayName}
                        </span>
                        {isInactive && status === 'all' && (
                          <span
                            className={`${styles.perfisBadge} ${styles.perfisBadgeInativo}`}
                          >
                            Inativo
                          </span>
                        )}
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
                      {showDeactivation ? (
                        <>
                          <div className={styles.perfisTableCellMotivo}>
                            <span
                              className={styles.perfisTableCellText}
                              title={
                                user.deactivation_reason
                                  ? DEACTIVATION_REASON_LABELS[
                                      user.deactivation_reason
                                    ]
                                  : undefined
                              }
                            >
                              {user.deactivation_reason
                                ? DEACTIVATION_REASON_LABELS[
                                    user.deactivation_reason
                                  ]
                                : '—'}
                            </span>
                          </div>
                          <div className={styles.perfisTableCellData}>
                            <span
                              className={`${styles.perfisTableCellText} ${styles.perfisTabular}`}
                            >
                              {isInactive
                                ? formatDate(user.deactivated_at)
                                : '—'}
                            </span>
                          </div>
                        </>
                      ) : null}
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
