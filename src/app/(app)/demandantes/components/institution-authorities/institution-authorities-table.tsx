'use client'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { Copy, PencilLine, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'
import { useProfile } from '@/hooks/useQueries/useProfile'
import {
  getInstitutionAuthorities,
  type InstitutionAuthority,
} from '@/http/institution-authorities'
import { getRequestingInstitutions } from '@/http/requesting-institutions'
import { notAllowed } from '@/utils/template-messages'

function getPrimaryPhone(authority: InstitutionAuthority) {
  return (
    authority.primaryContact?.phone?.phone ??
    authority.contacts?.phones.find((item) => item.isPrimary)?.phone ??
    authority.contacts?.phones.at(0)?.phone
  )
}

function getPrimaryEmail(authority: InstitutionAuthority) {
  return (
    authority.primaryContact?.email?.email ??
    authority.contacts?.emails.find((item) => item.isPrimary)?.email ??
    authority.contacts?.emails.at(0)?.email
  )
}

function formatPhoneForDisplay(value: string) {
  const digits = value.replace(/\D/g, '')
  const withoutCountryCode = digits.startsWith('55') ? digits.slice(2) : digits

  if (withoutCountryCode.length === 11) {
    return `(${withoutCountryCode.slice(0, 2)}) ${withoutCountryCode.slice(
      2,
      7,
    )}-${withoutCountryCode.slice(7)}`
  }

  if (withoutCountryCode.length === 10) {
    return `(${withoutCountryCode.slice(0, 2)}) ${withoutCountryCode.slice(
      2,
      6,
    )}-${withoutCountryCode.slice(6)}`
  }

  return value.replace(/^\+55\s*/, '')
}

async function copyContact(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copiado.`)
  } catch {
    toast.error('Não foi possível copiar o contato.')
  }
}

function ContactValue({
  label,
  value,
  displayValue = value,
}: {
  label: string
  value?: string
  displayValue?: string
}) {
  if (!value) return null

  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="shrink-0 text-muted-foreground">{label}:</span>
      <span className="truncate">{displayValue}</span>
      <Tooltip text={`Copiar ${label.toLowerCase()}`} asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => copyContact(value, label)}
        >
          <span className="sr-only">Copiar {label.toLowerCase()}</span>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </Tooltip>
    </div>
  )
}

function ContactsCell({ authority }: { authority: InstitutionAuthority }) {
  const phone = getPrimaryPhone(authority)
  const email = getPrimaryEmail(authority)

  if (!phone && !email) return '—'

  return (
    <div className="flex max-w-[18rem] flex-col gap-1">
      <ContactValue
        label="Telefone"
        value={phone}
        displayValue={phone ? formatPhoneForDisplay(phone) : undefined}
      />
      <ContactValue label="E-mail" value={email} />
    </div>
  )
}

export function InstitutionAuthoritiesTable() {
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteInstitutionAuthorityProps,
    deleteAlertDisclosure,
  } = useInstitutionAuthorities()
  const { data: profile } = useProfile()

  const { data: response, isLoading } = useQuery({
    queryKey: ['institution-authorities', page, size],
    queryFn: () => getInstitutionAuthorities({ page, size }),
  })

  const { data: requestingInstitutionsResponse } = useQuery({
    queryKey: ['requesting-institutions', 'options', 100],
    queryFn: () => getRequestingInstitutions({ page: 1, size: 100 }),
  })

  const requestingInstitutionsById = useMemo(
    () =>
      new Map(
        (requestingInstitutionsResponse?.data.items ?? []).map((item) => [
          item.id,
          item.name,
        ]),
      ),
    [requestingInstitutionsResponse?.data.items],
  )

  const data = response?.data

  const columns: ColumnDef<InstitutionAuthority>[] = [
    {
      accessorKey: 'name',
      header: 'Requisitante',
    },
    {
      id: 'requestingInstitution',
      header: 'Demandante',
      cell: ({ row }) =>
        requestingInstitutionsById.get(row.original.requestingInstitutionId) ??
        '—',
    },
    {
      accessorKey: 'isFocalPoint',
      header: 'Ponto focal',
      cell: ({ row }) => (row.original.isFocalPoint ? 'Sim' : 'Não'),
    },
    {
      id: 'contacts',
      header: 'Contatos',
      cell: ({ row }) => <ContactsCell authority={row.original} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Criado em',
      cell: ({ row }) =>
        row.original.createdAt
          ? formatDate(row.original.createdAt, 'dd/MM/yyyy HH:mm')
          : '—',
    },
    {
      id: 'actions',
      header: () => (
        <div className="flex justify-end">
          <p className="w-[4.5rem] text-center">Ações</p>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Tooltip
              text="Editar"
              disabledText={notAllowed}
              disabled={!profile?.is_admin}
              asChild
            >
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setDialogInitialData({ id: row.original.id })
                  formDialogDisclosure.onOpen()
                }}
                disabled={!profile?.is_admin}
              >
                <span className="sr-only">Editar</span>
                <PencilLine className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip
              text="Excluir"
              disabledText={notAllowed}
              disabled={!profile?.is_admin}
              asChild
            >
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setOnDeleteInstitutionAuthorityProps({
                    id: row.original.id,
                    name: row.original.name,
                  })
                  deleteAlertDisclosure.onOpen()
                }}
                disabled={!profile?.is_admin}
              >
                <span className="sr-only">Excluir</span>
                <Trash className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
      />
      {data && (
        <Pagination
          page={data.page}
          total={data.total}
          size={data.size}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
