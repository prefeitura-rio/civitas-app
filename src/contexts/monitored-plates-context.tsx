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
import type { MonitoredPlate } from '@/models/entities'

interface MonitoredPlatesContextProps {
  formDialogDisclosure: UseDisclosureReturn
  deleteAlertDisclosure: UseDisclosureReturn
  dialogInitialData: Pick<MonitoredPlate, 'id'> | null
  setDialogInitialData: Dispatch<
    SetStateAction<Pick<MonitoredPlate, 'id'> | null>
  >
  onDeleteMonitoredPlateProps: Pick<MonitoredPlate, 'plate'> | null
  setOnDeleteMonitoredPlateProps: Dispatch<
    SetStateAction<Pick<MonitoredPlate, 'plate'> | null>
  >
}

export const MonitoredPlatesContext = createContext(
  {} as MonitoredPlatesContextProps,
)

interface MonitoredPlatesContextProviderProps {
  children: ReactNode
}

export const monitoredPlateFormSchema = z.object({
  plate: z.string().min(1, { message: 'Campo obrigatório' }),
  operation: z.object({
    id: z.string().min(1, { message: 'Campo obrigatório' }),
    title: z.string().min(1, { message: 'Campo obrigatório' }),
  }),
  active: z.boolean().default(true),
  notes: z.string(),
  additionalInfo: z.unknown(),
  notificationChannels: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .array()
    .nonempty({ message: 'Pelo menos um canal deve ser selecionado' }),
})

export type MonitoredPlateForm = z.infer<typeof monitoredPlateFormSchema>

export function MonitoredPlatesContextProvider({
  children,
}: MonitoredPlatesContextProviderProps) {
  const formDialogDisclosure = useDisclosure()
  const deleteAlertDisclosure = useDisclosure()
  const [dialogInitialData, setDialogInitialData] = useState<Pick<
    MonitoredPlate,
    'id'
  > | null>(null)
  const [onDeleteMonitoredPlateProps, setOnDeleteMonitoredPlateProps] =
    useState<Pick<MonitoredPlate, 'plate'> | null>(null)

  return (
    <MonitoredPlatesContext.Provider
      value={{
        formDialogDisclosure,
        deleteAlertDisclosure,
        dialogInitialData,
        setDialogInitialData,
        onDeleteMonitoredPlateProps,
        setOnDeleteMonitoredPlateProps,
      }}
    >
      {children}
    </MonitoredPlatesContext.Provider>
  )
}
