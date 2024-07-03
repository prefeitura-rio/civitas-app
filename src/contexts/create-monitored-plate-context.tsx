import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, ReactNode, useState } from 'react'
import {
  useFieldArray,
  UseFieldArrayReturn,
  useForm,
  UseFormReturn,
} from 'react-hook-form'
import { z } from 'zod'

export const createMonitoredPlateFormSchema = z.object({
  plate: z
    .string()
    .min(1, { message: 'Campo obrigatório' })
    .regex(/^[A-Z]{3}\d[A-Z\d]\d{2}$/, 'Formato inválido')
    .transform((item) => item.toUpperCase()),
  operation: z.string().min(1, { message: 'Campo obrigatório' }),
  notificationChannels: z.array(
    z.object({
      channel: z.string().min(1, { message: 'Esse campo não pode ser vazio.' }),
    }),
  ),
})

export type CreateMonitoredPlateForm = z.infer<
  typeof createMonitoredPlateFormSchema
>

interface CreateOrderFormContextProps {
  formMethods: UseFormReturn<CreateMonitoredPlateForm>
  fieldArrayMethods: UseFieldArrayReturn<CreateMonitoredPlateForm>
  openDialog: boolean
  handleOpenDialog: (open: boolean) => void
}

export const CreateOrderFormContext = createContext(
  {} as CreateOrderFormContextProps,
)

export interface CreateOrderFormProvierProps {
  children: ReactNode
}

export function CreateOrderFormProvider({
  children,
}: CreateOrderFormProvierProps) {
  const [openDialog, setOpenDialog] = useState(false)

  const formMethods = useForm<CreateMonitoredPlateForm>({
    resolver: zodResolver(createMonitoredPlateFormSchema),
    defaultValues: {
      notificationChannels: [],
      plate: '',
    },
  })
  const { control } = formMethods

  const fieldArrayMethods = useFieldArray({
    control,
    name: 'notificationChannels',
  })

  function handleOpenDialog(open: boolean) {
    setOpenDialog(open)
  }
  return (
    <CreateOrderFormContext.Provider
      value={{
        fieldArrayMethods,
        formMethods,
        openDialog,
        handleOpenDialog,
      }}
    >
      {children}
    </CreateOrderFormContext.Provider>
  )
}
