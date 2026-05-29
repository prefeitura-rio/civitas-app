'use client'

import { Plus, Trash } from 'lucide-react'
import { Fragment, type ReactNode, type SetStateAction } from 'react'

import type { OpenServiceKey } from '@/app/(app)/demandas/criar/ticket-create/ticket-create.constant'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TicketDetection } from '@/http/tickets/get-ticket-by-id'
import type { TicketServicosOut } from '@/http/tickets/ticket-servicos'
import { formatCPF, maskPlateBR } from '@/utils/string-formatters'

import styles from '../ticket-detail.module.css'
import {
  cloneTicketServicos,
  newNestedEntityId,
} from '../ticket-servicos-mapper'

function nowIso() {
  return new Date().toISOString()
}

type Props = {
  kind: OpenServiceKey
  index: number
  draft: TicketServicosOut
  onChange: (next: TicketServicosOut) => void
  readOnly?: boolean
  /** Erros de validação quando o serviço está como concluído (ex.: `period_start`, `plates.0.plate`). */
  fieldErrors?: Record<string, string> | null
}

function servicosReadonlyShell(readOnly: boolean | undefined, node: ReactNode) {
  if (!readOnly) return node
  return (
    <fieldset className={styles.servicosReadonlyFieldset} disabled>
      {node}
    </fieldset>
  )
}

type ServicosPeriodPatch = {
  period_start: string | null
  period_end: string | null
}

function isoToDateValue(iso: string | null | undefined): Date | undefined {
  if (iso == null || iso === '') return undefined
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function datePickerValueToIso(
  value: SetStateAction<Date | undefined>,
  previousIso: string | null | undefined,
): string | null {
  const previousDate = isoToDateValue(previousIso)
  const nextDate = typeof value === 'function' ? value(previousDate) : value
  if (!nextDate || Number.isNaN(nextDate.getTime())) return null
  return nextDate.toISOString()
}

function ServicosSearchPeriodInputs({
  periodStart,
  periodEnd,
  readOnly,
  onPatch,
}: {
  periodStart: string | null | undefined
  periodEnd: string | null | undefined
  readOnly?: boolean
  onPatch: (next: ServicosPeriodPatch) => void
}) {
  const startDate = isoToDateValue(periodStart)
  const endDate = isoToDateValue(periodEnd)

  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
      <DatePicker
        type="datetime-local"
        className={styles.servicosDateTimeInput}
        value={startDate}
        onChange={(value) => {
          const newPeriodStart = datePickerValueToIso(value, periodStart)
          let nextPeriodEnd: string | null =
            periodEnd != null && periodEnd !== '' ? periodEnd : null
          if (
            newPeriodStart &&
            nextPeriodEnd &&
            new Date(nextPeriodEnd) < new Date(newPeriodStart)
          ) {
            nextPeriodEnd = newPeriodStart
          }
          onPatch({ period_start: newPeriodStart, period_end: nextPeriodEnd })
        }}
        toDate={endDate}
        timePickerDisableFuture={false}
        disabled={readOnly}
        placeholder="Início"
      />
      <DatePicker
        type="datetime-local"
        className={styles.servicosDateTimeInput}
        value={endDate}
        onChange={(value) => {
          const newPeriodEnd = datePickerValueToIso(value, periodEnd)
          let nextPeriodStart: string | null =
            periodStart != null && periodStart !== '' ? periodStart : null
          if (
            nextPeriodStart &&
            newPeriodEnd &&
            new Date(newPeriodEnd) < new Date(nextPeriodStart)
          ) {
            nextPeriodStart = newPeriodEnd
          }
          onPatch({ period_start: nextPeriodStart, period_end: newPeriodEnd })
        }}
        fromDate={startDate}
        timePickerDisableFuture={false}
        disabled={readOnly}
        placeholder="Fim"
      />
    </div>
  )
}

export function ServicosExpandedForm({
  kind,
  index,
  draft,
  onChange,
  readOnly,
  fieldErrors,
}: Props) {
  const patch = (fn: (n: TicketServicosOut) => void) => {
    const n = cloneTicketServicos(draft)
    fn(n)
    onChange(n)
  }

  switch (kind) {
    case 'busca_por_placa': {
      const item = draft.busca_por_placa[index]
      if (!item) return null
      return servicosReadonlyShell(
        readOnly,
        <div className={styles.servicosFields}>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Período da busca</span>
            <ServicosSearchPeriodInputs
              periodStart={item.period_start}
              periodEnd={item.period_end}
              readOnly={readOnly}
              onPatch={(p) =>
                patch((n) => {
                  n.busca_por_placa[index] = {
                    ...n.busca_por_placa[index],
                    ...p,
                  }
                })
              }
            />
            {(fieldErrors?.period_start || fieldErrors?.period_end) && (
              <p className="text-xs text-destructive">
                {fieldErrors?.period_start || fieldErrors?.period_end}
              </p>
            )}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Placas do veículo</span>
            <div className={styles.servicosStack}>
              {item.plates.map((p, pi) => (
                <Fragment key={p.id}>
                  <div className={styles.servicosPlateRow}>
                    <Input
                      className={`${styles.servicosInput} ${styles.servicosPlateInput}`}
                      value={p.plate ?? ''}
                      onChange={(e) =>
                        patch((n) => {
                          const plates = [...n.busca_por_placa[index].plates]
                          plates[pi] = {
                            ...plates[pi],
                            plate: maskPlateBR(e.target.value),
                          }
                          n.busca_por_placa[index] = {
                            ...n.busca_por_placa[index],
                            plates,
                          }
                        })
                      }
                      placeholder="Placa"
                    />
                    {item.plates.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosIconBtn}
                        title="Remover placa"
                        onClick={() =>
                          patch((n) => {
                            const plates = n.busca_por_placa[
                              index
                            ].plates.filter((_, i) => i !== pi)
                            n.busca_por_placa[index] = {
                              ...n.busca_por_placa[index],
                              plates:
                                plates.length > 0
                                  ? plates
                                  : [
                                      {
                                        id: newNestedEntityId(),
                                        created_at: nowIso(),
                                        plate: '',
                                      },
                                    ],
                            }
                          })
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {pi === item.plates.length - 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosAddLineBtn}
                        onClick={() =>
                          patch((n) => {
                            const plates = [
                              ...n.busca_por_placa[index].plates,
                              {
                                id: newNestedEntityId(),
                                created_at: nowIso(),
                                plate: '',
                              },
                            ]
                            n.busca_por_placa[index] = {
                              ...n.busca_por_placa[index],
                              plates,
                            }
                          })
                        }
                        aria-label="Adicionar placa"
                        title="Adicionar placa"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                  {fieldErrors?.[`plates.${pi}.plate`] ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors[`plates.${pi}.plate`]}
                    </p>
                  ) : null}
                </Fragment>
              ))}
            </div>
          </div>
        </div>,
      )
    }

    case 'busca_por_radar': {
      const item = draft.busca_por_radar[index]
      if (!item) return null
      return servicosReadonlyShell(
        readOnly,
        <div className={styles.servicosFields}>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Período da busca</span>
            <ServicosSearchPeriodInputs
              periodStart={item.period_start}
              periodEnd={item.period_end}
              readOnly={readOnly}
              onPatch={(p) =>
                patch((n) => {
                  n.busca_por_radar[index] = {
                    ...n.busca_por_radar[index],
                    ...p,
                  }
                })
              }
            />
            {(fieldErrors?.period_start || fieldErrors?.period_end) && (
              <p className="text-xs text-destructive">
                {fieldErrors?.period_start || fieldErrors?.period_end}
              </p>
            )}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Orientação</span>
            <Textarea
              className={styles.servicosTextarea}
              value={item.orientation ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.busca_por_radar[index] = {
                    ...n.busca_por_radar[index],
                    orientation: e.target.value || null,
                  }
                })
              }
              rows={4}
            />
            {fieldErrors?.orientation ? (
              <p className="text-xs text-destructive">
                {fieldErrors.orientation}
              </p>
            ) : null}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Endereço do radar</span>
            <Textarea
              className={styles.servicosTextarea}
              value={item.radar_address ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.busca_por_radar[index] = {
                    ...n.busca_por_radar[index],
                    radar_address: e.target.value || null,
                  }
                })
              }
              rows={3}
            />
            {fieldErrors?.radar_address ? (
              <p className="text-xs text-destructive">
                {fieldErrors.radar_address}
              </p>
            ) : null}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Placas do veículo</span>
            <div className={styles.servicosStack}>
              {item.plates.map((p, pi) => (
                <Fragment key={p.id}>
                  <div className={styles.servicosPlateRow}>
                    <Input
                      className={`${styles.servicosInput} ${styles.servicosPlateInput}`}
                      value={p.plate ?? ''}
                      onChange={(e) =>
                        patch((n) => {
                          const plates = [...n.busca_por_radar[index].plates]
                          plates[pi] = {
                            ...plates[pi],
                            plate: maskPlateBR(e.target.value),
                          }
                          n.busca_por_radar[index] = {
                            ...n.busca_por_radar[index],
                            plates,
                          }
                        })
                      }
                    />
                    {item.plates.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosIconBtn}
                        onClick={() =>
                          patch((n) => {
                            const plates = n.busca_por_radar[
                              index
                            ].plates.filter((_, i) => i !== pi)
                            n.busca_por_radar[index] = {
                              ...n.busca_por_radar[index],
                              plates:
                                plates.length > 0
                                  ? plates
                                  : [
                                      {
                                        id: newNestedEntityId(),
                                        created_at: nowIso(),
                                        plate: '',
                                      },
                                    ],
                            }
                          })
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {pi === item.plates.length - 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosAddLineBtn}
                        onClick={() =>
                          patch((n) => {
                            n.busca_por_radar[index] = {
                              ...n.busca_por_radar[index],
                              plates: [
                                ...n.busca_por_radar[index].plates,
                                {
                                  id: newNestedEntityId(),
                                  created_at: nowIso(),
                                  plate: '',
                                },
                              ],
                            }
                          })
                        }
                        aria-label="Adicionar placa"
                        title="Adicionar placa"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                  {fieldErrors?.[`plates.${pi}.plate`] ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors[`plates.${pi}.plate`]}
                    </p>
                  ) : null}
                </Fragment>
              ))}
            </div>
          </div>
        </div>,
      )
    }

    case 'cerco_eletronico': {
      const item = draft.cerco_eletronico[index]
      if (!item) return null
      return servicosReadonlyShell(
        readOnly,
        <div className={styles.servicosFields}>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Placa do veículo</span>
            <Input
              className={`${styles.servicosInput} ${styles.servicosPlateInput}`}
              value={item.plate ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.cerco_eletronico[index] = {
                    ...n.cerco_eletronico[index],
                    plate: maskPlateBR(e.target.value) || null,
                  }
                })
              }
            />
            {fieldErrors?.plate ? (
              <p className="text-xs text-destructive">{fieldErrors.plate}</p>
            ) : null}
          </div>
          <div className={styles.servicosDivider} />
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>
              Observações do veículo
            </span>
            <Textarea
              className={styles.servicosTextarea}
              value={item.vehicle_observations ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.cerco_eletronico[index] = {
                    ...n.cerco_eletronico[index],
                    vehicle_observations: e.target.value || null,
                  }
                })
              }
              rows={4}
            />
            {fieldErrors?.vehicle_observations ? (
              <p className="text-xs text-destructive">
                {fieldErrors.vehicle_observations}
              </p>
            ) : null}
          </div>
        </div>,
      )
    }

    case 'busca_por_imagem': {
      const item = draft.busca_por_imagem[index]
      if (!item) return null
      return servicosReadonlyShell(
        readOnly,
        <div className={styles.servicosFields}>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Período da busca</span>
            <ServicosSearchPeriodInputs
              periodStart={item.period_start}
              periodEnd={item.period_end}
              readOnly={readOnly}
              onPatch={(p) =>
                patch((n) => {
                  n.busca_por_imagem[index] = {
                    ...n.busca_por_imagem[index],
                    ...p,
                  }
                })
              }
            />
            {(fieldErrors?.period_start || fieldErrors?.period_end) && (
              <p className="text-xs text-destructive">
                {fieldErrors?.period_start || fieldErrors?.period_end}
              </p>
            )}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Endereços</span>
            <div className={styles.servicosStack}>
              {(item.addresses ?? []).map((addr, ai) => (
                <Fragment key={addr.id}>
                  <div className={styles.servicosPlateRow}>
                    <Input
                      className={`${styles.servicosInput} ${styles.servicosAddressInput}`}
                      placeholder="Endereço"
                      value={addr.address}
                      onChange={(e) =>
                        patch((n) => {
                          const addresses = [
                            ...(n.busca_por_imagem[index].addresses ?? []),
                          ]
                          addresses[ai] = {
                            ...addresses[ai],
                            address: e.target.value,
                          }
                          n.busca_por_imagem[index] = {
                            ...n.busca_por_imagem[index],
                            addresses,
                          }
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={styles.servicosIconBtn}
                      title="Remover endereço"
                      onClick={() =>
                        patch((n) => {
                          const addresses = (
                            n.busca_por_imagem[index].addresses ?? []
                          ).filter((_, i) => i !== ai)
                          n.busca_por_imagem[index] = {
                            ...n.busca_por_imagem[index],
                            addresses,
                          }
                        })
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {ai === (item.addresses ?? []).length - 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosAddLineBtn}
                        onClick={() =>
                          patch((n) => {
                            n.busca_por_imagem[index] = {
                              ...n.busca_por_imagem[index],
                              addresses: [
                                ...(n.busca_por_imagem[index].addresses ?? []),
                                {
                                  id: newNestedEntityId(),
                                  created_at: nowIso(),
                                  address: '',
                                },
                              ],
                            }
                          })
                        }
                        aria-label="Adicionar endereço"
                        title="Adicionar endereço"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </Fragment>
              ))}
              {(item.addresses ?? []).length === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={styles.servicosAddLineBtn}
                  onClick={() =>
                    patch((n) => {
                      n.busca_por_imagem[index] = {
                        ...n.busca_por_imagem[index],
                        addresses: [
                          {
                            id: newNestedEntityId(),
                            created_at: nowIso(),
                            address: '',
                          },
                        ],
                      }
                    })
                  }
                  aria-label="Adicionar endereço"
                  title="Adicionar endereço"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Orientação</span>
            <Textarea
              className={styles.servicosTextarea}
              value={item.description ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.busca_por_imagem[index] = {
                    ...n.busca_por_imagem[index],
                    description: e.target.value || null,
                  }
                })
              }
              rows={4}
            />
            {fieldErrors?.description ? (
              <p className="text-xs text-destructive">
                {fieldErrors.description}
              </p>
            ) : null}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Câmeras</span>
            <div className={styles.servicosStack}>
              {(item.cameras ?? []).map((cam, ci) => (
                <Fragment key={cam.id}>
                  <div className={styles.servicosPlateRow}>
                    <Input
                      className={`${styles.servicosInput} ${styles.servicosPlateInput}`}
                      placeholder="Código da câmera"
                      value={cam.camera_code}
                      onChange={(e) =>
                        patch((n) => {
                          const cameras = [
                            ...(n.busca_por_imagem[index].cameras ?? []),
                          ]
                          cameras[ci] = {
                            ...cameras[ci],
                            camera_code: e.target.value,
                          }
                          n.busca_por_imagem[index] = {
                            ...n.busca_por_imagem[index],
                            cameras,
                          }
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={styles.servicosIconBtn}
                      title="Remover câmera"
                      onClick={() =>
                        patch((n) => {
                          const cameras = (
                            n.busca_por_imagem[index].cameras ?? []
                          ).filter((_, i) => i !== ci)
                          n.busca_por_imagem[index] = {
                            ...n.busca_por_imagem[index],
                            cameras,
                          }
                        })
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {ci === (item.cameras ?? []).length - 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosAddLineBtn}
                        onClick={() =>
                          patch((n) => {
                            n.busca_por_imagem[index] = {
                              ...n.busca_por_imagem[index],
                              cameras: [
                                ...(n.busca_por_imagem[index].cameras ?? []),
                                {
                                  id: newNestedEntityId(),
                                  created_at: nowIso(),
                                  camera_code: '',
                                },
                              ],
                            }
                          })
                        }
                        aria-label="Adicionar câmera"
                        title="Adicionar câmera"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </Fragment>
              ))}
              {(item.cameras ?? []).length === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={styles.servicosAddLineBtn}
                  onClick={() =>
                    patch((n) => {
                      n.busca_por_imagem[index] = {
                        ...n.busca_por_imagem[index],
                        cameras: [
                          {
                            id: newNestedEntityId(),
                            created_at: nowIso(),
                            camera_code: '',
                          },
                        ],
                      }
                    })
                  }
                  aria-label="Adicionar câmera"
                  title="Adicionar câmera"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>,
      )
    }

    case 'placas_correlatas':
      return (
        <CorrelataForm
          draft={draft}
          index={index}
          patch={patch}
          mode="correlatas"
          readOnly={readOnly}
          fieldErrors={fieldErrors}
        />
      )
    case 'placas_conjuntas':
      return (
        <CorrelataForm
          draft={draft}
          index={index}
          patch={patch}
          mode="conjuntas"
          readOnly={readOnly}
          fieldErrors={fieldErrors}
        />
      )

    case 'reserva_de_imagem': {
      const item = draft.reserva_de_imagem[index]
      if (!item) return null
      return servicosReadonlyShell(
        readOnly,
        <div className={styles.servicosFields}>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Período da busca</span>
            <ServicosSearchPeriodInputs
              periodStart={item.period_start}
              periodEnd={item.period_end}
              readOnly={readOnly}
              onPatch={(p) =>
                patch((n) => {
                  n.reserva_de_imagem[index] = {
                    ...n.reserva_de_imagem[index],
                    ...p,
                  }
                })
              }
            />
            {(fieldErrors?.period_start || fieldErrors?.period_end) && (
              <p className="text-xs text-destructive">
                {fieldErrors?.period_start || fieldErrors?.period_end}
              </p>
            )}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Orientação</span>
            <Textarea
              className={styles.servicosTextarea}
              value={item.orientation ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.reserva_de_imagem[index] = {
                    ...n.reserva_de_imagem[index],
                    orientation: e.target.value || null,
                  }
                })
              }
              rows={4}
            />
            {fieldErrors?.orientation ? (
              <p className="text-xs text-destructive">
                {fieldErrors.orientation}
              </p>
            ) : null}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Endereços</span>
            <div className={styles.servicosStack}>
              {(item.addresses ?? []).map((addr, ai) => (
                <Fragment key={addr.id}>
                  <div className={styles.servicosPlateRow}>
                    <Input
                      className={`${styles.servicosInput} ${styles.servicosAddressInput}`}
                      placeholder="Endereço"
                      value={addr.address}
                      onChange={(e) =>
                        patch((n) => {
                          const addresses = [
                            ...(n.reserva_de_imagem[index].addresses ?? []),
                          ]
                          addresses[ai] = {
                            ...addresses[ai],
                            address: e.target.value,
                          }
                          n.reserva_de_imagem[index] = {
                            ...n.reserva_de_imagem[index],
                            addresses,
                          }
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={styles.servicosIconBtn}
                      title="Remover endereço"
                      onClick={() =>
                        patch((n) => {
                          const addresses = (
                            n.reserva_de_imagem[index].addresses ?? []
                          ).filter((_, i) => i !== ai)
                          n.reserva_de_imagem[index] = {
                            ...n.reserva_de_imagem[index],
                            addresses,
                          }
                        })
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {ai === (item.addresses ?? []).length - 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosAddLineBtn}
                        onClick={() =>
                          patch((n) => {
                            n.reserva_de_imagem[index] = {
                              ...n.reserva_de_imagem[index],
                              addresses: [
                                ...(n.reserva_de_imagem[index].addresses ?? []),
                                {
                                  id: newNestedEntityId(),
                                  created_at: nowIso(),
                                  address: '',
                                },
                              ],
                            }
                          })
                        }
                        aria-label="Adicionar endereço"
                        title="Adicionar endereço"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </Fragment>
              ))}
              {(item.addresses ?? []).length === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={styles.servicosAddLineBtn}
                  onClick={() =>
                    patch((n) => {
                      n.reserva_de_imagem[index] = {
                        ...n.reserva_de_imagem[index],
                        addresses: [
                          {
                            id: newNestedEntityId(),
                            created_at: nowIso(),
                            address: '',
                          },
                        ],
                      }
                    })
                  }
                  aria-label="Adicionar endereço"
                  title="Adicionar endereço"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Câmeras</span>
            <div className={styles.servicosStack}>
              {(item.cameras ?? []).map((cam, ci) => (
                <Fragment key={cam.id}>
                  <div className={styles.servicosPlateRow}>
                    <Input
                      className={`${styles.servicosInput} ${styles.servicosPlateInput}`}
                      placeholder="Código da câmera"
                      value={cam.camera_code}
                      onChange={(e) =>
                        patch((n) => {
                          const cameras = [
                            ...(n.reserva_de_imagem[index].cameras ?? []),
                          ]
                          cameras[ci] = {
                            ...cameras[ci],
                            camera_code: e.target.value,
                          }
                          n.reserva_de_imagem[index] = {
                            ...n.reserva_de_imagem[index],
                            cameras,
                          }
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={styles.servicosIconBtn}
                      title="Remover câmera"
                      onClick={() =>
                        patch((n) => {
                          const cameras = (
                            n.reserva_de_imagem[index].cameras ?? []
                          ).filter((_, i) => i !== ci)
                          n.reserva_de_imagem[index] = {
                            ...n.reserva_de_imagem[index],
                            cameras,
                          }
                        })
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {ci === (item.cameras ?? []).length - 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosAddLineBtn}
                        onClick={() =>
                          patch((n) => {
                            n.reserva_de_imagem[index] = {
                              ...n.reserva_de_imagem[index],
                              cameras: [
                                ...(n.reserva_de_imagem[index].cameras ?? []),
                                {
                                  id: newNestedEntityId(),
                                  created_at: nowIso(),
                                  camera_code: '',
                                },
                              ],
                            }
                          })
                        }
                        aria-label="Adicionar câmera"
                        title="Adicionar câmera"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </Fragment>
              ))}
              {(item.cameras ?? []).length === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={styles.servicosAddLineBtn}
                  onClick={() =>
                    patch((n) => {
                      n.reserva_de_imagem[index] = {
                        ...n.reserva_de_imagem[index],
                        cameras: [
                          {
                            id: newNestedEntityId(),
                            created_at: nowIso(),
                            camera_code: '',
                          },
                        ],
                      }
                    })
                  }
                  aria-label="Adicionar câmera"
                  title="Adicionar câmera"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>,
      )
    }

    case 'analise_de_imagem': {
      const item = draft.analise_de_imagem[index]
      if (!item) return null
      return servicosReadonlyShell(
        readOnly,
        <div className={styles.servicosFields}>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Período da busca</span>
            <ServicosSearchPeriodInputs
              periodStart={item.period_start}
              periodEnd={item.period_end}
              readOnly={readOnly}
              onPatch={(p) =>
                patch((n) => {
                  n.analise_de_imagem[index] = {
                    ...n.analise_de_imagem[index],
                    ...p,
                  }
                })
              }
            />
            {(fieldErrors?.period_start || fieldErrors?.period_end) && (
              <p className="text-xs text-destructive">
                {fieldErrors?.period_start || fieldErrors?.period_end}
              </p>
            )}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Orientação</span>
            <Textarea
              className={styles.servicosTextarea}
              value={item.orientation ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.analise_de_imagem[index] = {
                    ...n.analise_de_imagem[index],
                    orientation: e.target.value || null,
                  }
                })
              }
              rows={4}
            />
            {fieldErrors?.orientation ? (
              <p className="text-xs text-destructive">
                {fieldErrors.orientation}
              </p>
            ) : null}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Endereços</span>
            <div className={styles.servicosStack}>
              {(item.addresses ?? []).map((addr, ai) => (
                <Fragment key={addr.id}>
                  <div className={styles.servicosPlateRow}>
                    <Input
                      className={`${styles.servicosInput} ${styles.servicosAddressInput}`}
                      placeholder="Endereço"
                      value={addr.address}
                      onChange={(e) =>
                        patch((n) => {
                          const addresses = [
                            ...(n.analise_de_imagem[index].addresses ?? []),
                          ]
                          addresses[ai] = {
                            ...addresses[ai],
                            address: e.target.value,
                          }
                          n.analise_de_imagem[index] = {
                            ...n.analise_de_imagem[index],
                            addresses,
                          }
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={styles.servicosIconBtn}
                      title="Remover endereço"
                      onClick={() =>
                        patch((n) => {
                          const addresses = (
                            n.analise_de_imagem[index].addresses ?? []
                          ).filter((_, i) => i !== ai)
                          n.analise_de_imagem[index] = {
                            ...n.analise_de_imagem[index],
                            addresses,
                          }
                        })
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {ai === (item.addresses ?? []).length - 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosAddLineBtn}
                        onClick={() =>
                          patch((n) => {
                            n.analise_de_imagem[index] = {
                              ...n.analise_de_imagem[index],
                              addresses: [
                                ...(n.analise_de_imagem[index].addresses ?? []),
                                {
                                  id: newNestedEntityId(),
                                  created_at: nowIso(),
                                  address: '',
                                },
                              ],
                            }
                          })
                        }
                        aria-label="Adicionar endereço"
                        title="Adicionar endereço"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </Fragment>
              ))}
              {(item.addresses ?? []).length === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={styles.servicosAddLineBtn}
                  onClick={() =>
                    patch((n) => {
                      n.analise_de_imagem[index] = {
                        ...n.analise_de_imagem[index],
                        addresses: [
                          {
                            id: newNestedEntityId(),
                            created_at: nowIso(),
                            address: '',
                          },
                        ],
                      }
                    })
                  }
                  aria-label="Adicionar endereço"
                  title="Adicionar endereço"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Câmeras</span>
            <div className={styles.servicosStack}>
              {(item.cameras ?? []).map((cam, ci) => (
                <Fragment key={cam.id}>
                  <div className={styles.servicosPlateRow}>
                    <Input
                      className={`${styles.servicosInput} ${styles.servicosPlateInput}`}
                      placeholder="Código da câmera"
                      value={cam.camera_code}
                      onChange={(e) =>
                        patch((n) => {
                          const cameras = [
                            ...(n.analise_de_imagem[index].cameras ?? []),
                          ]
                          cameras[ci] = {
                            ...cameras[ci],
                            camera_code: e.target.value,
                          }
                          n.analise_de_imagem[index] = {
                            ...n.analise_de_imagem[index],
                            cameras,
                          }
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={styles.servicosIconBtn}
                      title="Remover câmera"
                      onClick={() =>
                        patch((n) => {
                          const cameras = (
                            n.analise_de_imagem[index].cameras ?? []
                          ).filter((_, i) => i !== ci)
                          n.analise_de_imagem[index] = {
                            ...n.analise_de_imagem[index],
                            cameras,
                          }
                        })
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {ci === (item.cameras ?? []).length - 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={styles.servicosAddLineBtn}
                        onClick={() =>
                          patch((n) => {
                            n.analise_de_imagem[index] = {
                              ...n.analise_de_imagem[index],
                              cameras: [
                                ...(n.analise_de_imagem[index].cameras ?? []),
                                {
                                  id: newNestedEntityId(),
                                  created_at: nowIso(),
                                  camera_code: '',
                                },
                              ],
                            }
                          })
                        }
                        aria-label="Adicionar câmera"
                        title="Adicionar câmera"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </Fragment>
              ))}
              {(item.cameras ?? []).length === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={styles.servicosAddLineBtn}
                  onClick={() =>
                    patch((n) => {
                      n.analise_de_imagem[index] = {
                        ...n.analise_de_imagem[index],
                        cameras: [
                          {
                            id: newNestedEntityId(),
                            created_at: nowIso(),
                            camera_code: '',
                          },
                        ],
                      }
                    })
                  }
                  aria-label="Adicionar câmera"
                  title="Adicionar câmera"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>,
      )
    }

    case 'outros': {
      const item = draft.outros[index]
      if (!item) return null
      return servicosReadonlyShell(
        readOnly,
        <div className={styles.servicosFields}>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Orientação</span>
            <Textarea
              className={styles.servicosTextarea}
              value={item.orientation ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.outros[index] = {
                    ...n.outros[index],
                    orientation: e.target.value || null,
                  }
                })
              }
              rows={6}
            />
            {fieldErrors?.orientation ? (
              <p className="text-xs text-destructive">
                {fieldErrors.orientation}
              </p>
            ) : null}
          </div>
        </div>,
      )
    }

    case 'atlas_civitas': {
      const item = draft.atlas_civitas[index]
      if (!item) return null
      return servicosReadonlyShell(
        readOnly,
        <div className={styles.servicosFields}>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Nome</span>
            <Input
              className={styles.servicosInput}
              value={item.name ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.atlas_civitas[index] = {
                    ...n.atlas_civitas[index],
                    name: e.target.value || null,
                  }
                })
              }
            />
            {fieldErrors?.name ? (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            ) : null}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>E-mail</span>
            <Input
              className={styles.servicosInput}
              type="email"
              value={item.email ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.atlas_civitas[index] = {
                    ...n.atlas_civitas[index],
                    email: e.target.value || null,
                  }
                })
              }
            />
            {fieldErrors?.email ? (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            ) : null}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>CPF</span>
            <Input
              className={styles.servicosInput}
              value={item.cpf ? formatCPF(String(item.cpf)) : ''}
              onChange={(e) =>
                patch((n) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  n.atlas_civitas[index] = {
                    ...n.atlas_civitas[index],
                    cpf: digits.length ? digits : null,
                  }
                })
              }
            />
            {fieldErrors?.cpf ? (
              <p className="text-xs text-destructive">{fieldErrors.cpf}</p>
            ) : null}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Matrícula</span>
            <Input
              className={styles.servicosInput}
              value={item.registration ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.atlas_civitas[index] = {
                    ...n.atlas_civitas[index],
                    registration: e.target.value || null,
                  }
                })
              }
            />
            {fieldErrors?.registration ? (
              <p className="text-xs text-destructive">
                {fieldErrors.registration}
              </p>
            ) : null}
          </div>
        </div>,
      )
    }

    default:
      return null
  }
}

function CorrelataForm({
  draft,
  index,
  patch,
  mode,
  readOnly,
  fieldErrors,
}: {
  draft: TicketServicosOut
  index: number
  patch: (fn: (n: TicketServicosOut) => void) => void
  mode: 'correlatas' | 'conjuntas'
  readOnly?: boolean
  fieldErrors?: Record<string, string> | null
}) {
  const item =
    mode === 'correlatas'
      ? draft.placas_correlatas[index]
      : draft.placas_conjuntas[index]
  if (!item) return null

  const setDetection = (d: TicketDetection) =>
    patch((n) => {
      if (mode === 'correlatas') {
        n.placas_correlatas[index] = {
          ...n.placas_correlatas[index],
          detection: d,
        }
      } else {
        n.placas_conjuntas[index] = {
          ...n.placas_conjuntas[index],
          detection: d,
        }
      }
    })

  return servicosReadonlyShell(
    readOnly,
    <div className={styles.servicosFields}>
      <div className={styles.servicosFieldBlock}>
        <span className={styles.servicosFieldLabel}>Período da busca</span>
        <ServicosSearchPeriodInputs
          periodStart={item.period_start}
          periodEnd={item.period_end}
          readOnly={readOnly}
          onPatch={(p) =>
            patch((n) => {
              if (mode === 'correlatas') {
                n.placas_correlatas[index] = {
                  ...n.placas_correlatas[index],
                  ...p,
                }
              } else {
                n.placas_conjuntas[index] = {
                  ...n.placas_conjuntas[index],
                  ...p,
                }
              }
            })
          }
        />
        {(fieldErrors?.period_start || fieldErrors?.period_end) && (
          <p className="text-xs text-destructive">
            {fieldErrors?.period_start || fieldErrors?.period_end}
          </p>
        )}
      </div>
      <div className={styles.servicosTwoCol}>
        <div className={styles.servicosFieldBlock}>
          <span className={styles.servicosFieldLabel}>
            Intervalo de Interesse
          </span>
          <Input
            type="number"
            min={1}
            max={5}
            className={styles.servicosInput}
            value={item.interest_interval_minutes ?? ''}
            onChange={(e) =>
              patch((n) => {
                const parsed =
                  e.target.value === ''
                    ? null
                    : Number.parseInt(e.target.value, 10)
                const val =
                  parsed == null || Number.isNaN(parsed) ? null : parsed
                if (mode === 'correlatas') {
                  n.placas_correlatas[index] = {
                    ...n.placas_correlatas[index],
                    interest_interval_minutes: val,
                  }
                } else {
                  n.placas_conjuntas[index] = {
                    ...n.placas_conjuntas[index],
                    interest_interval_minutes: val,
                  }
                }
              })
            }
          />
          {fieldErrors?.interest_interval_minutes ? (
            <p className="text-xs text-destructive">
              {fieldErrors.interest_interval_minutes}
            </p>
          ) : null}
        </div>
        <div className={styles.servicosFieldBlock}>
          <span className={styles.servicosFieldLabel}>
            Quantidade de Detecção
          </span>
          <Input
            type="number"
            min={5}
            max={50}
            className={styles.servicosInput}
            value={item.detection_count ?? ''}
            onChange={(e) =>
              patch((n) => {
                const parsed =
                  e.target.value === ''
                    ? null
                    : Number.parseInt(e.target.value, 10)
                const val =
                  parsed == null || Number.isNaN(parsed) ? null : parsed
                if (mode === 'correlatas') {
                  n.placas_correlatas[index] = {
                    ...n.placas_correlatas[index],
                    detection_count: val,
                  }
                } else {
                  n.placas_conjuntas[index] = {
                    ...n.placas_conjuntas[index],
                    detection_count: val,
                  }
                }
              })
            }
          />
          {fieldErrors?.detection_count ? (
            <p className="text-xs text-destructive">
              {fieldErrors.detection_count}
            </p>
          ) : null}
        </div>
      </div>
      <div className={styles.servicosFieldBlock}>
        <span className={styles.servicosFieldLabel}>Detecção</span>
        <div className={styles.servicosSegRow}>
          {(['ANTES', 'DEPOIS', 'AMBOS'] as const).map((d) => (
            <button
              key={d}
              type="button"
              className={`${styles.servicosSegBtn} ${
                item.detection === d ? styles.servicosSegBtnActive : ''
              }`}
              onClick={() => setDetection(d)}
            >
              {d === 'ANTES' ? 'Antes' : d === 'DEPOIS' ? 'Depois' : 'Ambos'}
            </button>
          ))}
        </div>
        {fieldErrors?.detection ? (
          <p className="text-xs text-destructive">{fieldErrors.detection}</p>
        ) : null}
      </div>
      <div className={styles.servicosFieldBlock}>
        <span className={styles.servicosFieldLabel}>Placas</span>
        <div className={styles.servicosStack}>
          {item.plates.map((p, pi) => (
            <Fragment key={p.id}>
              <div className={styles.servicosPlateRow}>
                <Input
                  className={`${styles.servicosInput} ${styles.servicosPlateInput}`}
                  value={p.plate ?? ''}
                  onChange={(e) =>
                    patch((n) => {
                      if (mode === 'correlatas') {
                        const plates = [...n.placas_correlatas[index].plates]
                        plates[pi] = {
                          ...plates[pi],
                          plate: maskPlateBR(e.target.value),
                        }
                        n.placas_correlatas[index] = {
                          ...n.placas_correlatas[index],
                          plates,
                        }
                      } else {
                        const plates = [...n.placas_conjuntas[index].plates]
                        plates[pi] = {
                          ...plates[pi],
                          plate: maskPlateBR(e.target.value),
                        }
                        n.placas_conjuntas[index] = {
                          ...n.placas_conjuntas[index],
                          plates,
                        }
                      }
                    })
                  }
                />
                {item.plates.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={styles.servicosIconBtn}
                    onClick={() =>
                      patch((n) => {
                        if (mode === 'correlatas') {
                          const plates = n.placas_correlatas[
                            index
                          ].plates.filter((_, i) => i !== pi)
                          n.placas_correlatas[index] = {
                            ...n.placas_correlatas[index],
                            plates:
                              plates.length > 0
                                ? plates
                                : [
                                    {
                                      id: newNestedEntityId(),
                                      created_at: nowIso(),
                                      plate: '',
                                    },
                                  ],
                          }
                        } else {
                          const plates = n.placas_conjuntas[
                            index
                          ].plates.filter((_, i) => i !== pi)
                          n.placas_conjuntas[index] = {
                            ...n.placas_conjuntas[index],
                            plates:
                              plates.length > 0
                                ? plates
                                : [
                                    {
                                      id: newNestedEntityId(),
                                      created_at: nowIso(),
                                      plate: '',
                                    },
                                  ],
                          }
                        }
                      })
                    }
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                ) : null}
                {pi === item.plates.length - 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={styles.servicosAddLineBtn}
                    onClick={() =>
                      patch((n) => {
                        if (mode === 'correlatas') {
                          n.placas_correlatas[index] = {
                            ...n.placas_correlatas[index],
                            plates: [
                              ...n.placas_correlatas[index].plates,
                              {
                                id: newNestedEntityId(),
                                created_at: nowIso(),
                                plate: '',
                              },
                            ],
                          }
                        } else {
                          n.placas_conjuntas[index] = {
                            ...n.placas_conjuntas[index],
                            plates: [
                              ...n.placas_conjuntas[index].plates,
                              {
                                id: newNestedEntityId(),
                                created_at: nowIso(),
                                plate: '',
                              },
                            ],
                          }
                        }
                      })
                    }
                    aria-label="Adicionar placa"
                    title="Adicionar placa"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
              {fieldErrors?.[`plates.${pi}.plate`] ? (
                <p className="text-xs text-destructive">
                  {fieldErrors[`plates.${pi}.plate`]}
                </p>
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </div>,
  )
}
