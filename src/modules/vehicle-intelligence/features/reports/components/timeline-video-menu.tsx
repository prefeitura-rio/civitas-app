import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  Loader2,
  Video,
} from 'lucide-react'
import { useState } from 'react'

import {
  dayLabel,
  shortDayLabel,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/vehicle-intelligence/components/ui/popover'
import {
  TIMELINE_VIDEO_MAX_DAYS,
  type TimelineVideoOptions,
  timelineVideoPaths,
} from '@/modules/vehicle-intelligence/features/reports/api'
import { useReportJob } from '@/modules/vehicle-intelligence/features/reports/use-report-job'
import { formatDateTime } from '@/modules/vehicle-intelligence/lib/dates'

type Choice<K extends keyof TimelineVideoOptions> = {
  value: TimelineVideoOptions[K]
  label: string
}

const THEMES: Choice<'tema'>[] = [
  { value: 'claro', label: 'Claro' },
  { value: 'escuro', label: 'Escuro' },
]
const MODES: Choice<'modo'>[] = [
  { value: 'completo', label: 'Completo' },
  { value: 'anonimizado', label: 'Anonimizado' },
]
const RESOLUTIONS: Choice<'resolucao'>[] = [
  { value: '1664x624', label: '1664 × 624' },
  { value: '1920x1080', label: '1920 × 1080' },
]

const capitalized = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

/**
 * As etapas da gravação (`relatorios/video/gravacao.py`): algumas trazem o andamento depois de ":" e, num vídeo de
 * vários dias, a vez do dia no fim (`gravando:35:2/3`).
 */
function stageLabel(stage: string | null | undefined) {
  const [name, value, part] = (stage ?? '').split(':')
  const day = part ? ` · dia ${part.replace('/', ' de ')}` : ''
  if (name === 'consultando_dados') return 'Lendo as detecções e os fatos'
  if (name === 'carregando_mapa')
    return `Carregando o mapa${day}${value ? ` (${value.replace('/', ' de ')} tiles)` : ''}`
  if (name === 'gravando') return `Gravando o vídeo${day} · ${value ?? 0}%`
  return 'Preparando o vídeo'
}

/**
 * "Exportar vídeo" no cabeçalho da timeline da placa: o MP4 do dia em foco, ou de vários dias escolhidos aqui (um vídeo
 * só, cada dia com a abertura que diz qual dia vai ser analisado), no recorte de fatos da tela, com o tema, o conteúdo
 * (completo ou anonimizado) e a resolução. A gravação segue em segundo plano com o menu fechado e baixa o arquivo ao
 * terminar.
 */
export function TimelineVideoMenu({
  plate,
  day,
  days,
  scope,
}: {
  plate: string
  /** O dia em foco na timeline: o do vídeo enquanto nenhum outro é escolhido. */
  day: string
  /** Os dias da timeline da placa (os que têm fato no recorte da tela). */
  days: string[]
  scope: string
}) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<TimelineVideoOptions>({
    tema: 'claro',
    modo: 'completo',
    resolucao: '1664x624',
  })
  // Sem escolha, o vídeo é o do dia em foco e acompanha a troca de dia na timeline; a escolha vale enquanto os dias
  // dela existirem no recorte da tela.
  const [picked, setPicked] = useState<ReadonlySet<string> | null>(null)
  const chosen = picked ? days.filter((item) => picked.has(item)) : []
  const selected = chosen.length ? chosen : [day]
  const full = selected.length >= TIMELINE_VIDEO_MAX_DAYS
  const toggleDay = (value: string) => {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else if (!full) next.add(value)
    setPicked(next.size ? next : null)
  }
  const { status, running, error, request } = useReportJob(
    timelineVideoPaths(plate, scope, selected, options),
    'mp4',
  )
  const done =
    status?.estado === 'concluido' && Boolean(status.formatos?.includes('mp4'))
  const failed = !running && status?.estado === 'falhou'
  const finishedAt = formatDateTime(status?.concluido_em, '')
  const choose = <K extends keyof TimelineVideoOptions>(
    key: K,
    value: TimelineVideoOptions[K],
  ) => setOptions((current) => ({ ...current, [key]: value }))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="profile-export-cta timeline-video-trigger"
          title="Vídeo (MP4) da timeline: um dia ou vários"
          aria-busy={running}
        >
          {running ? (
            <Loader2
              className="animate-spin motion-reduce:animate-none"
              size={15}
              aria-hidden="true"
            />
          ) : (
            <Video size={15} aria-hidden="true" />
          )}
          Exportar vídeo
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="plate-reports-popover">
        <section className="plate-reports-section">
          <div className="grid gap-1">
            <h3 className="m-0 text-sm font-semibold tracking-tight">
              Vídeo da timeline
            </h3>
            <p className="m-0 text-xs leading-5 text-muted-foreground">
              {selected.length === 1
                ? capitalized(dayLabel(selected[0]))
                : `${selected.length} dias num vídeo só`}
              : a câmera acompanha as detecções na ordem do dia e liga cada uma
              ao fato com a distância e o tempo, no recorte de fatos da tela.
              Cada dia abre com a data que vai ser analisada.
            </p>
          </div>
          {days.length > 1 && (
            <div className="plate-reports-field">
              <span className="plate-reports-label">Dias</span>
              <div
                className="plate-reports-days"
                role="group"
                aria-label="Dias do vídeo"
              >
                {days.map((item) => {
                  const checked = selected.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      className={checked ? 'selected' : ''}
                      disabled={running || (!checked && full)}
                      onClick={() => toggleDay(item)}
                    >
                      {checked && <Check size={13} aria-hidden="true" />}
                      {shortDayLabel(item)}
                    </button>
                  )
                })}
              </div>
              <span className="plate-reports-hint">
                {full
                  ? `Até ${TIMELINE_VIDEO_MAX_DAYS} dias por vídeo.`
                  : selected.length > 1
                    ? 'Os dias entram na ordem do calendário.'
                    : 'Marque mais dias para juntá-los num vídeo só.'}
                {picked && (
                  <button
                    type="button"
                    className="plate-reports-reset"
                    onClick={() => setPicked(null)}
                  >
                    Só o dia em foco
                  </button>
                )}
              </span>
            </div>
          )}
          <ChoiceField
            label="Tema"
            choices={THEMES}
            value={options.tema}
            onChange={(value) => choose('tema', value)}
          />
          <ChoiceField
            label="Conteúdo"
            choices={MODES}
            value={options.modo}
            onChange={(value) => choose('modo', value)}
            hint={
              options.modo === 'anonimizado'
                ? 'Placa mascarada; sem endereço do fato, equipamento nem modelo do veículo.'
                : 'Placa, endereço do fato e equipamento, como na timeline; o número do RO não vai.'
            }
          />
          <ChoiceField
            label="Resolução"
            choices={RESOLUTIONS}
            value={options.resolucao}
            onChange={(value) => choose('resolucao', value)}
            hint={
              options.resolucao === '1664x624'
                ? 'Formato largo: as correlações na coluna da esquerda, o mapa no resto.'
                : '16:9 (Full HD).'
            }
          />
          <span
            role="status"
            aria-live="polite"
            className="plate-reports-status"
          >
            {running && (
              <span className="flex items-center gap-2 text-foreground">
                <Loader2
                  className="animate-spin motion-reduce:animate-none"
                  size={14}
                  aria-hidden="true"
                />
                {stageLabel(status?.etapa)}…
              </span>
            )}
            {done && !running && (
              <span className="flex items-center gap-2 text-foreground">
                <Check size={14} aria-hidden="true" />
                Pronto{finishedAt ? ` em ${finishedAt}` : ''}
              </span>
            )}
            {failed && (
              <span className="flex items-start gap-2 text-destructive">
                <AlertTriangle
                  size={14}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
                {status?.detalhe ?? 'A gravação anterior falhou.'}
              </span>
            )}
            {error && !failed && (
              <span className="flex items-start gap-2 text-destructive">
                <AlertTriangle
                  size={14}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
                {error}
              </span>
            )}
            {!running && !done && !failed && !error && (
              <span className="text-muted-foreground">
                Leva de {selected.length} a {2 * selected.length} minutos; o
                arquivo baixa sozinho ao terminar.
              </span>
            )}
          </span>
          <Button type="button" size="sm" disabled={running} onClick={request}>
            {running ? (
              'Gravando…'
            ) : done ? (
              <>
                <Download size={15} aria-hidden="true" />
                Baixar MP4
              </>
            ) : failed ? (
              'Tentar de novo'
            ) : (
              'Gerar vídeo'
            )}
          </Button>
        </section>
      </PopoverContent>
    </Popover>
  )
}

function ChoiceField<K extends keyof TimelineVideoOptions>({
  label,
  choices,
  value,
  onChange,
  hint,
}: {
  label: string
  choices: Choice<K>[]
  value: TimelineVideoOptions[K]
  onChange: (value: TimelineVideoOptions[K]) => void
  hint?: string
}) {
  return (
    <div className="plate-reports-field">
      <span className="plate-reports-label">{label}</span>
      <div
        className="plate-reports-choices"
        role="radiogroup"
        aria-label={label}
      >
        {choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={choice.value === value}
            className={choice.value === value ? 'selected' : ''}
            onClick={() => onChange(choice.value)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {hint && <span className="plate-reports-hint">{hint}</span>}
    </div>
  )
}
