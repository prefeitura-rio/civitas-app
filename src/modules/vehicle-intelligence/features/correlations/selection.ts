/** Como um clique muda a seleção: substitui, alterna (Ctrl, Cmd ou Shift) ou só traz a placa para o inspetor. */
export type SelectMode = 'replace' | 'toggle' | 'focus'

export function selectModeFor(event: {
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}): SelectMode {
  return event.ctrlKey || event.metaKey || event.shiftKey ? 'toggle' : 'replace'
}

/** A última placa da lista é a que o inspetor mostra. */
export function nextSelection(
  current: string[],
  plate: string | null,
  mode: SelectMode,
): string[] {
  if (!plate) return []
  if (mode === 'replace') return [plate]
  const rest = current.filter((item) => item !== plate)
  return mode === 'toggle' && rest.length < current.length
    ? rest
    : [...rest, plate]
}

/** Placas digitadas ou coladas, separadas por vírgula, ponto e vírgula, espaço ou linha. */
export function searchTerms(value: string): string[] {
  return [
    ...new Set(
      value
        .toUpperCase()
        .split(/[\s,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ].slice(0, 20)
}

/** Mantém letras, números e separadores enquanto a pessoa digita. */
export function sanitizePlates(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9,;\s]/g, '')
}
