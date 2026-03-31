'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Plus, Trash, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { maskPlateBR } from '@/utils/string-formatters'

import {
  type CorrelataDraft,
  type CorrelataDraftItem,
  emptyAnaliseImagemDraft,
  emptyBuscaPorImagemDraft,
  emptyCercoDraft,
  emptyCorrelataDraft,
  emptyCorrelataItem,
  emptyOutrosDraft,
  emptyReservaImagemDraft,
  normalizeBuscaPorPlacaForForm,
  normalizeBuscaPorRadarForForm,
  type OpenServiceKey,
  SERVICE_CONFIG,
} from '../../ticket-create/ticket-create.constant'
import styles from '../../ticket-create/ticket-create-form.module.css'
import {
  serviceAnaliseDeImagemSchema,
  serviceBuscaPorImagemSchema,
  serviceBuscaPorPlacaSchema,
  serviceBuscaPorRadarSchema,
  serviceCercoSchema,
  serviceOutrosSchema,
  servicePlacasConjuntasSchema,
  servicePlacasCorrelatasSchema,
  serviceReservaDeImagemSchema,
  type TicketCreateForm,
} from '../../ticket-create/ticket-create-schema'
import { PeriodFieldsCalendarStyle } from '../shared/period-fields'
import { CorrelataPanel } from './correlata-panel'

type Props = {
  serviceModalOpen: OpenServiceKey
  editIndex: number | null
  closeServiceModal: () => void

  initialBuscaPorPlaca?: TicketCreateForm['busca_por_placa'][number]
  initialBuscaPorRadar?: TicketCreateForm['busca_por_radar'][number]
  initialCerco?: TicketCreateForm['cerco_eletronico'][number]
  initialBuscaPorImagem?: TicketCreateForm['busca_por_imagem'][number]
  initialPlacasCorrelatas?: TicketCreateForm['placas_correlatas'][number]
  initialPlacasConjuntas?: TicketCreateForm['placas_conjuntas'][number]
  initialReservaImagem?: TicketCreateForm['reserva_de_imagem'][number]
  initialAnaliseImagem?: TicketCreateForm['analise_de_imagem'][number]
  initialOutros?: TicketCreateForm['outros'][number]

  onSaveBuscaPorPlaca: (
    value: TicketCreateForm['busca_por_placa'][number],
    editIndex: number | null,
  ) => void
  onSaveBuscaPorRadar: (
    value: TicketCreateForm['busca_por_radar'][number],
    editIndex: number | null,
  ) => void
  onSaveCerco: (
    value: TicketCreateForm['cerco_eletronico'][number],
    editIndex: number | null,
  ) => void
  onSaveBuscaPorImagem: (
    value: TicketCreateForm['busca_por_imagem'][number],
    editIndex: number | null,
  ) => void
  onSavePlacasCorrelatas: (
    value: TicketCreateForm['placas_correlatas'][number],
    editIndex: number | null,
  ) => void
  onSavePlacasConjuntas: (
    value: TicketCreateForm['placas_conjuntas'][number],
    editIndex: number | null,
  ) => void
  onSaveReservaImagem: (
    value: TicketCreateForm['reserva_de_imagem'][number],
    editIndex: number | null,
  ) => void
  onSaveAnaliseImagem: (
    value: TicketCreateForm['analise_de_imagem'][number],
    editIndex: number | null,
  ) => void
  onSaveOutros: (
    value: TicketCreateForm['outros'][number],
    editIndex: number | null,
  ) => void

  /** Padrão: dialog centralizado (criar chamado). `drawer`: painel lateral (converter). */
  variant?: 'dialog' | 'drawer'
  /** Somente leitura (ex.: chamado associado no cadastro manual). */
  readOnly?: boolean
}

export function ServiceModal(props: Props) {
  const {
    serviceModalOpen,
    editIndex,
    closeServiceModal,
    variant = 'dialog',
    readOnly = false,
  } = props

  const title = serviceModalOpen ? SERVICE_CONFIG[serviceModalOpen].label : ''

  const formNodes = (
    <>
      {serviceModalOpen === 'busca_por_placa' && (
        <BuscaPorPlacaForm
          initialValue={props.initialBuscaPorPlaca}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveBuscaPorPlaca}
          readOnly={readOnly}
        />
      )}

      {serviceModalOpen === 'busca_por_radar' && (
        <BuscaPorRadarForm
          initialValue={props.initialBuscaPorRadar}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveBuscaPorRadar}
          readOnly={readOnly}
        />
      )}

      {serviceModalOpen === 'cerco_eletronico' && (
        <CercoForm
          initialValue={props.initialCerco}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveCerco}
          readOnly={readOnly}
        />
      )}

      {serviceModalOpen === 'busca_por_imagem' && (
        <BuscaPorImagemForm
          initialValue={props.initialBuscaPorImagem}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveBuscaPorImagem}
          readOnly={readOnly}
        />
      )}

      {serviceModalOpen === 'placas_correlatas' && (
        <PlacasCorrelatasForm
          initialValue={props.initialPlacasCorrelatas}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSavePlacasCorrelatas}
          readOnly={readOnly}
        />
      )}

      {serviceModalOpen === 'placas_conjuntas' && (
        <PlacasConjuntasForm
          initialValue={props.initialPlacasConjuntas}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSavePlacasConjuntas}
          readOnly={readOnly}
        />
      )}

      {serviceModalOpen === 'reserva_de_imagem' && (
        <ReservaImagemForm
          initialValue={props.initialReservaImagem}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveReservaImagem}
          readOnly={readOnly}
        />
      )}

      {serviceModalOpen === 'analise_de_imagem' && (
        <AnaliseImagemForm
          initialValue={props.initialAnaliseImagem}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveAnaliseImagem}
          readOnly={readOnly}
        />
      )}

      {serviceModalOpen === 'outros' && (
        <OutrosForm
          initialValue={props.initialOutros}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveOutros}
          readOnly={readOnly}
        />
      )}
    </>
  )

  if (variant === 'drawer') {
    if (!serviceModalOpen) return null

    return createPortal(
      <>
        <div className={styles.serviceDrawerBackdrop} aria-hidden />
        <div
          className={styles.serviceDrawerPanel}
          role="dialog"
          aria-modal={false}
          aria-labelledby="service-drawer-title"
        >
          <div className={styles.serviceDrawerHeader}>
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className={styles.serviceDrawerIconBtn}
                onClick={closeServiceModal}
                aria-label="Voltar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2
                id="service-drawer-title"
                className={styles.serviceDrawerTitle}
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              className={styles.serviceDrawerIconBtn}
              onClick={closeServiceModal}
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className={styles.serviceDrawerFormWrap}>{formNodes}</div>
        </div>
      </>,
      document.body,
    )
  }

  return (
    <Dialog
      open={!!serviceModalOpen}
      onOpenChange={(open) => !open && closeServiceModal()}
    >
      <DialogContent className={styles.serviceModal}>
        <DialogHeader className={styles.serviceModalHeader}>
          <DialogTitle className={styles.serviceModalTitle}>
            {serviceModalOpen ? SERVICE_CONFIG[serviceModalOpen].label : ''}
          </DialogTitle>
        </DialogHeader>

        {formNodes}
      </DialogContent>
    </Dialog>
  )
}

type SimpleFormProps<T> = {
  initialValue?: T
  editIndex: number | null
  onCancel: () => void
  onSave: (value: T, editIndex: number | null) => void
  readOnly?: boolean
}

function normalizePlatesMaskedForBusca(
  initial: ReturnType<typeof normalizeBuscaPorPlacaForForm>,
) {
  return {
    ...initial,
    plates: initial.plates.map((p) => maskPlateBR(p)),
  }
}

function normalizePlatesMaskedForRadar(
  initial: ReturnType<typeof normalizeBuscaPorRadarForForm>,
) {
  return {
    ...initial,
    plates: initial.plates.map((p) => maskPlateBR(p)),
  }
}

function normalizeCercoPlateForForm(
  initial?: TicketCreateForm['cerco_eletronico'][number],
) {
  const base = initial ?? {
    ...emptyCercoDraft(),
    vehicle_observations: null,
  }
  return {
    ...base,
    plate:
      base.plate != null && String(base.plate).trim() !== ''
        ? maskPlateBR(String(base.plate))
        : '',
  }
}

function normalizeBuscaPorImagemPlateForForm(
  initial?: TicketCreateForm['busca_por_imagem'][number],
) {
  const base = initial ?? {
    ...emptyBuscaPorImagemDraft(),
    period_start: null,
    period_end: null,
    plate: null,
    address: null,
    description: null,
  }
  return {
    ...base,
    plate:
      base.plate != null && String(base.plate).trim() !== ''
        ? maskPlateBR(String(base.plate))
        : '',
  }
}

function BuscaPorPlacaForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
  readOnly = false,
}: SimpleFormProps<TicketCreateForm['busca_por_placa'][number]>) {
  const form = useForm<TicketCreateForm['busca_por_placa'][number]>({
    resolver: zodResolver(serviceBuscaPorPlacaSchema),
    defaultValues: normalizePlatesMaskedForBusca(
      normalizeBuscaPorPlacaForForm(initialValue),
    ),
  })

  useEffect(() => {
    form.reset(
      normalizePlatesMaskedForBusca(
        normalizeBuscaPorPlacaForForm(initialValue),
      ),
    )
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  const plates = form.watch('plates') ?? ['']

  const addPlate = () => {
    form.setValue('plates', [...plates, ''], { shouldValidate: true })
  }

  const removePlate = (index: number) => {
    if (plates.length <= 1) return
    form.setValue(
      'plates',
      plates.filter((_, i) => i !== index),
      { shouldValidate: true },
    )
  }

  return (
    <form
      onSubmit={
        readOnly
          ? (e) => e.preventDefault()
          : form.handleSubmit((value) => onSave(value, editIndex))
      }
    >
      <fieldset
        disabled={readOnly}
        className={`${styles.serviceModalFieldsetScroll} min-w-0 border-0 p-0 [&:disabled]:opacity-100`}
      >
        <div className={styles.serviceModalBody}>
          <div className="space-y-3">
            <PeriodFieldsCalendarStyle
              startValue={form.watch('period_start') ?? ''}
              endValue={form.watch('period_end') ?? ''}
              onChangeStart={(value) =>
                form.setValue('period_start', value, { shouldValidate: true })
              }
              onChangeEnd={(value) =>
                form.setValue('period_end', value, { shouldValidate: true })
              }
              disabled={readOnly}
            />

            <div className="space-y-2">
              <Label className={styles.fieldLabel}>Placas do veículo</Label>
              {plates.map((_, index) => (
                <div key={index} className="flex gap-2">
                  <Controller
                    control={form.control}
                    name={`plates.${index}`}
                    render={({ field }) => (
                      <Input
                        className={`h-11 min-w-0 flex-1 ${styles.inputBg}`}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(maskPlateBR(e.target.value))
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  />
                  {plates.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 w-11 shrink-0 p-0"
                      onClick={() => removePlate(index)}
                      title="Remover placa"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.plates?.message && (
                <p className="text-xs text-destructive">
                  {errors.plates.message}
                </p>
              )}
              <div className="flex flex-col items-end">
                <button
                  type="button"
                  onClick={addPlate}
                  className={styles.addPointFocalButton}
                >
                  <Plus className="h-5 w-5 shrink-0" aria-hidden />
                  Adicionar placa
                </button>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <FooterButtons onCancel={onCancel} readOnly={readOnly} />
    </form>
  )
}

function BuscaPorRadarForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
  readOnly = false,
}: SimpleFormProps<TicketCreateForm['busca_por_radar'][number]>) {
  const form = useForm<TicketCreateForm['busca_por_radar'][number]>({
    resolver: zodResolver(serviceBuscaPorRadarSchema),
    defaultValues: normalizePlatesMaskedForRadar(
      normalizeBuscaPorRadarForForm(initialValue),
    ),
  })

  useEffect(() => {
    form.reset(
      normalizePlatesMaskedForRadar(
        normalizeBuscaPorRadarForForm(initialValue),
      ),
    )
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  const plates = form.watch('plates') ?? ['']

  const addPlate = () => {
    form.setValue('plates', [...plates, ''], { shouldValidate: true })
  }

  const removePlate = (index: number) => {
    if (plates.length <= 1) return
    form.setValue(
      'plates',
      plates.filter((_, i) => i !== index),
      { shouldValidate: true },
    )
  }

  return (
    <form
      onSubmit={
        readOnly
          ? (e) => e.preventDefault()
          : form.handleSubmit((value) => onSave(value, editIndex))
      }
    >
      <fieldset
        disabled={readOnly}
        className={`${styles.serviceModalFieldsetScroll} min-w-0 border-0 p-0 [&:disabled]:opacity-100`}
      >
        <div className={styles.serviceModalBody}>
          <div className="space-y-3">
            <PeriodFieldsCalendarStyle
              startValue={form.watch('period_start') ?? ''}
              endValue={form.watch('period_end') ?? ''}
              onChangeStart={(value) =>
                form.setValue('period_start', value, { shouldValidate: true })
              }
              onChangeEnd={(value) =>
                form.setValue('period_end', value, { shouldValidate: true })
              }
              disabled={readOnly}
            />
            {(errors.period_start?.message || errors.period_end?.message) && (
              <p className="text-xs text-destructive">
                {errors.period_start?.message || errors.period_end?.message}
              </p>
            )}

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Orientação</Label>
              <Textarea
                className={`min-h-[92px] ${styles.inputBg}`}
                {...form.register('orientation')}
              />
              {errors.orientation?.message && (
                <p className="text-xs text-destructive">
                  {errors.orientation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className={styles.fieldLabel}>Placas do veículo</Label>
              {plates.map((_, index) => (
                <div key={index} className="flex gap-2">
                  <Controller
                    control={form.control}
                    name={`plates.${index}`}
                    render={({ field }) => (
                      <Input
                        className={`h-11 min-w-0 flex-1 ${styles.inputBg}`}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(maskPlateBR(e.target.value))
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  />
                  {plates.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 w-11 shrink-0 p-0"
                      onClick={() => removePlate(index)}
                      title="Remover placa"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.plates?.message && (
                <p className="text-xs text-destructive">
                  {errors.plates.message}
                </p>
              )}
              <div className="flex flex-col items-end">
                <button
                  type="button"
                  onClick={addPlate}
                  className={styles.addPointFocalButton}
                >
                  <Plus className="h-5 w-5 shrink-0" aria-hidden />
                  Adicionar placa
                </button>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <FooterButtons onCancel={onCancel} readOnly={readOnly} />
    </form>
  )
}

function CercoForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
  readOnly = false,
}: SimpleFormProps<TicketCreateForm['cerco_eletronico'][number]>) {
  const form = useForm<TicketCreateForm['cerco_eletronico'][number]>({
    resolver: zodResolver(serviceCercoSchema),
    defaultValues: normalizeCercoPlateForForm(initialValue),
  })

  useEffect(() => {
    form.reset(normalizeCercoPlateForForm(initialValue))
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  return (
    <form
      onSubmit={
        readOnly
          ? (e) => e.preventDefault()
          : form.handleSubmit((value) => onSave(value, editIndex))
      }
    >
      <fieldset
        disabled={readOnly}
        className={`${styles.serviceModalFieldsetScroll} min-w-0 border-0 p-0 [&:disabled]:opacity-100`}
      >
        <div className={styles.serviceModalBody}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Placa do veículo</Label>
              <Controller
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(maskPlateBR(e.target.value))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              {errors.plate?.message && (
                <p className="text-xs text-destructive">
                  {errors.plate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>
                Observações do veículo
              </Label>
              <Textarea
                className={`min-h-[92px] ${styles.inputBg}`}
                {...form.register('vehicle_observations')}
              />
              {errors.vehicle_observations?.message && (
                <p className="text-xs text-destructive">
                  {errors.vehicle_observations.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      <FooterButtons onCancel={onCancel} readOnly={readOnly} />
    </form>
  )
}

function BuscaPorImagemForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
  readOnly = false,
}: SimpleFormProps<TicketCreateForm['busca_por_imagem'][number]>) {
  const form = useForm<TicketCreateForm['busca_por_imagem'][number]>({
    resolver: zodResolver(serviceBuscaPorImagemSchema),
    defaultValues: normalizeBuscaPorImagemPlateForForm(initialValue),
  })

  useEffect(() => {
    form.reset(normalizeBuscaPorImagemPlateForForm(initialValue))
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  return (
    <form
      onSubmit={
        readOnly
          ? (e) => e.preventDefault()
          : form.handleSubmit((value) => onSave(value, editIndex))
      }
    >
      <fieldset
        disabled={readOnly}
        className={`${styles.serviceModalFieldsetScroll} min-w-0 border-0 p-0 [&:disabled]:opacity-100`}
      >
        <div className={styles.serviceModalBody}>
          <div className="space-y-3">
            <PeriodFieldsCalendarStyle
              startValue={form.watch('period_start') ?? ''}
              endValue={form.watch('period_end') ?? ''}
              onChangeStart={(value) =>
                form.setValue('period_start', value, { shouldValidate: true })
              }
              onChangeEnd={(value) =>
                form.setValue('period_end', value, { shouldValidate: true })
              }
              disabled={readOnly}
            />
            {(errors.period_start?.message || errors.period_end?.message) && (
              <p className="text-xs text-destructive">
                {errors.period_start?.message || errors.period_end?.message}
              </p>
            )}

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Placa do veículo</Label>
              <Controller
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <Input
                    className={`h-11 ${styles.inputBg}`}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(maskPlateBR(e.target.value))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              {errors.plate?.message && (
                <p className="text-xs text-destructive">
                  {errors.plate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Endereço</Label>
              <Input
                className={`h-11 ${styles.inputBg}`}
                {...form.register('address')}
              />
              {errors.address?.message && (
                <p className="text-xs text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Orientação</Label>
              <Textarea
                className={`min-h-[110px] ${styles.inputBg}`}
                {...form.register('description')}
              />
              {errors.description?.message && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      <FooterButtons onCancel={onCancel} readOnly={readOnly} />
    </form>
  )
}

function strFromForm(v: string | null | undefined) {
  if (v == null) return ''
  return String(v)
}

function toCorrelataDraft(
  value?:
    | TicketCreateForm['placas_correlatas'][number]
    | TicketCreateForm['placas_conjuntas'][number],
): CorrelataDraft {
  const legacyItems = (
    value as {
      items?: {
        plate?: string | null
        period_start?: string | null
        period_end?: string | null
      }[]
    }
  )?.items

  let periodStart = strFromForm(value?.period_start)
  let periodEnd = strFromForm(value?.period_end)

  let plates: CorrelataDraftItem[]
  if (value?.plates && value.plates.length > 0) {
    plates = value.plates.map((p) => ({
      plate: maskPlateBR(strFromForm(p?.plate)),
    }))
  } else if (legacyItems && legacyItems.length > 0) {
    plates = legacyItems.map((i) => ({
      plate: maskPlateBR(strFromForm(i?.plate)),
    }))
    if (!periodStart && legacyItems[0]) {
      periodStart = strFromForm(legacyItems[0].period_start)
      periodEnd = strFromForm(legacyItems[0].period_end)
    }
  } else {
    plates = [emptyCorrelataItem()]
  }

  return {
    period_start: periodStart,
    period_end: periodEnd,
    plates,
    interest_interval_minutes: value?.interest_interval_minutes ?? 1,
    detection_count: value?.detection_count ?? 10,
    detection: value?.detection ?? null,
  }
}

function fromCorrelataDraft(
  draft: CorrelataDraft,
): TicketCreateForm['placas_correlatas'][number] {
  return {
    period_start: draft.period_start?.trim() ? draft.period_start : null,
    period_end: draft.period_end?.trim() ? draft.period_end : null,
    plates: draft.plates.map((p) => ({
      plate: p.plate?.trim() ? p.plate : null,
    })),
    interest_interval_minutes: draft.interest_interval_minutes,
    detection_count: draft.detection_count,
    detection: draft.detection,
  }
}

function PlacasCorrelatasForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
  readOnly = false,
}: SimpleFormProps<TicketCreateForm['placas_correlatas'][number]>) {
  const form = useForm<TicketCreateForm['placas_correlatas'][number]>({
    resolver: zodResolver(servicePlacasCorrelatasSchema),
    defaultValues:
      initialValue != null
        ? fromCorrelataDraft(toCorrelataDraft(initialValue))
        : fromCorrelataDraft(emptyCorrelataDraft()),
  })

  useEffect(() => {
    form.reset(
      initialValue != null
        ? fromCorrelataDraft(toCorrelataDraft(initialValue))
        : fromCorrelataDraft(emptyCorrelataDraft()),
    )
  }, [initialValue, form])
  const draft = toCorrelataDraft(form.watch())
  return (
    <form
      className={styles.serviceModalFormScroll}
      onSubmit={
        readOnly
          ? (e) => e.preventDefault()
          : form.handleSubmit((value) => onSave(value, editIndex))
      }
    >
      <fieldset
        disabled={readOnly}
        className={`${styles.serviceModalFieldsetScroll} min-w-0 border-0 p-0 [&:disabled]:opacity-100`}
      >
        <div className={styles.serviceModalBody}>
          <CorrelataPanel
            draft={draft}
            setDraft={(updater) => {
              const currentDraft = toCorrelataDraft(form.getValues())
              const nextDraft =
                typeof updater === 'function' ? updater(currentDraft) : updater

              form.reset(fromCorrelataDraft(nextDraft), {
                keepErrors: true,
                keepDirty: true,
                keepTouched: true,
              })
            }}
            onAdd={() => {}}
            hideAddButton
            useCalendarStyle
            disabled={readOnly}
            errors={toRecordErrors(form.formState.errors)}
            onPlateBlur={() => {
              form.trigger('plates').catch(() => {})
            }}
            onPlateChange={() => {
              form.trigger('plates').catch(() => {})
            }}
          />
        </div>
      </fieldset>

      <FooterButtons onCancel={onCancel} readOnly={readOnly} />
    </form>
  )
}

function PlacasConjuntasForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
  readOnly = false,
}: SimpleFormProps<TicketCreateForm['placas_conjuntas'][number]>) {
  const form = useForm<TicketCreateForm['placas_conjuntas'][number]>({
    resolver: zodResolver(servicePlacasConjuntasSchema),
    defaultValues:
      initialValue != null
        ? fromCorrelataDraft(toCorrelataDraft(initialValue))
        : fromCorrelataDraft(emptyCorrelataDraft()),
  })

  useEffect(() => {
    form.reset(
      initialValue != null
        ? fromCorrelataDraft(toCorrelataDraft(initialValue))
        : fromCorrelataDraft(emptyCorrelataDraft()),
    )
  }, [initialValue, form])
  const draft = toCorrelataDraft(form.watch())
  return (
    <form
      className={styles.serviceModalFormScroll}
      onSubmit={
        readOnly
          ? (e) => e.preventDefault()
          : form.handleSubmit((value) => onSave(value, editIndex))
      }
    >
      <fieldset
        disabled={readOnly}
        className={`${styles.serviceModalFieldsetScroll} min-w-0 border-0 p-0 [&:disabled]:opacity-100`}
      >
        <div className={styles.serviceModalBody}>
          <CorrelataPanel
            draft={draft}
            setDraft={(updater) => {
              const currentDraft = toCorrelataDraft(form.getValues())
              const nextDraft =
                typeof updater === 'function' ? updater(currentDraft) : updater

              form.reset(fromCorrelataDraft(nextDraft), {
                keepErrors: true,
                keepDirty: true,
                keepTouched: true,
              })
            }}
            onAdd={() => {}}
            hideAddButton
            useCalendarStyle
            disabled={readOnly}
            errors={toRecordErrors(form.formState.errors)}
            onPlateBlur={() => {
              form.trigger('plates').catch(() => {})
            }}
            onPlateChange={() => {
              form.trigger('plates').catch(() => {})
            }}
          />
        </div>
      </fieldset>

      <FooterButtons onCancel={onCancel} readOnly={readOnly} />
    </form>
  )
}

function ReservaImagemForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
  readOnly = false,
}: SimpleFormProps<TicketCreateForm['reserva_de_imagem'][number]>) {
  const form = useForm<TicketCreateForm['reserva_de_imagem'][number]>({
    resolver: zodResolver(serviceReservaDeImagemSchema),
    defaultValues: initialValue ?? {
      ...emptyReservaImagemDraft(),
      period_start: null,
      period_end: null,
      orientation: null,
    },
  })

  useEffect(() => {
    form.reset(
      initialValue ?? {
        ...emptyReservaImagemDraft(),
        period_start: null,
        period_end: null,
        orientation: null,
      },
    )
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  return (
    <form
      onSubmit={
        readOnly
          ? (e) => e.preventDefault()
          : form.handleSubmit((value) => onSave(value, editIndex))
      }
    >
      <fieldset
        disabled={readOnly}
        className={`${styles.serviceModalFieldsetScroll} min-w-0 border-0 p-0 [&:disabled]:opacity-100`}
      >
        <div className={styles.serviceModalBody}>
          <div className="space-y-3">
            <PeriodFieldsCalendarStyle
              startValue={form.watch('period_start') ?? ''}
              endValue={form.watch('period_end') ?? ''}
              onChangeStart={(value) =>
                form.setValue('period_start', value, { shouldValidate: true })
              }
              onChangeEnd={(value) =>
                form.setValue('period_end', value, { shouldValidate: true })
              }
              disabled={readOnly}
            />
            {(errors.period_start?.message || errors.period_end?.message) && (
              <p className="text-xs text-destructive">
                {errors.period_start?.message || errors.period_end?.message}
              </p>
            )}

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Orientação</Label>
              <Textarea
                className={`min-h-[110px] ${styles.inputBg}`}
                {...form.register('orientation')}
              />
              {errors.orientation?.message && (
                <p className="text-xs text-destructive">
                  {errors.orientation.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      <FooterButtons onCancel={onCancel} readOnly={readOnly} />
    </form>
  )
}

function AnaliseImagemForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
  readOnly = false,
}: SimpleFormProps<TicketCreateForm['analise_de_imagem'][number]>) {
  const form = useForm<TicketCreateForm['analise_de_imagem'][number]>({
    resolver: zodResolver(serviceAnaliseDeImagemSchema),
    defaultValues: initialValue ?? {
      ...emptyAnaliseImagemDraft(),
      period_start: null,
      period_end: null,
      orientation: null,
    },
  })

  useEffect(() => {
    form.reset(
      initialValue ?? {
        ...emptyAnaliseImagemDraft(),
        period_start: null,
        period_end: null,
        orientation: null,
      },
    )
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  return (
    <form
      onSubmit={
        readOnly
          ? (e) => e.preventDefault()
          : form.handleSubmit((value) => onSave(value, editIndex))
      }
    >
      <fieldset
        disabled={readOnly}
        className={`${styles.serviceModalFieldsetScroll} min-w-0 border-0 p-0 [&:disabled]:opacity-100`}
      >
        <div className={styles.serviceModalBody}>
          <div className="space-y-3">
            <PeriodFieldsCalendarStyle
              startValue={form.watch('period_start') ?? ''}
              endValue={form.watch('period_end') ?? ''}
              onChangeStart={(value) =>
                form.setValue('period_start', value, { shouldValidate: true })
              }
              onChangeEnd={(value) =>
                form.setValue('period_end', value, { shouldValidate: true })
              }
              disabled={readOnly}
            />
            {(errors.period_start?.message || errors.period_end?.message) && (
              <p className="text-xs text-destructive">
                {errors.period_start?.message || errors.period_end?.message}
              </p>
            )}

            <div className="space-y-1.5">
              <Label className={styles.fieldLabel}>Orientação</Label>
              <Textarea
                className={`min-h-[110px] ${styles.inputBg}`}
                {...form.register('orientation')}
              />
              {errors.orientation?.message && (
                <p className="text-xs text-destructive">
                  {errors.orientation.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      <FooterButtons onCancel={onCancel} readOnly={readOnly} />
    </form>
  )
}

function OutrosForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
  readOnly = false,
}: SimpleFormProps<TicketCreateForm['outros'][number]>) {
  const form = useForm<TicketCreateForm['outros'][number]>({
    resolver: zodResolver(serviceOutrosSchema),
    defaultValues: initialValue ?? {
      ...emptyOutrosDraft(),
      orientation: null,
    },
  })

  useEffect(() => {
    form.reset(
      initialValue ?? {
        ...emptyOutrosDraft(),
        orientation: null,
      },
    )
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  return (
    <form
      onSubmit={
        readOnly
          ? (e) => e.preventDefault()
          : form.handleSubmit((value) => onSave(value, editIndex))
      }
    >
      <fieldset
        disabled={readOnly}
        className={`${styles.serviceModalFieldsetScroll} min-w-0 border-0 p-0 [&:disabled]:opacity-100`}
      >
        <div className={styles.serviceModalBody}>
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Orientação</Label>
            <Textarea
              className={`min-h-[110px] ${styles.inputBg}`}
              {...form.register('orientation')}
            />
            {errors.orientation?.message && (
              <p className="text-xs text-destructive">
                {errors.orientation.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <FooterButtons onCancel={onCancel} readOnly={readOnly} />
    </form>
  )
}

function FooterButtons({
  onCancel,
  readOnly = false,
}: {
  onCancel: () => void
  readOnly?: boolean
}) {
  if (readOnly) {
    return (
      <DialogFooter className={styles.serviceModalFooter}>
        <Button type="button" className={styles.saveButton} onClick={onCancel}>
          Fechar
        </Button>
      </DialogFooter>
    )
  }

  return (
    <DialogFooter className={styles.serviceModalFooter}>
      <Button
        type="button"
        variant="secondary"
        className={styles.cancelButton}
        onClick={onCancel}
      >
        Cancelar
      </Button>
      <Button type="submit" className={styles.saveButton}>
        Salvar
      </Button>
    </DialogFooter>
  )
}

function toRecordErrors(
  errors: unknown,
  parentPath = '',
): Record<string, string> {
  const result: Record<string, string> = {}

  if (!errors || typeof errors !== 'object') return result

  const obj = errors as Record<string, unknown>
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const path = parentPath ? `${parentPath}.${key}` : key

    const message =
      value && typeof value === 'object' && 'message' in value
        ? (value as { message?: string }).message
        : undefined
    if (message) {
      result[path] = message
    }

    if (value && typeof value === 'object') {
      Object.assign(result, toRecordErrors(value, path))
    }
  }

  return result
}
