'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { InstitutionAuthorityFormDialog } from '@/app/(app)/demandantes/components/institution-authorities/institution-authority-dialogs/components/institution-authority-form-dialog'
import { InputError } from '@/components/custom/input-error'
import MultipleSelector from '@/components/custom/multiselect-with-search'
import {
  SelectWithSearch,
  type SelectWithSearchFetchPageArgs,
} from '@/components/custom/select-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'
import { getInstitutionAuthorities } from '@/http/institution-authorities'
import { getRequestingInstitutions } from '@/http/requesting-institutions'
import type {
  InstitutionAuthority,
  NotificationChannel,
} from '@/models/entities'

import { AuthorityLinkDialogShell } from './authority-link-dialog-shell'
import { MonitoredPlateAuthorityCollectionPointField } from './monitored-plate-authority-collection-point-field'
import {
  getDefaultMonitoredPlateAuthorityValidUntil,
  isMonitoredPlateAuthorityValidUntilBeyondMax,
  isMonitoredPlateAuthorityValidUntilExpired,
  MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE,
  toMonitoredPlateAuthorityValidUntilIso,
} from './monitored-plate-authority-link-datetime'
import { MonitoredPlateAuthorityValidUntilPicker } from './monitored-plate-authority-link-valid-until-picker'

export interface MonitoredPlateAuthorityDraftCreatePayload {
  institutionAuthorityId: string
  institutionAuthorityName?: string
  requestingInstitutionName?: string
  referenceNumber: string
  requestedAt: string
  validUntil: string
  active: boolean
  monitorAllCollectionPoints: boolean
  notificationChannelIds: string[]
  collectionPointIds?: string[]
}

interface MonitoredPlateAuthorityLinkCreateDialogProps {
  plate: string
  open: boolean
  onOpenChange: (open: boolean) => void
  notificationChannels: NotificationChannel[]
  reservedAuthorityIds: string[]
  plateDescription: string
  onCreate: (
    payload: MonitoredPlateAuthorityDraftCreatePayload,
  ) => void | Promise<void>
  submitLabel?: string
  successMessage?: string
  disabled?: boolean
  isSubmitting?: boolean
}

export function MonitoredPlateAuthorityLinkCreateDialog({
  plate,
  open,
  onOpenChange,
  notificationChannels,
  reservedAuthorityIds,
  plateDescription,
  onCreate,
  submitLabel = 'Adicionar vínculo',
  successMessage = 'Vínculo incluído no cadastro.',
  disabled = false,
  isSubmitting = false,
}: MonitoredPlateAuthorityLinkCreateDialogProps) {
  const { formDialogDisclosure, setDialogInitialData } =
    useInstitutionAuthorities()
  const [requestingInstitutionTitle, setRequestingInstitutionTitle] =
    useState('')
  const [requestingInstitutionId, setRequestingInstitutionId] = useState('')
  const [authorityTitle, setAuthorityTitle] = useState('')
  const [authorityId, setAuthorityId] = useState('')
  const [reference, setReference] = useState('')
  const [requestedAt, setRequestedAt] = useState<Date | undefined>()
  const [validUntilDate, setValidUntilDate] = useState<Date | undefined>()
  const [active, setActive] = useState(true)
  const [notificationChannelIds, setNotificationChannelIds] = useState<
    string[]
  >([])
  const [monitorAll, setMonitorAll] = useState(true)
  const [collectionPointIds, setCollectionPointIds] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<{
    authorityId?: string
    reference?: string
    requestedAt?: string
    validUntil?: string
    notificationChannelIds?: string
  }>({})

  const authoritiesByIdRef = useRef(new Map<string, InstitutionAuthority>())
  const reservedAuthorityIdsSet = useMemo(
    () => new Set(reservedAuthorityIds),
    [reservedAuthorityIds],
  )

  useEffect(() => {
    if (!open) {
      setRequestingInstitutionTitle('')
      setRequestingInstitutionId('')
      setAuthorityTitle('')
      setAuthorityId('')
      setReference('')
      setRequestedAt(undefined)
      setValidUntilDate(undefined)
      setActive(true)
      setNotificationChannelIds([])
      setMonitorAll(true)
      setCollectionPointIds([])
      setFieldErrors({})
      return
    }

    setRequestedAt(new Date())
    setValidUntilDate(getDefaultMonitoredPlateAuthorityValidUntil())
  }, [open])

  async function fetchRequestingInstitutionPage({
    page,
    size,
    search,
  }: SelectWithSearchFetchPageArgs) {
    const response = await getRequestingInstitutions({
      page,
      size,
      search: search || undefined,
    })

    return {
      items: response.data.items.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      page: response.data.page,
      pages: response.data.pages,
    }
  }

  async function fetchInstitutionAuthorityPage({
    page,
    size,
    search,
  }: SelectWithSearchFetchPageArgs) {
    const response = await getInstitutionAuthorities({
      page,
      size,
      search: search || undefined,
      requestingInstitutionId: requestingInstitutionId || undefined,
    })

    response.data.items.forEach((item) => {
      authoritiesByIdRef.current.set(item.id, item)
    })

    return {
      items: response.data.items
        .filter((item) => !reservedAuthorityIdsSet.has(item.id))
        .map((item) => ({
          label: item.requestingInstitution
            ? `${item.name} — ${item.requestingInstitution.name}`
            : item.name,
          value: item.id,
        })),
      page: response.data.page,
      pages: response.data.pages,
    }
  }

  const notificationChannelOptions = useMemo(
    () =>
      notificationChannels.map((item) => ({
        label: item.title || item.id,
        value: item.id,
      })),
    [notificationChannels],
  )

  async function handleSubmit() {
    const ref = reference.trim()
    const nextErrors = {
      authorityId: authorityId ? undefined : 'Campo obrigatório',
      reference: ref ? undefined : 'Campo obrigatório',
      requestedAt: requestedAt ? undefined : 'Campo obrigatório',
      validUntil: validUntilDate ? undefined : 'Campo obrigatório',
      notificationChannelIds:
        notificationChannelIds.length > 0 ? undefined : 'Campo obrigatório',
    }

    setFieldErrors(nextErrors)

    if (
      nextErrors.authorityId ||
      nextErrors.reference ||
      nextErrors.requestedAt ||
      nextErrors.validUntil ||
      nextErrors.notificationChannelIds
    ) {
      return
    }

    if (isMonitoredPlateAuthorityValidUntilBeyondMax(validUntilDate)) {
      toast.error(
        'A data de validade não pode ser superior a 60 dias a partir de hoje.',
      )
      return
    }

    if (active && isMonitoredPlateAuthorityValidUntilExpired(validUntilDate)) {
      toast.error(MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE)
      return
    }

    const requestedAtIso = requestedAt!.toISOString()
    const validUntilIso = toMonitoredPlateAuthorityValidUntilIso(
      validUntilDate!,
    )
    if (
      new Date(validUntilIso).getTime() <= new Date(requestedAtIso).getTime()
    ) {
      toast.error('A validade deve ser posterior à solicitação.')
      return
    }

    const selectedAuthority = authoritiesByIdRef.current.get(authorityId)

    await onCreate({
      institutionAuthorityId: authorityId,
      institutionAuthorityName: selectedAuthority?.name,
      requestingInstitutionName:
        selectedAuthority?.requestingInstitution?.name ||
        requestingInstitutionTitle ||
        undefined,
      referenceNumber: ref,
      requestedAt: requestedAtIso,
      validUntil: validUntilIso,
      active,
      monitorAllCollectionPoints: monitorAll,
      notificationChannelIds,
      collectionPointIds: monitorAll ? undefined : collectionPointIds,
    })
    toast.success(successMessage)
    onOpenChange(false)
  }

  const plateLine = plateDescription.trim() || plate || '(defina a placa acima)'
  const isBusy = disabled || isSubmitting

  return (
    <>
      <AuthorityLinkDialogShell
        open={open}
        onOpenChange={onOpenChange}
        title="Novo vínculo com requisitante"
        description={
          <>
            Placa <strong>{plateLine}</strong>
          </>
        }
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto sm:min-w-32"
              disabled={isBusy}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto sm:min-w-32"
              disabled={isBusy}
              onClick={handleSubmit}
            >
              {isSubmitting ? <Spinner /> : submitLabel}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Demandante</Label>
              {requestingInstitutionId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs font-normal"
                  disabled={isBusy}
                  onClick={() => {
                    setRequestingInstitutionTitle('')
                    setRequestingInstitutionId('')
                    setAuthorityTitle('')
                    setAuthorityId('')
                  }}
                >
                  Limpar filtro
                </Button>
              ) : null}
            </div>
            <SelectWithSearch
              value={requestingInstitutionTitle}
              selectedOption={
                requestingInstitutionId
                  ? {
                      value: requestingInstitutionId,
                      label: requestingInstitutionTitle,
                    }
                  : undefined
              }
              onSelect={(item) => {
                setRequestingInstitutionTitle(item.label)
                setRequestingInstitutionId(item.value)
                setAuthorityTitle('')
                setAuthorityId('')
              }}
              queryKey={['requesting-institutions', 'select']}
              enabled={open}
              fetchPage={fetchRequestingInstitutionPage}
              disabled={isBusy}
              placeholder="Filtrar por demandante"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Label>Requisitante</Label>
                <InputError message={fieldErrors.authorityId} />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-normal"
                disabled={isBusy}
                onClick={() => {
                  setDialogInitialData(null)
                  formDialogDisclosure.onOpen()
                }}
              >
                Novo requisitante
              </Button>
            </div>
            <SelectWithSearch
              value={authorityTitle}
              selectedOption={
                authorityId
                  ? { value: authorityId, label: authorityTitle }
                  : undefined
              }
              onSelect={(item) => {
                setAuthorityTitle(item.label)
                setAuthorityId(item.value)

                const authority = authoritiesByIdRef.current.get(item.value)
                const institutionId =
                  authority?.requestingInstitution?.id ||
                  authority?.requestingInstitutionId

                if (institutionId) {
                  const institutionName = authority?.requestingInstitution?.name

                  if (institutionName) {
                    setRequestingInstitutionId(institutionId)
                    setRequestingInstitutionTitle(institutionName)
                  }
                }

                setFieldErrors((prev) => ({
                  ...prev,
                  authorityId: undefined,
                }))
              }}
              queryKey={[
                'institution-authorities',
                'select',
                requestingInstitutionId,
                reservedAuthorityIds.join(','),
              ]}
              enabled={open}
              fetchPage={fetchInstitutionAuthorityPage}
              disabled={isBusy}
              placeholder={
                requestingInstitutionId
                  ? 'Selecione o requisitante'
                  : 'Selecione ou filtre por demandante'
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="create-link-ref">Nº de referência</Label>
              <InputError message={fieldErrors.reference} />
            </div>
            <Input
              id="create-link-ref"
              value={reference}
              onChange={(e) => {
                setReference(e.target.value)
                setFieldErrors((prev) => ({
                  ...prev,
                  reference: undefined,
                }))
              }}
              maxLength={50}
              disabled={isBusy}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="create-link-requested">Solicitado em</Label>
              <InputError message={fieldErrors.requestedAt} />
            </div>
            <DatePicker
              value={requestedAt}
              onChange={(value) => {
                setRequestedAt(value)
                setFieldErrors((prev) => ({
                  ...prev,
                  requestedAt: undefined,
                }))
              }}
              type="datetime-local"
              timePickerDisableFuture={false}
              disabled={isBusy}
            />
          </div>

          <MonitoredPlateAuthorityValidUntilPicker
            label="Validade"
            value={validUntilDate}
            onChange={(updater) => {
              setValidUntilDate(updater)
              setFieldErrors((prev) => ({
                ...prev,
                validUntil: undefined,
              }))
            }}
            errorMessage={fieldErrors.validUntil}
            allowClear={false}
            disabled={isBusy}
          />

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Canais de notificação</Label>
              <InputError message={fieldErrors.notificationChannelIds} />
            </div>
            <MultipleSelector
              value={notificationChannelOptions.filter((item) =>
                notificationChannelIds.includes(item.value),
              )}
              onChange={(items) => {
                setNotificationChannelIds(items.map((item) => item.value))
                setFieldErrors((prev) => ({
                  ...prev,
                  notificationChannelIds: undefined,
                }))
              }}
              defaultOptions={notificationChannelOptions}
              options={notificationChannelOptions}
              disabled={isBusy}
              placeholder="Selecione um ou mais canais"
              emptyIndicator={<p>Nenhum resultado encontrado.</p>}
            />
          </div>

          <label className="flex items-center justify-between gap-3 rounded-md border p-3">
            <span className="text-sm">Vínculo ativo</span>
            <Switch
              checked={active}
              onCheckedChange={(next) => {
                if (
                  next &&
                  isMonitoredPlateAuthorityValidUntilExpired(validUntilDate)
                ) {
                  toast.error(MONITORED_PLATE_AUTHORITY_EXPIRED_ACTIVE_MESSAGE)
                  return
                }
                setActive(next)
              }}
              disabled={isBusy}
              aria-label="Vínculo ativo"
            />
          </label>

          <MonitoredPlateAuthorityCollectionPointField
            value={collectionPointIds}
            onChange={setCollectionPointIds}
            disabled={isBusy}
            monitorAll={monitorAll}
            onMonitorAllChange={setMonitorAll}
            defaultSelectAll={true}
          />
        </div>
      </AuthorityLinkDialogShell>

      <InstitutionAuthorityFormDialog
        isOpen={formDialogDisclosure.isOpen}
        onClose={formDialogDisclosure.onClose}
        onOpen={formDialogDisclosure.onOpen}
      />
    </>
  )
}
