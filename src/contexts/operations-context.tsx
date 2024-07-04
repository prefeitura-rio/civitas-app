'use client'
import { createContext, type ReactNode } from 'react'
import { z } from 'zod'

import { useDisclosure, type UseDisclosureReturn } from '@/hooks/use-disclosure'

interface OperationsContextProps {
  createDialogDisclosure: UseDisclosureReturn
}

export const OperationsContext = createContext({} as OperationsContextProps)

interface OperationsContextProviderProps {
  children: ReactNode
}

export const createOperationFormSchema = z.object({
  title: z.string(),
  description: z.string(),
})

export type CreateOperationForm = z.infer<typeof createOperationFormSchema>

export function OperationsContextProvider({
  children,
}: OperationsContextProviderProps) {
  const createDialogDisclosure = useDisclosure()

  return (
    <OperationsContext.Provider
      value={{
        createDialogDisclosure,
      }}
    >
      {children}
    </OperationsContext.Provider>
  )
}
