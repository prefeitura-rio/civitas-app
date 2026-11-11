/** O balão dos gráficos de tendências: posição, conteúdo e o que mostra e esconde ao mouse e ao foco. */
import {
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useState,
} from 'react'

export type TooltipState = {
  x: number
  y: number
  className: string
  content: ReactNode
}
/** Balão ao lado de um ponto (`x`, `y` na área), aberto para a esquerda ou para a direita dele. */
export type SideAnchor = { x: number; y: number; side: 'left' | 'right' }

/**
 * Balão sobre o elemento apontado, dentro de `area` (com `position: relative`): acima dele, alinhado ao lado perto
 * das bordas e abaixo quando falta espaço em cima; ou ao lado de um ponto, para não cobrir o que se lê (`sideAnchor`).
 */
export function useTooltip(area: RefObject<HTMLElement>) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const show = (
    target: Element,
    content: ReactNode,
    sideAnchor?: SideAnchor,
  ) => {
    const box = area.current?.getBoundingClientRect()
    if (!box) return
    if (sideAnchor) {
      setTooltip({
        x: sideAnchor.x,
        y: sideAnchor.y,
        className: `side-${sideAnchor.side}`,
        content,
      })
      return
    }
    const r = target.getBoundingClientRect()
    const x = r.left + r.width / 2 - box.left
    const y = r.top - box.top
    const edgeClass =
      x < box.width * 0.22 ? ' left' : x > box.width * 0.78 ? ' right' : ''
    const below = y < 96
    setTooltip({
      x,
      y: below ? r.bottom - box.top : y,
      className: `${edgeClass}${below ? ' below' : ''}`,
      content,
    })
  }
  // `span`, não `div`: as linhas das delegacias são `div` filhas da mesma área e têm estilo próprio.
  const bubble = tooltip && (
    <span
      role="tooltip"
      className={`group-tip ${tooltip.className}`}
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      {tooltip.content}
    </span>
  )
  return { show, hide: () => setTooltip(null), bubble }
}

/** O que reage ao mouse e ao foco: mostra o balão ao entrar e o esconde ao sair. */
export function interactive(
  show: (target: Element) => void,
  hide: () => void,
  label: string,
) {
  return {
    tabIndex: 0,
    'aria-label': label,
    onPointerEnter: (domEvent: PointerEvent) => show(domEvent.currentTarget),
    onFocus: (domEvent: FocusEvent) => show(domEvent.currentTarget),
    onPointerLeave: hide,
    onBlur: hide,
  }
}
