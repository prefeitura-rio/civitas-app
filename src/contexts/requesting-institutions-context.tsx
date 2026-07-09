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
import type { RequestingInstitution } from '@/models/entities'

interface RequestingInstitutionsContextProps {
  formDialogDisclosure: UseDisclosureReturn
  deleteAlertDisclosure: UseDisclosureReturn
  dialogInitialData: Pick<RequestingInstitution, 'id'> | null
  setDialogInitialData: Dispatch<
    SetStateAction<Pick<RequestingInstitution, 'id'> | null>
  >
  onDeleteRequestingInstitutionProps: Pick<
    RequestingInstitution,
    'id' | 'name'
  > | null
  setOnDeleteRequestingInstitutionProps: Dispatch<
    SetStateAction<Pick<RequestingInstitution, 'id' | 'name'> | null>
  >
}

export const RequestingInstitutionsContext = createContext(
  {} as RequestingInstitutionsContextProps,
)

interface RequestingInstitutionsContextProviderProps {
  children: ReactNode
}

const jurisdictionLevels = [
  'municipal',
  'estadual',
  'distrital',
  'federal',
  'outros',
] as const

export const requestingInstitutionFormSchema = z.object({
  name: z.string().min(1, { message: 'Campo obrigatório' }),
  type: z.string().min(1, { message: 'Campo obrigatório' }),
  agency: z.string().min(1, { message: 'Campo obrigatório' }),
  jurisdictionLevel: z.enum(jurisdictionLevels, {
    message: 'Campo obrigatório',
  }),
})

export type RequestingInstitutionForm = z.infer<
  typeof requestingInstitutionFormSchema
>

export function RequestingInstitutionsContextProvider({
  children,
}: RequestingInstitutionsContextProviderProps) {
  const formDialogDisclosure = useDisclosure()
  const deleteAlertDisclosure = useDisclosure()
  const [dialogInitialData, setDialogInitialData] = useState<Pick<
    RequestingInstitution,
    'id'
  > | null>(null)
  const [
    onDeleteRequestingInstitutionProps,
    setOnDeleteRequestingInstitutionProps,
  ] = useState<Pick<RequestingInstitution, 'id' | 'name'> | null>(null)

  return (
    <RequestingInstitutionsContext.Provider
      value={{
        formDialogDisclosure,
        deleteAlertDisclosure,
        dialogInitialData,
        setDialogInitialData,
        onDeleteRequestingInstitutionProps,
        setOnDeleteRequestingInstitutionProps,
      }}
    >
      {children}
    </RequestingInstitutionsContext.Provider>
  )
}
