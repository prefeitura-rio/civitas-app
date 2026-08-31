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
  name: z
    .string()
    .trim()
    .min(3, { message: 'Mínimo de 3 caracteres' })
    .max(120, { message: 'Máximo de 120 caracteres' }),
  type: z
    .string()
    .trim()
    .min(2, { message: 'Mínimo de 2 caracteres' })
    .max(80, { message: 'Máximo de 80 caracteres' }),
  agency: z
    .string()
    .trim()
    .min(2, { message: 'Mínimo de 2 caracteres' })
    .max(80, { message: 'Máximo de 80 caracteres' }),
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
