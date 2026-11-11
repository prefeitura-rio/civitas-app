import { useEffect, useRef, useState } from 'react'

/** Edição pendente até Aplicar; mudanças externas atualizam só os campos afetados. */
export function useFilterDraft<T extends object>(
  applied: T,
  storageKey: string,
  changed: (a: T, b: T) => Array<keyof T>,
) {
  const [pending, setPending] = useState<T>(() => {
    try {
      const stored = JSON.parse(
        sessionStorage.getItem(storageKey) ?? 'null',
      ) as { applied: T; pending: T } | null
      if (
        stored?.applied &&
        stored.pending &&
        !changed(stored.applied, applied).length
      )
        return { ...applied, ...stored.pending }
    } catch {
      /* O armazenamento da sessão é opcional. */
    }
    return applied
  })
  const previous = useRef(applied)
  const appliedKey = JSON.stringify(applied)
  useEffect(() => {
    const keys = changed(previous.current, applied)
    previous.current = applied
    if (keys.length)
      setPending((current) => ({
        ...current,
        ...Object.fromEntries(keys.map((key) => [key, applied[key]])),
      }))
    // `appliedKey` resume os filtros aplicados (um objeto novo a cada render); `changed` é uma função estável.
    // Dependências incompletas de propósito.
  }, [appliedKey])
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ applied, pending }))
    } catch {
      /* Opcional. */
    }
    // `appliedKey` resume os filtros aplicados (um objeto novo a cada render).
    // Dependências incompletas de propósito.
  }, [pending, appliedKey, storageKey])
  return [pending, setPending] as const
}
