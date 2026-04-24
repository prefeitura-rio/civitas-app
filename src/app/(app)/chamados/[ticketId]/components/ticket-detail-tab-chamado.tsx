'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Tag } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getTicketNatures } from '@/http/get-ticket-natures/get-ticket-natures'
import { getOperation } from '@/http/operations/get-operation'
import { getOperations } from '@/http/operations/get-operations'
import {
  getTicketTypes,
  type TicketType,
} from '@/http/ticket-types/get-ticket.types'
import {
  getTicketFicha,
  type TicketFichaOut,
  type TicketFichaUpdateIn,
  updateTicketFicha,
} from '@/http/tickets/ticket-ficha'
import { isApiError } from '@/lib/api'
import type { Operation } from '@/models/entities'
import { getApiErrorMessage } from '@/utils/error-handlers'

import styles from '../ticket-detail.module.css'

const MAX_OFICIO_PROC = 60
const MAX_APELIDO = 120

const SERVICE_PREVIEW = 3

/** Radix Select não aceita `value=""` em SelectItem; “Nenhum” no órgão. */
const ORGAO_SELECT_NONE = '__orgao_nenhum__'

type Props = {
  ticketId: string
}

function displayText(value?: string | null) {
  if (value == null) return '—'
  const t = value.trim()
  return t.length ? t : '—'
}

function formatNumeroInterno(n?: number | null) {
  if (n == null) return '—'
  return String(n).padStart(7, '0')
}

function formatTicketStatus(status: string) {
  const u = status.trim().toUpperCase()
  const map: Record<string, string> = {
    PENDENTE: 'Pendente',
    RESTRITO: 'Restrito',
    BLOQUEADO: 'Bloqueado',
    AGUARDANDO_REVISAO: 'Aguardando revisão',
    CONCLUIDO: 'Concluído',
  }
  return map[u] ?? status
}

function rtTagClass(label: string) {
  const n = label.trim().toLowerCase()
  if (n.includes('cerco')) return styles.rtTagPink
  if (n.includes('busca por placa') || n.includes('busca de placa'))
    return styles.rtTagGreen
  if (n.includes('reserva de imagem')) return styles.rtTagYellow
  if (n.includes('busca por imagem') || n.includes('busca de imagem'))
    return styles.rtTagCyan
  if (n.includes('busca por radar') || n.includes('busca de radar'))
    return styles.rtTagBlue
  if (n.includes('placas correlatas')) return styles.rtTagOrange
  if (n.includes('placas conjuntas') || n.includes('placa conjuntas'))
    return styles.rtTagPurple
  if (n.includes('outros')) return styles.rtTagRed
  return styles.rtTagDefault
}

function mapOutToDraft(f: TicketFichaOut): TicketFichaUpdateIn {
  return {
    tipo_chamado_id: f.tipo_chamado_id,
    orgao_procedimento_id: f.orgao_procedimento_id?.trim()
      ? f.orgao_procedimento_id.trim()
      : null,
    numero_procedimento: f.numero_procedimento?.trim()
      ? f.numero_procedimento.trim()
      : null,
    numero_oficio: f.numero_oficio?.trim() ? f.numero_oficio.trim() : null,
    natureza_id: f.natureza_id?.trim() ? f.natureza_id.trim() : null,
    possui_apelido_imprensa: f.possui_apelido_imprensa,
    apelido_imprensa: f.apelido_imprensa?.trim()
      ? f.apelido_imprensa.trim()
      : null,
    link_materia: f.link_materia?.trim() ? f.link_materia.trim() : null,
  }
}

function normalizeHttpUrl(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  for (const candidate of [t, `https://${t}`]) {
    try {
      return new URL(candidate).href
    } catch {
      /* tenta próximo */
    }
  }
  return null
}

export function TicketDetailTabChamado({ ticketId }: Props) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<TicketFichaUpdateIn | null>(null)

  const fichaQuery = useQuery({
    queryKey: ['ticket', ticketId, 'ficha'],
    queryFn: () => getTicketFicha(ticketId),
  })

  const operationsQuery = useQuery({
    queryKey: ['operations', 'select', 'chamado-tab'],
    queryFn: () => getOperations({ page: 1, size: 100 }),
    enabled: isEditing,
  })

  const ticketTypesQuery = useQuery({
    queryKey: ['ticket-types', 'select', 'chamado-tab'],
    queryFn: () => getTicketTypes({ isActive: true }),
    enabled: isEditing,
  })

  const ticketNaturesQuery = useQuery({
    queryKey: ['ticket-natures', 'select', 'chamado-tab'],
    queryFn: () => getTicketNatures({ isActive: true }),
    enabled: isEditing,
  })

  const ficha = fichaQuery.data

  const selectedOrgaoId = useMemo(() => {
    if (isEditing && draft) {
      return draft.orgao_procedimento_id?.trim() ?? ''
    }
    return ficha?.orgao_procedimento_id?.trim() ?? ''
  }, [draft, ficha?.orgao_procedimento_id, isEditing])

  const orgaoDetailQuery = useQuery({
    queryKey: ['operation', selectedOrgaoId, 'chamado-ficha'],
    queryFn: () => getOperation({ id: selectedOrgaoId }),
    enabled: selectedOrgaoId.length > 0,
  })

  useEffect(() => {
    if (!ficha || isEditing) return
    setDraft(mapOutToDraft(ficha))
  }, [ficha, isEditing])

  const operationOptions = useMemo(() => {
    const items = operationsQuery.data?.data?.items ?? []
    const list: Operation[] = [...items]
    if (
      selectedOrgaoId &&
      !list.some((o) => o.id === selectedOrgaoId) &&
      orgaoDetailQuery.data?.data
    ) {
      list.unshift(orgaoDetailQuery.data.data)
    }
    return list
  }, [operationsQuery.data, orgaoDetailQuery.data, selectedOrgaoId])

  const ticketTypeOptions = useMemo((): TicketType[] => {
    const list = [...(ticketTypesQuery.data?.data ?? [])]
    if (
      ficha?.tipo_chamado_id &&
      !list.some((t) => t.id === ficha.tipo_chamado_id)
    ) {
      list.unshift({
        id: ficha.tipo_chamado_id,
        name: ficha.tipo_chamado_nome || 'Tipo de chamado',
        isActive: true,
      })
    }
    return list
  }, [ficha?.tipo_chamado_id, ficha?.tipo_chamado_nome, ticketTypesQuery.data])

  const updateMutation = useMutation({
    mutationFn: (payload: TicketFichaUpdateIn) =>
      updateTicketFicha(ticketId, payload),
    onSuccess: () => {
      toast.success('Ficha do chamado atualizada.')
      setIsEditing(false)
      queryClient
        .invalidateQueries({ queryKey: ['ticket', ticketId] })
        .catch(() => {})
      queryClient
        .invalidateQueries({
          queryKey: ['ticket', ticketId, 'ficha'],
        })
        .catch(() => {})
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const beginEdit = useCallback(() => {
    if (!ficha) return
    setDraft(mapOutToDraft(ficha))
    setIsEditing(true)
  }, [ficha])

  const cancelEdit = useCallback(() => {
    if (ficha) setDraft(mapOutToDraft(ficha))
    setIsEditing(false)
  }, [ficha])

  const handleSave = useCallback(() => {
    if (!draft) return
    if (!draft.tipo_chamado_id?.trim()) {
      toast.error('Selecione o tipo de chamado.')
      return
    }

    const oficio = draft.numero_oficio?.trim() ?? ''
    const proc = draft.numero_procedimento?.trim() ?? ''
    if (oficio.length > MAX_OFICIO_PROC) {
      toast.error(`Nº de ofício: no máximo ${MAX_OFICIO_PROC} caracteres.`)
      return
    }
    if (proc.length > MAX_OFICIO_PROC) {
      toast.error(
        `Nº de procedimento: no máximo ${MAX_OFICIO_PROC} caracteres.`,
      )
      return
    }

    const apelido = draft.apelido_imprensa?.trim() ?? ''
    if (apelido.length > MAX_APELIDO) {
      toast.error(`Apelido: no máximo ${MAX_APELIDO} caracteres.`)
      return
    }

    let linkOut: string | null = null
    const linkRaw = draft.link_materia?.trim() ?? ''
    if (linkRaw) {
      const normalized = normalizeHttpUrl(linkRaw)
      if (!normalized) {
        toast.error('Informe um link válido (URL) para a matéria.')
        return
      }
      linkOut = normalized
    }

    const payload: TicketFichaUpdateIn = {
      tipo_chamado_id: draft.tipo_chamado_id.trim(),
      orgao_procedimento_id: draft.orgao_procedimento_id?.trim()
        ? draft.orgao_procedimento_id.trim()
        : null,
      numero_oficio: oficio || null,
      numero_procedimento: proc || null,
      natureza_id: draft.natureza_id?.trim() ? draft.natureza_id.trim() : null,
      possui_apelido_imprensa: draft.possui_apelido_imprensa,
      apelido_imprensa: apelido || null,
      link_materia: linkOut,
    }

    updateMutation.mutate(payload)
  }, [draft, updateMutation])

  if (fichaQuery.isLoading) {
    return (
      <div className={styles.panel} role="tabpanel">
        <p className={styles.loading}>Carregando ficha do chamado…</p>
      </div>
    )
  }

  if (fichaQuery.isError || !ficha) {
    const msg = isApiError(fichaQuery.error)
      ? getApiErrorMessage(fichaQuery.error)
      : 'Não foi possível carregar a ficha do chamado.'
    return (
      <div className={styles.panel} role="tabpanel">
        <p className={styles.error}>{msg}</p>
      </div>
    )
  }

  const view = ficha
  const d = isEditing && draft ? draft : mapOutToDraft(view)
  const relacionados = view.chamados_relacionados ?? []

  const tipoNomeTrim = view.tipo_chamado_nome?.trim() ?? ''
  const hasTipoNome = tipoNomeTrim.length > 0
  const tipoNomeReadonly = hasTipoNome ? tipoNomeTrim : displayText(null)

  const orgaoReadonlyTitle =
    orgaoDetailQuery.data?.data?.title?.trim() ||
    (selectedOrgaoId && orgaoDetailQuery.isLoading ? 'Carregando…' : '')

  const naturezas = ticketNaturesQuery.data?.data ?? []
  const pressSimNao = d.possui_apelido_imprensa ? 'Sim' : 'Não'
  const linkRaw =
    (isEditing && draft ? draft.link_materia : view.link_materia)?.trim() ?? ''

  return (
    <div className={styles.panel} role="tabpanel">
      <div className={styles.fieldStack}>
        <div className={styles.chamadoRows}>
          <div className={styles.chamadoTwoCol}>
            <div className={styles.chamadoCol}>
              <div className={styles.subLabel}>
                <span className={styles.subLabelText}>Tipo de chamado</span>
              </div>
              {isEditing ? (
                <Select
                  value={
                    d.tipo_chamado_id.trim() ? d.tipo_chamado_id : undefined
                  }
                  onValueChange={(v) =>
                    setDraft((prev) =>
                      prev ? { ...prev, tipo_chamado_id: v } : prev,
                    )
                  }
                  disabled={ticketTypesQuery.isLoading}
                >
                  <SelectTrigger
                    className={`h-11 ${styles.detailSelectTrigger}`}
                  >
                    <SelectValue
                      placeholder={
                        ticketTypesQuery.isLoading ? 'Carregando…' : 'Selecione'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className={styles.detailSelectContent}>
                    {ticketTypesQuery.isLoading
                      ? null
                      : ticketTypeOptions.map((t) => (
                          <SelectItem
                            key={t.id}
                            value={t.id}
                            className={styles.detailSelectItem}
                          >
                            {t.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              ) : (
                <div
                  className={`${styles.readonlyInput} ${
                    hasTipoNome ? '' : styles.readonlyInputMuted
                  }`}
                >
                  {tipoNomeReadonly}
                </div>
              )}
            </div>
            <div className={styles.chamadoCol}>
              <div className={styles.subLabel}>
                <span className={styles.subLabelText}>Nº interno</span>
              </div>
              <div className={styles.readonlyInput}>
                {formatNumeroInterno(view.numero_interno ?? null)}
              </div>
            </div>
          </div>

          <div className={styles.chamadoTwoCol}>
            <div className={styles.chamadoCol}>
              <div className={styles.subLabel}>
                <span className={styles.subLabelText}>Nº de ofício</span>
              </div>
              {isEditing ? (
                <input
                  className={styles.editableField}
                  value={d.numero_oficio ?? ''}
                  maxLength={MAX_OFICIO_PROC}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev
                        ? { ...prev, numero_oficio: e.target.value || null }
                        : prev,
                    )
                  }
                />
              ) : (
                <div
                  className={`${styles.readonlyInput} ${
                    view.numero_oficio?.trim() ? '' : styles.readonlyInputMuted
                  }`}
                >
                  {displayText(view.numero_oficio)}
                </div>
              )}
            </div>
            <div className={styles.chamadoCol}>
              <div className={styles.subLabel}>
                <span className={styles.subLabelText}>Nº de procedimento</span>
              </div>
              {isEditing ? (
                <input
                  className={styles.editableField}
                  value={d.numero_procedimento ?? ''}
                  maxLength={MAX_OFICIO_PROC}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            numero_procedimento: e.target.value || null,
                          }
                        : prev,
                    )
                  }
                />
              ) : (
                <div
                  className={`${styles.readonlyInput} ${
                    view.numero_procedimento?.trim()
                      ? ''
                      : styles.readonlyInputMuted
                  }`}
                >
                  {displayText(view.numero_procedimento)}
                </div>
              )}
            </div>
          </div>

          <div className={styles.chamadoNatureFull}>
            <span className={styles.fieldLabelUpper}>
              Órgão do procedimento
            </span>
            {isEditing ? (
              <Select
                value={
                  d.orgao_procedimento_id?.trim()
                    ? d.orgao_procedimento_id
                    : ORGAO_SELECT_NONE
                }
                onValueChange={(v) =>
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          orgao_procedimento_id:
                            v === ORGAO_SELECT_NONE ? null : v,
                        }
                      : prev,
                  )
                }
                disabled={operationsQuery.isLoading}
              >
                <SelectTrigger className={`h-11 ${styles.detailSelectTrigger}`}>
                  <SelectValue
                    placeholder={
                      operationsQuery.isLoading ? 'Carregando…' : undefined
                    }
                  />
                </SelectTrigger>
                <SelectContent className={styles.detailSelectContent}>
                  <SelectItem
                    value={ORGAO_SELECT_NONE}
                    className={styles.detailSelectItem}
                  >
                    Nenhum
                  </SelectItem>
                  {operationsQuery.isLoading
                    ? null
                    : operationOptions.map((op) => (
                        <SelectItem
                          key={op.id}
                          value={op.id}
                          className={styles.detailSelectItem}
                        >
                          {op.title}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            ) : (
              <div className={styles.readonlySelect}>
                <span
                  className={
                    orgaoReadonlyTitle && orgaoReadonlyTitle !== 'Carregando…'
                      ? ''
                      : styles.readonlySelectMuted
                  }
                >
                  {selectedOrgaoId
                    ? displayText(orgaoReadonlyTitle || null)
                    : '—'}
                </span>
                <ChevronDown
                  size={20}
                  className={styles.readonlySelectMuted}
                  aria-hidden
                />
              </div>
            )}
          </div>

          <div className={styles.chamadoNatureFull}>
            <span className={styles.fieldLabelUpper}>Natureza</span>
            {isEditing ? (
              <Select
                value={d.natureza_id?.trim() ? d.natureza_id : undefined}
                onValueChange={(v) =>
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          natureza_id: v.trim() ? v : null,
                        }
                      : prev,
                  )
                }
                disabled={ticketNaturesQuery.isLoading}
              >
                <SelectTrigger className={`h-11 ${styles.detailSelectTrigger}`}>
                  <SelectValue
                    placeholder={
                      ticketNaturesQuery.isLoading ? 'Carregando…' : 'Selecione'
                    }
                  />
                </SelectTrigger>
                <SelectContent className={styles.detailSelectContent}>
                  {ticketNaturesQuery.isLoading
                    ? null
                    : naturezas.map((n) => (
                        <SelectItem
                          key={n.id}
                          value={n.id}
                          className={styles.detailSelectItem}
                        >
                          {n.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            ) : (
              <div className={styles.readonlySelect}>
                <span
                  className={
                    view.natureza_nome?.trim() ? '' : styles.readonlySelectMuted
                  }
                >
                  {view.natureza_nome?.trim()
                    ? view.natureza_nome
                    : 'Selecione'}
                </span>
                <ChevronDown
                  size={20}
                  className={styles.readonlySelectMuted}
                  aria-hidden
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.fieldBlock}>
          <div>
            <p className={styles.sectionTitle} role="heading" aria-level={2}>
              Apelido do Chamado
            </p>
            <span className={styles.sectionHint}>
              O chamado tem relevância na mídia?
            </span>
          </div>
          <div className={styles.fieldStack}>
            <div className={styles.chamadoNatureFull}>
              <span className={styles.fieldLabelUpper}>
                Tem apelido pela imprensa?
              </span>
              {isEditing ? (
                <Select
                  value={d.possui_apelido_imprensa ? 'sim' : 'nao'}
                  onValueChange={(v) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            possui_apelido_imprensa: v === 'sim',
                          }
                        : prev,
                    )
                  }
                >
                  <SelectTrigger
                    className={`h-11 ${styles.detailSelectTrigger}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={styles.detailSelectContent}>
                    <SelectItem value="nao" className={styles.detailSelectItem}>
                      Não
                    </SelectItem>
                    <SelectItem value="sim" className={styles.detailSelectItem}>
                      Sim
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className={styles.readonlySelect}>
                  <span>{pressSimNao}</span>
                  <ChevronDown
                    size={20}
                    className={styles.readonlySelectMuted}
                    aria-hidden
                  />
                </div>
              )}
            </div>
            <div className={styles.chamadoTwoCol}>
              <div className={styles.chamadoCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>
                    Apelido pela imprensa
                  </span>
                </div>
                {isEditing ? (
                  <input
                    className={styles.editableField}
                    value={d.apelido_imprensa ?? ''}
                    maxLength={MAX_APELIDO}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              apelido_imprensa: e.target.value || null,
                            }
                          : prev,
                      )
                    }
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${
                      view.apelido_imprensa?.trim()
                        ? ''
                        : styles.readonlyInputMuted
                    }`}
                  >
                    {displayText(view.apelido_imprensa)}
                  </div>
                )}
              </div>
              <div className={styles.chamadoCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>Link da matéria</span>
                </div>
                {isEditing ? (
                  <input
                    className={styles.editableField}
                    type="url"
                    value={d.link_materia ?? ''}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? { ...prev, link_materia: e.target.value || null }
                          : prev,
                      )
                    }
                    placeholder="https://…"
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${styles.readonlyInputLinkCell}`}
                  >
                    {linkRaw ? (
                      <a
                        href={linkRaw}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkExternal}
                      >
                        {linkRaw}
                      </a>
                    ) : (
                      <span className={styles.readonlyInputMuted}>—</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.fieldBlock}>
          <div>
            <p className={styles.sectionTitle} role="heading" aria-level={2}>
              Chamados relacionados
            </p>
            <span className={styles.sectionHint}>
              Chamados que possuem o mesmo nº de procedimento:
            </span>
          </div>

          <div className={styles.relatedTableWrap}>
            <table className={styles.relatedTable}>
              <thead>
                <tr>
                  <th>Chamado</th>
                  <th>Equipe</th>
                  <th>Responsável</th>
                  <th>Serviços</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {relacionados.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <span className={styles.readonlyInputMuted}>
                        Nenhum outro chamado com o mesmo nº de procedimento.
                      </span>
                    </td>
                  </tr>
                ) : (
                  relacionados.map((row) => {
                    const preview = row.servicos.slice(0, SERVICE_PREVIEW)
                    const extra = Math.max(
                      row.servicos.length - preview.length,
                      0,
                    )
                    return (
                      <tr key={row.id}>
                        <td>
                          <Link
                            href={`/chamados/${encodeURIComponent(row.id)}`}
                            className={styles.relatedChamadoLink}
                          >
                            {formatNumeroInterno(row.numero_interno)}
                          </Link>
                        </td>
                        <td>{displayText(row.equipe)}</td>
                        <td>{displayText(row.responsavel)}</td>
                        <td>
                          <div className={styles.relatedServices}>
                            {preview.map((svc) => (
                              <span
                                key={`${row.id}-${svc}`}
                                className={`${styles.rtTag} ${rtTagClass(svc)}`}
                              >
                                <Tag size={12} strokeWidth={2} aria-hidden />
                                {svc}
                              </span>
                            ))}
                            {extra > 0 ? (
                              <span className={styles.rtExtraCount}>
                                +{extra}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {formatTicketStatus(row.status)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles.footerActions}>
        {isEditing ? (
          <button
            type="button"
            className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
            onClick={cancelEdit}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
            onClick={beginEdit}
          >
            Editar
          </button>
        )}
        <button
          type="button"
          className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
          onClick={handleSave}
          disabled={!isEditing || updateMutation.isPending}
        >
          Salvar
        </button>
      </div>
    </div>
  )
}
