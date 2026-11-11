/**
 * Estado compartilhado fora do React, lido com `useSyncExternalStore`: filtros que valem em mais de uma tela e
 * listas que a página carrega uma vez (Cerco, camada de territórios). E o único lugar que lê e grava o armazenamento
 * do navegador.
 */
import { useSyncExternalStore } from 'react'

import { recorteStorageKey } from '@/modules/vehicle-intelligence/config/recortes'

/** A sessão (sobrevive a recarregar a página, não a fechar a aba) ou o armazenamento local (fica). */
type StorageArea = 'session' | 'local'

const area = (where: StorageArea) =>
  where === 'local' ? window.localStorage : window.sessionStorage

/**
 * O armazenamento do navegador, separado por recorte (`civitas:<recorte>:<chave>`). Sem armazenamento (modo privado
 * cheio, acesso bloqueado) ou com um valor ilegível, nada é lido nem guardado: a tela segue sem lembrar.
 */
export const browserStorage = {
  read<T>(key: string, where: StorageArea = 'session'): T | null {
    try {
      const saved = area(where).getItem(recorteStorageKey(key))
      return saved ? (JSON.parse(saved) as T) : null
    } catch {
      return null
    }
  },
  write(key: string, value: unknown, where: StorageArea = 'session'): void {
    try {
      area(where).setItem(recorteStorageKey(key), JSON.stringify(value))
    } catch {
      /* Só perde a lembrança entre páginas. */
    }
  },
  remove(key: string, where: StorageArea = 'session'): void {
    try {
      area(where).removeItem(recorteStorageKey(key))
    } catch {
      /* Idem. */
    }
  },
}

export interface Store<T> {
  get: () => T
  set: (next: T | ((current: T) => T)) => void
  subscribe: (listener: () => void) => () => void
  /** O valor atual, e um novo render a cada mudança. */
  use: () => T
}

export interface StoreOptions<T> {
  /** Guarda o valor no navegador com esta chave (por recorte). */
  storageKey?: string
  storage?: StorageArea
  /**
   * O valor a partir do guardado. Sem ela, um objeto guardado é completado com `initial` (filtros novos não quebram
   * os antigos) e qualquer outro valor vale como veio.
   */
  restore?: (saved: unknown, initial: T) => T
}

/** Um valor compartilhado, guardado no navegador quando tem `storageKey`. */
export function createStore<T>(
  initial: T,
  options: StoreOptions<T> = {},
): Store<T> {
  const { storageKey, storage = 'session', restore = completeWith } = options
  let state = initial
  if (storageKey) {
    const saved = browserStorage.read<unknown>(storageKey, storage)
    if (saved != null) {
      try {
        state = restore(saved, initial)
      } catch {
        /* Um valor guardado que não serve mais: começa do inicial. */
      }
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
    if (storageKey) browserStorage.write(storageKey, state, storage)
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

function completeWith<T>(saved: unknown, initial: T): T {
  return isPlainObject(initial) && isPlainObject(saved)
    ? ({ ...initial, ...saved } as T)
    : (saved as T)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
