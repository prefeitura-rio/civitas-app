'use client'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react'
import { isPossiblePhoneNumber } from 'react-phone-number-input'
import { z } from 'zod'

import { useDisclosure, type UseDisclosureReturn } from '@/hooks/use-disclosure'
import type { InstitutionAuthority } from '@/models/entities'

interface InstitutionAuthoritiesContextProps {
  formDialogDisclosure: UseDisclosureReturn
  deleteAlertDisclosure: UseDisclosureReturn
  dialogInitialData: Pick<InstitutionAuthority, 'id'> | null
  setDialogInitialData: Dispatch<
    SetStateAction<Pick<InstitutionAuthority, 'id'> | null>
  >
  onDeleteInstitutionAuthorityProps: Pick<
    InstitutionAuthority,
    'id' | 'name'
  > | null
  setOnDeleteInstitutionAuthorityProps: Dispatch<
    SetStateAction<Pick<InstitutionAuthority, 'id' | 'name'> | null>
  >
}

export const InstitutionAuthoritiesContext = createContext(
  {} as InstitutionAuthoritiesContextProps,
)

interface InstitutionAuthoritiesContextProviderProps {
  children: ReactNode
}

function hasAtMostOnePrimary<T extends { isPrimary: boolean }>(items: T[]) {
  return items.filter((item) => item.isPrimary).length <= 1
}

function normalizePhoneForComparison(value: string) {
  return value.replace(/\D/g, '')
}

const authorityContactPhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, { message: 'Campo obrigatório' })
    .refine((value) => isPossiblePhoneNumber(value), {
      message: 'Telefone inválido',
    }),
  isPrimary: z.boolean(),
})

const authorityContactEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Campo obrigatório' })
    .email({ message: 'E-mail inválido' }),
  isPrimary: z.boolean(),
})

export const institutionAuthorityFormSchema = z
  .object({
    requestingInstitutionId: z
      .string()
      .min(1, { message: 'Campo obrigatório' }),
    name: z.string().trim().min(1, { message: 'Campo obrigatório' }),
    isFocalPoint: z.boolean(),
    phones: z
      .array(authorityContactPhoneSchema)
      .min(1, { message: 'Campo obrigatório' }),
    emails: z
      .array(authorityContactEmailSchema)
      .min(1, { message: 'Campo obrigatório' }),
  })
  .superRefine((values, ctx) => {
    const seenPhones = new Map<string, number>()

    values.phones.forEach((item, index) => {
      const phone = normalizePhoneForComparison(item.phone)
      if (!phone) return

      const firstIndex = seenPhones.get(phone)

      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Telefone já cadastrado para este requisitante',
          path: ['phones', index, 'phone'],
        })
        return
      }

      seenPhones.set(phone, index)
    })

    if (!hasAtMostOnePrimary(values.phones)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Apenas um telefone pode ser principal',
        path: ['phones'],
      })
    }

    if (!hasAtMostOnePrimary(values.emails)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Apenas um e-mail pode ser principal',
        path: ['emails'],
      })
    }
  })

export type InstitutionAuthorityForm = z.infer<
  typeof institutionAuthorityFormSchema
>

export function InstitutionAuthoritiesContextProvider({
  children,
}: InstitutionAuthoritiesContextProviderProps) {
  const formDialogDisclosure = useDisclosure()
  const deleteAlertDisclosure = useDisclosure()
  const [dialogInitialData, setDialogInitialData] = useState<Pick<
    InstitutionAuthority,
    'id'
  > | null>(null)
  const [
    onDeleteInstitutionAuthorityProps,
    setOnDeleteInstitutionAuthorityProps,
  ] = useState<Pick<InstitutionAuthority, 'id' | 'name'> | null>(null)

  return (
    <InstitutionAuthoritiesContext.Provider
      value={{
        formDialogDisclosure,
        deleteAlertDisclosure,
        dialogInitialData,
        setDialogInitialData,
        onDeleteInstitutionAuthorityProps,
        setOnDeleteInstitutionAuthorityProps,
      }}
    >
      {children}
    </InstitutionAuthoritiesContext.Provider>
  )
}
