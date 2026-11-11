/**
 * Estado compartilhado fora do React, lido com `useSyncExternalStore`: filtros que valem em mais de uma tela e
 * listas que a página carrega uma vez (Cerco, camada de territórios).
 */
import { useSyncExternalStore } from 'react'

export interface Store<T> {
  get: () => T
  set: (next: T | ((current: T) => T)) => void
  subscribe: (listener: () => void) => () => void
  /** O valor atual, e um novo render a cada mudança. */
  use: () => T
}

/**
 * Um valor compartilhado. Com `storageKey`, ele fica guardado na sessão do navegador (sobrevive a recarregar a página,
 * não a fechar a aba); um valor guardado é completado com `initial`, para filtros novos não quebrarem os antigos.
 */
export function createStore<T>(
  initial: T,
  options: { storageKey?: string } = {},
): Store<T> {
  const { storageKey } = options
  let state = initial
  if (storageKey) {
    try {
      const saved = window.sessionStorage.getItem(storageKey)
      if (saved)
        state = isPlainObject(initial)
          ? { ...initial, ...JSON.parse(saved) }
          : JSON.parse(saved)
    } catch {
      /* Sem a sessão, começa do valor inicial. */
    }
  }
  const listeners = new Set<() => void>()
  const get = () => state
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  const set = (next: T | ((current: T) => T)) => {
    state =
      typeof next === 'function' ? (next as (current: T) => T)(state) : next
    if (storageKey) {
      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(state))
      } catch {
        /* Só perde a lembrança entre páginas. */
      }
    }
    listeners.forEach((listener) => listener())
  }
  return {
    get,
    set,
    subscribe,
    use: () => useSyncExternalStore(subscribe, get),
  }
}

/**
 * Um valor que a página carrega uma vez, na primeira leitura: até lá vale `initial`. Se a carga falhar (ou devolver
 * nulo), o valor inicial fica e a tela segue sem o dado.
 */
export function createLazyStore<T>(
  initial: T,
  load: () => Promise<T | null>,
): Store<T> {
  const store = createStore(initial)
  let loading: Promise<void> | null = null
  const subscribe = (listener: () => void) => {
    const unsubscribe = store.subscribe(listener)
    loading ??= load()
      .then((value) => {
        if (value !== null) store.set(value)
      })
      .catch(() => undefined)
    return unsubscribe
  }
  return {
    ...store,
    subscribe,
    use: () => useSyncExternalStore(subscribe, store.get),
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
