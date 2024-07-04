'use client'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react'
import { z } from 'zod'

import { useDisclosure, type UseDisclosureReturn } from '@/hooks/use-disclosure'
import type { Operation } from '@/models/entities'

interface OperationsContextProps {
  formDialogDisclosure: UseDisclosureReturn
  deleteAlertDisclosure: UseDisclosureReturn
  dialogInitialData: Pick<Operation, 'id'> | null
  setDialogInitialData: Dispatch<SetStateAction<Pick<Operation, 'id'> | null>>
  onDeleteOperationProps: Pick<Operation, 'id' | 'title'> | null
  setOnDeleteOperationProps: Dispatch<
    SetStateAction<Pick<Operation, 'id' | 'title'> | null>
  >
}

export const OperationsContext = createContext({} as OperationsContextProps)

interface OperationsContextProviderProps {
  children: ReactNode
}

export const operationFormSchema = z.object({
  title: z.string().min(1, { message: 'Campo obrigatório' }),
  description: z.string(),
})

export type OperationForm = z.infer<typeof operationFormSchema>

export function OperationsContextProvider({
  children,
}: OperationsContextProviderProps) {
  const formDialogDisclosure = useDisclosure()
  const deleteAlertDisclosure = useDisclosure()
  const [dialogInitialData, setDialogInitialData] = useState<Pick<
    Operation,
    'id'
  > | null>(null)
  const [onDeleteOperationProps, setOnDeleteOperationProps] = useState<Pick<
    Operation,
    'id' | 'title'
  > | null>(null)

  return (
    <OperationsContext.Provider
      value={{
        formDialogDisclosure,
        deleteAlertDisclosure,
        dialogInitialData,
        setDialogInitialData,
        onDeleteOperationProps,
        setOnDeleteOperationProps,
      }}
    >
      {children}
    </OperationsContext.Provider>
  )
}
