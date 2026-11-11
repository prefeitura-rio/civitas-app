/**
 * A seção marcada no índice "Nesta análise": a primeira visível abaixo do cabeçalho fixo (198 px), e a rolagem até a
 * seção escolhida. As tendências registram as seções por ref; as correlações as acham pelo id.
 */
import { useEffect, useRef, useState } from 'react'

import {
  CORRELATION_SECTION_DEFS,
  type CorrelationSectionId,
  SECTION_DEFS,
  type SectionId,
} from '@/modules/vehicle-intelligence/features/plate-profile/profile-sections'
import type { PlateProfileAnalysis } from '@/modules/vehicle-intelligence/types/domain'

const preferredScrollBehavior = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'

export function useTrendsSections(ready: boolean | undefined, plate: string) {
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({})
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  useEffect(() => {
    if (!ready) return
    const elements = SECTION_DEFS.map(
      ({ id }) => [id, sectionRefs.current[id]] as const,
    ).filter((entry): entry is [SectionId, HTMLElement] => Boolean(entry[1]))
    if (!elements.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSection(visible[0].target.id as SectionId)
      },
      { rootMargin: '-198px 0px -65% 0px', threshold: 0 },
    )
    elements.forEach(([, el]) => observer.observe(el))
    return () => observer.disconnect()
  }, [ready, plate])
  const registerSection = (id: SectionId) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }
  const scrollToSection = (id: SectionId) =>
    sectionRefs.current[id]?.scrollIntoView({
      behavior: preferredScrollBehavior(),
      block: 'start',
    })
  return { activeSection, registerSection, scrollToSection }
}

export function useCorrelationSections(
  analysis: PlateProfileAnalysis,
  ready: boolean | undefined,
  plate: string,
) {
  const [activeCorrelationSection, setActiveCorrelationSection] = useState(
    CORRELATION_SECTION_DEFS[0].id,
  )
  useEffect(() => {
    if (analysis !== 'correlations' || !ready) return
    const elements = CORRELATION_SECTION_DEFS.map(({ id }) =>
      document.getElementById(id),
    ).filter((element): element is HTMLElement => Boolean(element))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0])
          setActiveCorrelationSection(
            visible[0].target.id as CorrelationSectionId,
          )
      },
      { rootMargin: '-198px 0px -65% 0px', threshold: 0 },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [analysis, ready, plate])
  const scrollToCorrelationSection = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' })
  return { activeCorrelationSection, scrollToCorrelationSection }
}

export type RegisterSection = ReturnType<
  typeof useTrendsSections
>['registerSection']
