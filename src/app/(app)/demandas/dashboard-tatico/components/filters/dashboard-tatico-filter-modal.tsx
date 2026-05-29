'use client'

import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { getTicketTypes } from '@/http/ticket-types/get-ticket.types'
import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'
import {
  searchOperations,
  searchRequesters,
} from '@/http/tickets/tickets-dashboard-filters'

import {
  DASHBOARD_TATICO_PRIORITY_OPTIONS,
  emptyDashboardTaticoAdvancedFilters,
} from './constants'
import styles from './dashboard-tatico-filter-modal.module.css'
import { DashboardTaticoPressRelevanceField } from './dashboard-tatico-press-relevance-field'
import { DashboardTaticoSearchMultiSelect } from './dashboard-tatico-search-multi-select'
import type {
  DashboardTaticoAdvancedFilterForm,
  DashboardTaticoFilterScope,
} from './types'

export type DashboardTaticoFilterModalProps = {
  isOpen: boolean
  onClose: () => void
  filters: DashboardTaticoAdvancedFilterForm
  onApply: (filters: DashboardTaticoAdvancedFilterForm) => void
  scope: DashboardTaticoFilterScope
  statusOptions: SearchOption[]
  priorityOptions?: SearchOption[]
}

export function DashboardTaticoFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  scope,
  statusOptions,
  priorityOptions = DASHBOARD_TATICO_PRIORITY_OPTIONS,
}: DashboardTaticoFilterModalProps) {
  const [draftFilters, setDraftFilters] =
    useState<DashboardTaticoAdvancedFilterForm>(filters)

  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filters)
    }
  }, [isOpen, filters])

  const { data: ticketTypeOptions, isFetching: isTicketTypesLoading } =
    useQuery({
      queryKey: ['ticket-types', 'dashboard-tatico-filter', scope],
      queryFn: async () => {
        const response = await getTicketTypes({ isActive: true })
        return (response.data ?? []).map((item) => ({
          value: item.id,
          label: item.name,
        }))
      },
      enabled: isOpen,
      staleTime: 1000 * 60 * 5,
    })

  const handleApply = () => {
    onApply(draftFilters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className={styles.filterModalOverlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className={styles.filterModal}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros avançados"
      >
        <div className={styles.filterModalHeader}>
          <div className={styles.filterModalTitle} />
          <button
            type="button"
            className={styles.filterModalClose}
            onClick={onClose}
            aria-label="Fechar filtros"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.filterModalBody}>
          <div className={styles.filterGrid}>
            <DashboardTaticoSearchMultiSelect
              scope={scope}
              label="DEMANDANTE"
              value={draftFilters.demandante_id}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  demandante_id: value,
                }))
              }
              searchFn={searchOperations}
            />

            <DashboardTaticoSearchMultiSelect
              scope={scope}
              label="REQUISITANTE"
              value={draftFilters.requisitante}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  requisitante: value,
                }))
              }
              searchFn={searchRequesters}
            />

            <DashboardTaticoSearchMultiSelect
              scope={scope}
              label="URGÊNCIA"
              placeholder="Selecione"
              value={draftFilters.prioridade}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  prioridade: value,
                }))
              }
              staticOptions={priorityOptions}
            />

            <DashboardTaticoSearchMultiSelect
              scope={scope}
              label="STATUS DO CHAMADO"
              placeholder="Selecione"
              value={draftFilters.status}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  status: value,
                }))
              }
              staticOptions={statusOptions}
            />

            <DashboardTaticoSearchMultiSelect
              scope={scope}
              label="TIPO DE CHAMADO"
              placeholder="Selecione"
              value={draftFilters.tipo_chamado_id}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  tipo_chamado_id: value,
                }))
              }
              staticOptions={ticketTypeOptions ?? []}
              optionsLoading={isTicketTypesLoading}
            />
          </div>

          <div className={styles.filterTogglesGrid}>
            <DashboardTaticoPressRelevanceField
              scope={scope}
              value={draftFilters.relevanteImprensa}
              onChange={(relevanteImprensa) =>
                setDraftFilters((current) => ({
                  ...current,
                  relevanteImprensa,
                }))
              }
            />
          </div>
        </div>

        <div className={styles.filterModalFooter}>
          <Button
            type="button"
            className={styles.filterSecondaryButton}
            onClick={() =>
              setDraftFilters(emptyDashboardTaticoAdvancedFilters())
            }
          >
            Limpar Filtro
          </Button>
          <Button
            type="button"
            className={styles.filterPrimaryButton}
            onClick={handleApply}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}
