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
  dialogInitialData: Pick<MonitoredPlate, 'plate'> | null
  setDialogInitialData: Dispatch<
    SetStateAction<Pick<MonitoredPlate, 'plate'> | null>
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

const monitoredPlateFormBaseSchema = z.object({
  plate: z
    .string()
    .min(1, { message: '' })
    .toUpperCase()
    .regex(/^[A-Z]{3}\d[A-Z\d]\d{2}$/, 'Formato inválido'),
  numeroControle: z.string().min(1, { message: 'Campo obrigatório' }),
  operation: z.object({
    id: z.string(),
    title: z.string(),
  }),
  demandantLinkReference: z
    .string()
    .max(50, { message: 'No máximo 50 caracteres' }),
  demandantLinkValidUntil: z.string().optional(),
  active: z.boolean().default(true),
  notes: z.string(),
  /** Notas do vínculo placa–demandante (só no POST). */
  contactInfo: z.string(),
  additionalInfo: z.unknown().optional(),
  notificationChannels: z
    .object({
      label: z.string().min(1, { message: 'Campo obrigatório' }),
      value: z.string().min(1, { message: 'Campo obrigatório' }),
    })
    .array()
    .default([]),
})

export const monitoredPlateFormSchema =
  monitoredPlateFormBaseSchema.superRefine((data, ctx) => {
    if (data.operation.id.trim() !== '') {
      const ref = data.demandantLinkReference?.trim()
      if (!ref) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Obrigatório ao selecionar um demandante',
          path: ['demandantLinkReference'],
        })
      }
    }
  })

export type MonitoredPlateForm = z.infer<typeof monitoredPlateFormBaseSchema>

export function MonitoredPlatesContextProvider({
  children,
}: MonitoredPlatesContextProviderProps) {
  const formDialogDisclosure = useDisclosure()
  const deleteAlertDisclosure = useDisclosure()
  const [dialogInitialData, setDialogInitialData] = useState<Pick<
    MonitoredPlate,
    'plate'
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
