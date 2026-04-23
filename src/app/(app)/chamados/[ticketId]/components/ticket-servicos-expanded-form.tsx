'use client'

import { Plus, Trash } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'

import { FilterDateRangeField } from '@/app/(app)/chamados/components/filter-date-range-field'
import type { OpenServiceKey } from '@/app/(app)/chamados/criar/ticket-create/ticket-create.constant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TicketDetection } from '@/http/tickets/get-ticket-by-id'
import type { TicketServicosOut } from '@/http/tickets/ticket-servicos'
import { maskPlateBR } from '@/utils/string-formatters'

import styles from './ticket-detail.module.css'
import {
  cloneTicketServicos,
  dateInputToIsoStart,
  isoToDateInput,
  newNestedEntityId,
} from './ticket-servicos-mapper'

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
            <FilterDateRangeField
              startValue={isoToDateInput(item.period_start)}
              endValue={isoToDateInput(item.period_end)}
              onChangeStart={(v) =>
                patch((n) => {
                  n.busca_por_placa[index] = {
                    ...n.busca_por_placa[index],
                    period_start: dateInputToIsoStart(v),
                  }
                })
              }
              onChangeEnd={(v) =>
                patch((n) => {
                  n.busca_por_placa[index] = {
                    ...n.busca_por_placa[index],
                    period_end: dateInputToIsoStart(v),
                  }
                })
              }
              popoverContentClassName="z-[120] w-auto p-0"
              disabled={readOnly}
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
                      className={styles.servicosInput}
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
                  </div>
                  {fieldErrors?.[`plates.${pi}.plate`] ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors[`plates.${pi}.plate`]}
                    </p>
                  ) : null}
                </Fragment>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
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
            >
              <Plus className="h-4 w-4" />
              Adicionar placa
            </Button>
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
            <FilterDateRangeField
              startValue={isoToDateInput(item.period_start)}
              endValue={isoToDateInput(item.period_end)}
              onChangeStart={(v) =>
                patch((n) => {
                  n.busca_por_radar[index] = {
                    ...n.busca_por_radar[index],
                    period_start: dateInputToIsoStart(v),
                  }
                })
              }
              onChangeEnd={(v) =>
                patch((n) => {
                  n.busca_por_radar[index] = {
                    ...n.busca_por_radar[index],
                    period_end: dateInputToIsoStart(v),
                  }
                })
              }
              popoverContentClassName="z-[120] w-auto p-0"
              disabled={readOnly}
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
                      className={styles.servicosInput}
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
                  </div>
                  {fieldErrors?.[`plates.${pi}.plate`] ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors[`plates.${pi}.plate`]}
                    </p>
                  ) : null}
                </Fragment>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
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
            >
              <Plus className="h-4 w-4" />
              Adicionar placa
            </Button>
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
              className={styles.servicosInput}
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
            <FilterDateRangeField
              startValue={isoToDateInput(item.period_start)}
              endValue={isoToDateInput(item.period_end)}
              onChangeStart={(v) =>
                patch((n) => {
                  n.busca_por_imagem[index] = {
                    ...n.busca_por_imagem[index],
                    period_start: dateInputToIsoStart(v),
                  }
                })
              }
              onChangeEnd={(v) =>
                patch((n) => {
                  n.busca_por_imagem[index] = {
                    ...n.busca_por_imagem[index],
                    period_end: dateInputToIsoStart(v),
                  }
                })
              }
              popoverContentClassName="z-[120] w-auto p-0"
              disabled={readOnly}
            />
            {(fieldErrors?.period_start || fieldErrors?.period_end) && (
              <p className="text-xs text-destructive">
                {fieldErrors?.period_start || fieldErrors?.period_end}
              </p>
            )}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Placa do veículo</span>
            <Input
              className={styles.servicosInput}
              value={item.plate ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.busca_por_imagem[index] = {
                    ...n.busca_por_imagem[index],
                    plate: maskPlateBR(e.target.value) || null,
                  }
                })
              }
            />
            {fieldErrors?.plate ? (
              <p className="text-xs text-destructive">{fieldErrors.plate}</p>
            ) : null}
          </div>
          <div className={styles.servicosFieldBlock}>
            <span className={styles.servicosFieldLabel}>Endereço</span>
            <Input
              className={styles.servicosInput}
              value={item.address ?? ''}
              onChange={(e) =>
                patch((n) => {
                  n.busca_por_imagem[index] = {
                    ...n.busca_por_imagem[index],
                    address: e.target.value || null,
                  }
                })
              }
            />
            {fieldErrors?.address ? (
              <p className="text-xs text-destructive">{fieldErrors.address}</p>
            ) : null}
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
            <FilterDateRangeField
              startValue={isoToDateInput(item.period_start)}
              endValue={isoToDateInput(item.period_end)}
              onChangeStart={(v) =>
                patch((n) => {
                  n.reserva_de_imagem[index] = {
                    ...n.reserva_de_imagem[index],
                    period_start: dateInputToIsoStart(v),
                  }
                })
              }
              onChangeEnd={(v) =>
                patch((n) => {
                  n.reserva_de_imagem[index] = {
                    ...n.reserva_de_imagem[index],
                    period_end: dateInputToIsoStart(v),
                  }
                })
              }
              popoverContentClassName="z-[120] w-auto p-0"
              disabled={readOnly}
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
            <FilterDateRangeField
              startValue={isoToDateInput(item.period_start)}
              endValue={isoToDateInput(item.period_end)}
              onChangeStart={(v) =>
                patch((n) => {
                  n.analise_de_imagem[index] = {
                    ...n.analise_de_imagem[index],
                    period_start: dateInputToIsoStart(v),
                  }
                })
              }
              onChangeEnd={(v) =>
                patch((n) => {
                  n.analise_de_imagem[index] = {
                    ...n.analise_de_imagem[index],
                    period_end: dateInputToIsoStart(v),
                  }
                })
              }
              popoverContentClassName="z-[120] w-auto p-0"
              disabled={readOnly}
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
        <FilterDateRangeField
          startValue={isoToDateInput(item.period_start)}
          endValue={isoToDateInput(item.period_end)}
          onChangeStart={(v) =>
            patch((n) => {
              if (mode === 'correlatas') {
                n.placas_correlatas[index] = {
                  ...n.placas_correlatas[index],
                  period_start: dateInputToIsoStart(v),
                }
              } else {
                n.placas_conjuntas[index] = {
                  ...n.placas_conjuntas[index],
                  period_start: dateInputToIsoStart(v),
                }
              }
            })
          }
          onChangeEnd={(v) =>
            patch((n) => {
              if (mode === 'correlatas') {
                n.placas_correlatas[index] = {
                  ...n.placas_correlatas[index],
                  period_end: dateInputToIsoStart(v),
                }
              } else {
                n.placas_conjuntas[index] = {
                  ...n.placas_conjuntas[index],
                  period_end: dateInputToIsoStart(v),
                }
              }
            })
          }
          popoverContentClassName="z-[120] w-auto p-0"
          disabled={readOnly}
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
                  className={styles.servicosInput}
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
              </div>
              {fieldErrors?.[`plates.${pi}.plate`] ? (
                <p className="text-xs text-destructive">
                  {fieldErrors[`plates.${pi}.plate`]}
                </p>
              ) : null}
            </Fragment>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
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
        >
          <Plus className="h-4 w-4" />
          Adicionar placa
        </Button>
      </div>
    </div>,
  )
}
