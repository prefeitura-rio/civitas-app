'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paperclip,
  Underline,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import tcStyles from '@/app/(app)/chamados/criar/ticket-create/ticket-create-form.module.css'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getStandardizedResponseById,
  listStandardizedResponses,
} from '@/http/standardized-responses/standardized-responses'
import {
  getTicketResposta,
  putTicketResposta,
} from '@/http/tickets/ticket-resposta'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/utils/error-handlers'

import responderStyles from '../../caixa-entrada/responder/[emailId]/components/responder-email-view.module.css'
import detailStyles from '../ticket-detail.module.css'

const EMPTY_POP_VALUE = '__civitas_pop_empty__'

type Props = {
  ticketId: string
}

const RESPOSTA_QUERY_KEY = (ticketId: string) =>
  ['ticket', ticketId, 'resposta'] as const

export function TicketDetailTabResposta({ ticketId }: Props) {
  const queryClient = useQueryClient()
  const [selectedPopId, setSelectedPopId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [dirty, setDirty] = useState(false)

  const respostaQuery = useQuery({
    queryKey: RESPOSTA_QUERY_KEY(ticketId),
    queryFn: () => getTicketResposta(ticketId),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      putTicketResposta(ticketId, {
        conteudo_html: replyBody,
      }),
    onSuccess: () => {
      queryClient.setQueryData(RESPOSTA_QUERY_KEY(ticketId), {
        ...(respostaQuery.data ?? {
          id: null,
          chamado_id: ticketId,
          criado_em: null,
          atualizado_em: null,
          atualizado_por_id: null,
          atualizado_por_nome: null,
        }),
        conteudo_html: replyBody,
      })
      queryClient
        .invalidateQueries({ queryKey: ['ticket', ticketId] })
        .catch(() => {})
      queryClient
        .invalidateQueries({
          queryKey: ['ticket', ticketId, 'allowed-actions'],
        })
        .catch(() => {})
      queryClient.invalidateQueries({ queryKey: ['tickets'] }).catch(() => {})
      setDirty(false)
      toast.success('Resposta gravada.')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const { data: popsRes, isLoading: popsLoading } = useQuery({
    queryKey: [
      'standardized-responses',
      'list',
      { isActive: true, category: 'RECEBIMENTO_SOLICITACOES' as const },
    ],
    queryFn: async () => {
      const r = await listStandardizedResponses({
        isActive: true,
        category: 'RECEBIMENTO_SOLICITACOES',
      })
      return r.data
    },
  })

  const pops = popsRes?.items ?? []

  useEffect(() => {
    if (respostaQuery.isLoading || respostaQuery.isError || dirty) return
    const initialBody = respostaQuery.data?.conteudo_html ?? ''
    setReplyBody(initialBody)
  }, [
    respostaQuery.isLoading,
    respostaQuery.isError,
    respostaQuery.data?.conteudo_html,
    dirty,
  ])

  const {
    data: popDetailRes,
    isFetching: popDetailLoading,
    isError: popDetailError,
  } = useQuery({
    queryKey: ['standardized-response', selectedPopId],
    queryFn: async () => {
      const r = await getStandardizedResponseById(selectedPopId!)
      return r.data
    },
    enabled: Boolean(selectedPopId),
    retry: false,
  })

  useEffect(() => {
    if (popDetailError) {
      toast.error('Não foi possível carregar a resposta padronizada.')
    }
  }, [popDetailError])

  useEffect(() => {
    if (!selectedPopId) {
      return
    }
    if (popDetailRes?.body != null) {
      // Regra: selecionar POP preenche automaticamente o editor.
      setReplyBody(popDetailRes.body)
      setDirty(true)
    }
  }, [selectedPopId, popDetailRes?.body])

  const canSave = replyBody.trim().length > 0 && !saveMutation.isPending

  const handleSave = useCallback(() => {
    if (!replyBody.trim()) return
    saveMutation.mutate()
  }, [replyBody, saveMutation])

  if (respostaQuery.isLoading) {
    return <p className={detailStyles.loading}>Carregando resposta…</p>
  }

  if (respostaQuery.isError) {
    return (
      <p className={detailStyles.error}>
        Não foi possível carregar a resposta.
      </p>
    )
  }

  return (
    <div className={cn(responderStyles.root, detailStyles.respostaEmbedRoot)}>
      <div className={responderStyles.main}>
        <div className={detailStyles.respostaBody}>
          <div className={`${responderStyles.popField} space-y-1.5`}>
            <Label className={tcStyles.fieldLabel}>POP de respostas</Label>
            <Select
              value={selectedPopId ?? EMPTY_POP_VALUE}
              onValueChange={(v) =>
                setSelectedPopId(v === EMPTY_POP_VALUE ? null : v)
              }
              disabled={popsLoading}
            >
              <SelectTrigger
                className={cn(
                  tcStyles.inputBg,
                  responderStyles.popSelectTrigger,
                )}
                aria-label="Resposta padronizada (POP)"
              >
                <SelectValue placeholder="Selecione um pop" />
              </SelectTrigger>
              <SelectContent className={tcStyles.selectContentForm}>
                <SelectItem
                  value={EMPTY_POP_VALUE}
                  className={tcStyles.selectItemForm}
                >
                  Selecione um pop
                </SelectItem>
                {pops.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    className={tcStyles.selectItemForm}
                  >
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={responderStyles.editorWrap}>
            <div className={responderStyles.toolbar} aria-hidden>
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Underline size={16} />
              </button>
              <span className={responderStyles.toolbarDivider} />
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <ListOrdered size={16} />
              </button>
              <span className={responderStyles.toolbarDivider} />
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Link2 size={16} />
              </button>
              <span className={detailStyles.respostaToolbarSpacer} />
              <button
                type="button"
                className={responderStyles.toolbarBtn}
                disabled
              >
                <Paperclip size={16} />
              </button>
            </div>
            <textarea
              className={responderStyles.textarea}
              value={replyBody}
              onChange={(e) => {
                setReplyBody(e.target.value)
                setDirty(true)
              }}
              placeholder={
                popDetailLoading && selectedPopId
                  ? 'Carregando texto do POP…'
                  : 'Digite sua resposta ou selecione um POP acima'
              }
              disabled={
                saveMutation.isPending ||
                (popDetailLoading && Boolean(selectedPopId))
              }
              spellCheck
            />
          </div>
        </div>

        <div className={responderStyles.footer}>
          <button
            type="button"
            className={responderStyles.btnSend}
            disabled={!canSave}
            title={
              !replyBody.trim()
                ? 'Digite ou carregue o texto da resposta'
                : undefined
            }
            onClick={handleSave}
          >
            {saveMutation.isPending ? 'Gravando…' : 'Gravar resposta'}
          </button>
        </div>
      </div>
    </div>
  )
}
