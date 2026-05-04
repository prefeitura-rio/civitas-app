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
import type { Demandant } from '@/models/entities'

interface DemandantsContextProps {
  formDialogDisclosure: UseDisclosureReturn
  deleteAlertDisclosure: UseDisclosureReturn
  dialogInitialData: Pick<Demandant, 'id'> | null
  setDialogInitialData: Dispatch<SetStateAction<Pick<Demandant, 'id'> | null>>
  onDeleteDemandantProps: Pick<Demandant, 'id' | 'name'> | null
  setOnDeleteDemandantProps: Dispatch<
    SetStateAction<Pick<Demandant, 'id' | 'name'> | null>
  >
}

export const DemandantsContext = createContext({} as DemandantsContextProps)

interface DemandantsContextProviderProps {
  children: ReactNode
}

export const demandantFormSchema = z.object({
  organizationId: z.string().min(1, { message: 'Campo obrigatório' }),
  name: z.string(),
  email: z.string(),
  phone1: z.string(),
  phone2: z.string(),
  phone3: z.string(),
})

export type DemandantForm = z.infer<typeof demandantFormSchema>

export function DemandantsContextProvider({
  children,
}: DemandantsContextProviderProps) {
  const formDialogDisclosure = useDisclosure()
  const deleteAlertDisclosure = useDisclosure()
  const [dialogInitialData, setDialogInitialData] = useState<Pick<
    Demandant,
    'id'
  > | null>(null)
  const [onDeleteDemandantProps, setOnDeleteDemandantProps] = useState<Pick<
    Demandant,
    'id' | 'name'
  > | null>(null)

  return (
    <DemandantsContext.Provider
      value={{
        formDialogDisclosure,
        deleteAlertDisclosure,
        dialogInitialData,
        setDialogInitialData,
        onDeleteDemandantProps,
        setOnDeleteDemandantProps,
      }}
    >
      {children}
    </DemandantsContext.Provider>
  )
}
