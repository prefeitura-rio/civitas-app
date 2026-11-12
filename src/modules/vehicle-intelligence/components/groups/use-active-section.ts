/** Rolagem dos perfis de grupo e de território: a seção ativa nas abas fixas e o salto até uma seção. */
import { type RefObject, useEffect, useState } from 'react'

/** Rola a página até o elemento, com `offset` px de folga acima dele (o cabeçalho e as abas fixas). */
export function scrollToElement(element: HTMLElement | null, offset: number) {
  if (element)
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth',
    })
}

/** A seção ativa: a última cujo topo passou da altura das abas fixas (antes disso, a primeira de `keys`). */
export function useActiveSection<K extends string>(
  keys: readonly K[],
  refs: Record<K, RefObject<HTMLElement>>,
  enabled: boolean,
): K {
  const [section, setSection] = useState<K>(keys[0])
  useEffect(() => {
    if (!enabled) return
    const onScroll = () => {
      let current: K = keys[0]
      for (const key of keys)
        if ((refs[key].current?.getBoundingClientRect().top ?? Infinity) < 160)
          current = key
      setSection(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [keys, refs, enabled])
  return section
}
