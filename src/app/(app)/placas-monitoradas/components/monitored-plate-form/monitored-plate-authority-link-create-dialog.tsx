'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { InstitutionAuthorityFormDialog } from '@/app/(app)/demandantes/components/institution-authorities/institution-authority-dialogs/components/institution-authority-form-dialog'
import { InputError } from '@/components/custom/input-error'
import MultipleSelector from '@/components/custom/multiselect-with-search'
import { SelectWithSearch } from '@/components/custom/select-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'
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
  institutionAuthorities: InstitutionAuthority[]
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
  institutionAuthorities,
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

  const availableAuthorities = useMemo(() => {
    const reserved = new Set(reservedAuthorityIds)
    return institutionAuthorities.filter((item) => !reserved.has(item.id))
  }, [institutionAuthorities, reservedAuthorityIds])

  const requestingInstitutionOptions = useMemo(() => {
    const institutions = new Map<string, string>()

    availableAuthorities.forEach((item) => {
      const institutionId =
        item.requestingInstitution?.id || item.requestingInstitutionId
      const institutionName = item.requestingInstitution?.name
      if (!institutionId || !institutionName) return
      institutions.set(institutionId, institutionName)
    })

    return Array.from(institutions.entries())
      .map(([value, label]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  }, [availableAuthorities])

  const filteredAuthorities = requestingInstitutionId
    ? availableAuthorities.filter(
        (item) =>
          (item.requestingInstitution?.id || item.requestingInstitutionId) ===
          requestingInstitutionId,
      )
    : availableAuthorities

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

    await onCreate({
      institutionAuthorityId: authorityId,
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
              onSelect={(item) => {
                setRequestingInstitutionTitle(item.label)
                setRequestingInstitutionId(item.value)
                setAuthorityTitle('')
                setAuthorityId('')
              }}
              options={requestingInstitutionOptions}
              disabled={isBusy || requestingInstitutionOptions.length === 0}
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
              onSelect={(item) => {
                setAuthorityTitle(item.label)
                setAuthorityId(item.value)

                const authority = availableAuthorities.find(
                  (entry) => entry.id === item.value,
                )
                const institutionId =
                  authority?.requestingInstitution?.id ||
                  authority?.requestingInstitutionId

                if (institutionId) {
                  const institutionOption = requestingInstitutionOptions.find(
                    (option) => option.value === institutionId,
                  )
                  const institutionName =
                    institutionOption?.label ||
                    authority?.requestingInstitution?.name

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
              options={filteredAuthorities.map((item) => ({
                label: item.requestingInstitution
                  ? `${item.name} — ${item.requestingInstitution.name}`
                  : item.name,
                value: item.id,
              }))}
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
