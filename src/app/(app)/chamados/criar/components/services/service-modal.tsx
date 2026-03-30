'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'

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

import {
  type CorrelataDraft,
  emptyAnaliseImagemDraft,
  emptyBuscaPorImagemDraft,
  emptyBuscaPorPlacaDraft,
  emptyBuscaPorRadarDraft,
  emptyCercoDraft,
  emptyCorrelataDraft,
  emptyOutrosDraft,
  emptyReservaImagemDraft,
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
}

export function ServiceModal(props: Props) {
  const {
    serviceModalOpen,
    editIndex,
    closeServiceModal,
    variant = 'dialog',
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
        />
      )}

      {serviceModalOpen === 'busca_por_radar' && (
        <BuscaPorRadarForm
          initialValue={props.initialBuscaPorRadar}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveBuscaPorRadar}
        />
      )}

      {serviceModalOpen === 'cerco_eletronico' && (
        <CercoForm
          initialValue={props.initialCerco}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveCerco}
        />
      )}

      {serviceModalOpen === 'busca_por_imagem' && (
        <BuscaPorImagemForm
          initialValue={props.initialBuscaPorImagem}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveBuscaPorImagem}
        />
      )}

      {serviceModalOpen === 'placas_correlatas' && (
        <PlacasCorrelatasForm
          initialValue={props.initialPlacasCorrelatas}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSavePlacasCorrelatas}
        />
      )}

      {serviceModalOpen === 'placas_conjuntas' && (
        <PlacasConjuntasForm
          initialValue={props.initialPlacasConjuntas}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSavePlacasConjuntas}
        />
      )}

      {serviceModalOpen === 'reserva_de_imagem' && (
        <ReservaImagemForm
          initialValue={props.initialReservaImagem}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveReservaImagem}
        />
      )}

      {serviceModalOpen === 'analise_de_imagem' && (
        <AnaliseImagemForm
          initialValue={props.initialAnaliseImagem}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveAnaliseImagem}
        />
      )}

      {serviceModalOpen === 'outros' && (
        <OutrosForm
          initialValue={props.initialOutros}
          editIndex={editIndex}
          onCancel={closeServiceModal}
          onSave={props.onSaveOutros}
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
}

function BuscaPorPlacaForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
}: SimpleFormProps<TicketCreateForm['busca_por_placa'][number]>) {
  const form = useForm<TicketCreateForm['busca_por_placa'][number]>({
    resolver: zodResolver(serviceBuscaPorPlacaSchema),
    defaultValues: initialValue ?? {
      ...emptyBuscaPorPlacaDraft(),
      period_start: null,
      period_end: null,
    },
  })

  useEffect(() => {
    form.reset(
      initialValue ?? {
        ...emptyBuscaPorPlacaDraft(),
        period_start: null,
        period_end: null,
      },
    )
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  return (
    <form onSubmit={form.handleSubmit((value) => onSave(value, editIndex))}>
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
          />

          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input
              className={`h-11 ${styles.inputBg}`}
              {...form.register('plate')}
            />
            {errors.plate?.message && (
              <p className="text-xs text-destructive">{errors.plate.message}</p>
            )}
          </div>
        </div>
      </div>

      <FooterButtons onCancel={onCancel} />
    </form>
  )
}

function BuscaPorRadarForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
}: SimpleFormProps<TicketCreateForm['busca_por_radar'][number]>) {
  const form = useForm<TicketCreateForm['busca_por_radar'][number]>({
    resolver: zodResolver(serviceBuscaPorRadarSchema),
    defaultValues: initialValue ?? {
      ...emptyBuscaPorRadarDraft(),
      period_start: null,
      period_end: null,
      radar_address: null,
    },
  })

  useEffect(() => {
    form.reset(
      initialValue ?? {
        ...emptyBuscaPorRadarDraft(),
        period_start: null,
        period_end: null,
        radar_address: null,
      },
    )
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  return (
    <form onSubmit={form.handleSubmit((value) => onSave(value, editIndex))}>
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
          />
          {(errors.period_start?.message || errors.period_end?.message) && (
            <p className="text-xs text-destructive">
              {errors.period_start?.message || errors.period_end?.message}
            </p>
          )}

          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input
              className={`h-11 ${styles.inputBg}`}
              {...form.register('plate')}
            />
            {errors.plate?.message && (
              <p className="text-xs text-destructive">{errors.plate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Orientação</Label>
            <Textarea
              className={`min-h-[92px] ${styles.inputBg}`}
              {...form.register('radar_address')}
            />
            {errors.radar_address?.message && (
              <p className="text-xs text-destructive">
                {errors.radar_address.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <FooterButtons onCancel={onCancel} />
    </form>
  )
}

function CercoForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
}: SimpleFormProps<TicketCreateForm['cerco_eletronico'][number]>) {
  const form = useForm<TicketCreateForm['cerco_eletronico'][number]>({
    resolver: zodResolver(serviceCercoSchema),
    defaultValues: initialValue ?? {
      ...emptyCercoDraft(),
      vehicle_observations: null,
    },
  })

  useEffect(() => {
    form.reset(
      initialValue ?? {
        ...emptyCercoDraft(),
        vehicle_observations: null,
      },
    )
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  return (
    <form onSubmit={form.handleSubmit((value) => onSave(value, editIndex))}>
      <div className={styles.serviceModalBody}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input
              className={`h-11 ${styles.inputBg}`}
              {...form.register('plate')}
            />
            {errors.plate?.message && (
              <p className="text-xs text-destructive">{errors.plate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Observações do veículo</Label>
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

      <FooterButtons onCancel={onCancel} />
    </form>
  )
}

function BuscaPorImagemForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
}: SimpleFormProps<TicketCreateForm['busca_por_imagem'][number]>) {
  const form = useForm<TicketCreateForm['busca_por_imagem'][number]>({
    resolver: zodResolver(serviceBuscaPorImagemSchema),
    defaultValues: initialValue ?? {
      ...emptyBuscaPorImagemDraft(),
      period_start: null,
      period_end: null,
      plate: null,
      address: null,
      description: null,
    },
  })

  useEffect(() => {
    form.reset(
      initialValue ?? {
        ...emptyBuscaPorImagemDraft(),
        period_start: null,
        period_end: null,
        plate: null,
        address: null,
        description: null,
      },
    )
  }, [initialValue, form])

  const {
    formState: { errors },
  } = form

  return (
    <form onSubmit={form.handleSubmit((value) => onSave(value, editIndex))}>
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
          />
          {(errors.period_start?.message || errors.period_end?.message) && (
            <p className="text-xs text-destructive">
              {errors.period_start?.message || errors.period_end?.message}
            </p>
          )}

          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input
              className={`h-11 ${styles.inputBg}`}
              {...form.register('plate')}
            />
            {errors.plate?.message && (
              <p className="text-xs text-destructive">{errors.plate.message}</p>
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

      <FooterButtons onCancel={onCancel} />
    </form>
  )
}

function toCorrelataDraft(
  value?:
    | TicketCreateForm['placas_correlatas'][number]
    | TicketCreateForm['placas_conjuntas'][number],
): CorrelataDraft {
  return {
    items: (value?.items?.length
      ? value.items
      : [{ plate: '', period_start: '', period_end: '' }]
    ).map((item) => ({
      plate: item?.plate ?? '',
      period_start: item?.period_start ?? '',
      period_end: item?.period_end ?? '',
    })),
    interest_interval_minutes: value?.interest_interval_minutes ?? 1,
    detection_count: value?.detection_count ?? 10,
    detection: value?.detection ?? null,
  }
}

function fromCorrelataDraft(draft: CorrelataDraft) {
  return {
    items: draft.items.map((item) => ({
      plate: item.plate,
      period_start: item.period_start || null,
      period_end: item.period_end || null,
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
}: SimpleFormProps<TicketCreateForm['placas_correlatas'][number]>) {
  const form = useForm<TicketCreateForm['placas_correlatas'][number]>({
    resolver: zodResolver(servicePlacasCorrelatasSchema),
    defaultValues: initialValue ?? emptyCorrelataDraft(),
  })

  useEffect(() => {
    form.reset(initialValue ?? emptyCorrelataDraft())
  }, [initialValue, form])
  const draft = toCorrelataDraft(form.watch())
  return (
    <form
      className={styles.serviceModalFormScroll}
      onSubmit={form.handleSubmit((value) => onSave(value, editIndex))}
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

            form.trigger().catch(() => {})
          }}
          onAdd={() => {}}
          hideAddButton
          useCalendarStyle
          errors={toRecordErrors(form.formState.errors)}
        />
      </div>

      <FooterButtons onCancel={onCancel} />
    </form>
  )
}

function PlacasConjuntasForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
}: SimpleFormProps<TicketCreateForm['placas_conjuntas'][number]>) {
  const form = useForm<TicketCreateForm['placas_conjuntas'][number]>({
    resolver: zodResolver(servicePlacasConjuntasSchema),
    defaultValues: initialValue ?? emptyCorrelataDraft(),
  })

  useEffect(() => {
    form.reset(initialValue ?? emptyCorrelataDraft())
  }, [initialValue, form])
  const draft = toCorrelataDraft(form.watch())
  return (
    <form
      className={styles.serviceModalFormScroll}
      onSubmit={form.handleSubmit((value) => onSave(value, editIndex))}
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

            form.trigger().catch(() => {})
          }}
          onAdd={() => {}}
          hideAddButton
          useCalendarStyle
          errors={toRecordErrors(form.formState.errors)}
        />
      </div>

      <FooterButtons onCancel={onCancel} />
    </form>
  )
}

function ReservaImagemForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
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
    <form onSubmit={form.handleSubmit((value) => onSave(value, editIndex))}>
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

      <FooterButtons onCancel={onCancel} />
    </form>
  )
}

function AnaliseImagemForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
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
    <form onSubmit={form.handleSubmit((value) => onSave(value, editIndex))}>
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

      <FooterButtons onCancel={onCancel} />
    </form>
  )
}

function OutrosForm({
  initialValue,
  editIndex,
  onCancel,
  onSave,
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
    <form onSubmit={form.handleSubmit((value) => onSave(value, editIndex))}>
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

      <FooterButtons onCancel={onCancel} />
    </form>
  )
}

function FooterButtons({ onCancel }: { onCancel: () => void }) {
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
