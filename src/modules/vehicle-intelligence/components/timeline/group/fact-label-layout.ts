import type { GroupEvent } from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { measureText } from '@/modules/vehicle-intelligence/components/timeline/group/text-width'
import { formatTime } from '@/modules/vehicle-intelligence/lib/dates'

export type FactLabel = {
  text: string
  transform: string
  from: number
  to: number
  fullText: string
  compactText: string
  x: number
}

/**
 * Fatos próximos no eixo: o rótulo do primeiro encosta à esquerda do horário e o do seguinte à direita (regra do handoff).
 * Com mais fatos do que cabe, o rótulo que ainda colide vira só o número e, por fim, só o pino; o texto completo fica no title.
 */
export function layoutFactLabels(
  factEvents: GroupEvent[],
  positionPercent: (t: number) => number,
  width: number,
): FactLabel[] {
  const anchors = factEvents.map(() => 'translateX(-50%)')
  factEvents.forEach((f, k) => {
    const n = factEvents[k + 1]
    if (n && positionPercent(n.at) - positionPercent(f.at) < 16) {
      anchors[k] = 'translateX(calc(-100% + 8px))'
      anchors[k + 1] = 'translateX(-8px)'
    }
  })
  const labelWidth = (text: string) =>
    measureText(text, '600 11px Inter') + 16 + 9 + 5
  const extent = (x: number, transform: string, w: number) =>
    transform.includes('-100%')
      ? [x - w + 8, x + 8]
      : transform.includes('-8px')
        ? [x - 8, x - 8 + w]
        : [x - w / 2, x + w / 2]
  const compact = (r: FactLabel): FactLabel => {
    const [from, to] = extent(
      r.x,
      'translateX(-50%)',
      labelWidth(r.compactText),
    )
    return {
      ...r,
      text: r.compactText,
      transform: 'translateX(-50%)',
      from,
      to,
    }
  }
  const fits = (r: FactLabel, previous: FactLabel | undefined) =>
    r.from >= (previous ? previous.to + 4 : -Infinity) &&
    r.from >= -8 &&
    r.to <= width + 8
  const placed: FactLabel[] = []
  factEvents.forEach((e, k) => {
    const fullText = `${e.label} · ${formatTime(e.at)}`
    const compactText = (e.label ?? '').replace(/^Fato\s*/, '') || '•'
    const x = (positionPercent(e.at) / 100) * width
    const base = { fullText, compactText, x }
    const options: FactLabel[] = [
      anchors[k],
      'translateX(-50%)',
      'translateX(-8px)',
    ].map((transform) => {
      const [from, to] = extent(x, transform, labelWidth(fullText))
      return { ...base, text: fullText, transform, from, to }
    })
    options.push(compact(options[1]))
    const previous = placed[placed.length - 1]
    let chosen = !width ? options[0] : options.find((r) => fits(r, previous))
    // Não coube: o rótulo anterior encolhe para o número e este tenta de novo; por fim, só o pino.
    if (!chosen && previous && previous.text === previous.fullText) {
      placed[placed.length - 1] = compact(previous)
      chosen = options.slice(1).find((r) => fits(r, placed[placed.length - 1]))
    }
    placed.push(
      chosen ?? {
        ...base,
        text: '',
        transform: 'translateX(-50%)',
        from: x - 6,
        to: x + 6,
      },
    )
  })
  return placed
}
