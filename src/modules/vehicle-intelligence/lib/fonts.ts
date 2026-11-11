/**
 * As fontes do módulo vêm do `next/font` (layout de `/inteligencia-veicular`), com nomes gerados no build; o CSS as
 * lê por `--iv-font-sans`/`--iv-font-mono`. Quem desenha em canvas (o grafo do vis-network) precisa do nome real.
 */
const FALLBACK_SANS = 'Inter, ui-sans-serif, system-ui, sans-serif'

export function sansFontFamily(): string {
  if (typeof document === 'undefined') return FALLBACK_SANS
  const root = document.querySelector('.iv-root')
  const value = root
    ? getComputedStyle(root).getPropertyValue('--iv-font-sans').trim()
    : ''
  return value || FALLBACK_SANS
}
