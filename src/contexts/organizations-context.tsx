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
import type { Organization } from '@/models/entities'

interface OrganizationsContextProps {
  formDialogDisclosure: UseDisclosureReturn
  deleteAlertDisclosure: UseDisclosureReturn
  dialogInitialData: Pick<Organization, 'id'> | null
  setDialogInitialData: Dispatch<
    SetStateAction<Pick<Organization, 'id'> | null>
  >
  onDeleteOrganizationProps: Pick<Organization, 'id' | 'name'> | null
  setOnDeleteOrganizationProps: Dispatch<
    SetStateAction<Pick<Organization, 'id' | 'name'> | null>
  >
}

export const OrganizationsContext = createContext(
  {} as OrganizationsContextProps,
)

interface OrganizationsContextProviderProps {
  children: ReactNode
}

export const organizationFormSchema = z.object({
  name: z.string().min(1, { message: 'Campo obrigatório' }),
  organizationType: z.string().min(1, { message: 'Campo obrigatório' }),
  acronym: z.string().min(1, { message: 'Campo obrigatório' }),
  jurisdictionLevel: z.string().min(1, { message: 'Campo obrigatório' }),
})

export type OrganizationForm = z.infer<typeof organizationFormSchema>

export function OrganizationsContextProvider({
  children,
}: OrganizationsContextProviderProps) {
  const formDialogDisclosure = useDisclosure()
  const deleteAlertDisclosure = useDisclosure()
  const [dialogInitialData, setDialogInitialData] = useState<Pick<
    Organization,
    'id'
  > | null>(null)
  const [onDeleteOrganizationProps, setOnDeleteOrganizationProps] =
    useState<Pick<Organization, 'id' | 'name'> | null>(null)

  return (
    <OrganizationsContext.Provider
      value={{
        formDialogDisclosure,
        deleteAlertDisclosure,
        dialogInitialData,
        setDialogInitialData,
        onDeleteOrganizationProps,
        setOnDeleteOrganizationProps,
      }}
    >
      {children}
    </OrganizationsContext.Provider>
  )
}
