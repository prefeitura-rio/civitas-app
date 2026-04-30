'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { config } from '@/config'
import {
  clearChamadosImpersonationStorage,
  getChamadosImpersonateUserId,
  getChamadosImpersonateUserLabel,
  setChamadosImpersonationStorage,
} from '@/lib/chamados-impersonation-storage'

type ChamadosImpersonationContextValue = {
  subjectUserId: string | null
  subjectLabel: string | null
  setImpersonation: (id: string, label: string) => void
  clearImpersonation: () => void
}

const ChamadosImpersonationContext =
  createContext<ChamadosImpersonationContextValue | null>(null)

export function ChamadosImpersonationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const [subjectUserId, setSubjectUserId] = useState<string | null>(null)
  const [subjectLabel, setSubjectLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!config.enableImpersonation) return
    setSubjectUserId(getChamadosImpersonateUserId())
    setSubjectLabel(getChamadosImpersonateUserLabel())
  }, [])

  const invalidateChamadosQueries = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['tickets'],
      refetchType: 'active',
    })
  }, [queryClient])

  const setImpersonation = useCallback(
    (id: string, label: string) => {
      setChamadosImpersonationStorage(id, label)
      setSubjectUserId(id)
      setSubjectLabel(label)
      invalidateChamadosQueries()
    },
    [invalidateChamadosQueries],
  )

  const clearImpersonation = useCallback(() => {
    clearChamadosImpersonationStorage()
    setSubjectUserId(null)
    setSubjectLabel(null)
    invalidateChamadosQueries()
  }, [invalidateChamadosQueries])

  const value = useMemo(
    () => ({
      subjectUserId,
      subjectLabel,
      setImpersonation,
      clearImpersonation,
    }),
    [subjectUserId, subjectLabel, setImpersonation, clearImpersonation],
  )

  return (
    <ChamadosImpersonationContext.Provider value={value}>
      {children}
    </ChamadosImpersonationContext.Provider>
  )
}

export function useChamadosImpersonation(): ChamadosImpersonationContextValue {
  const ctx = useContext(ChamadosImpersonationContext)
  if (!ctx) {
    return {
      subjectUserId: null,
      subjectLabel: null,
      setImpersonation: () => {},
      clearImpersonation: () => {},
    }
  }
  return ctx
}
