import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  FileSearch,
} from 'lucide-react'
import { useState } from 'react'

import {
  HighlightedText,
  OccurrenceDynamicsPanel,
} from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics'
import { CercoBadge } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import {
  cispUnitLabel,
  correlationEventAnchor,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-format'
import { formatTimestamp } from '@/modules/vehicle-intelligence/features/plate-profile/profile-format'
import { PROFILE } from '@/modules/vehicle-intelligence/features/plate-profile/profile-variants'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type {
  PlateCorrelationsData,
  PlateProfileOccurrence,
} from '@/modules/vehicle-intelligence/types/domain'

export type LinkedEvent = NonNullable<PlateCorrelationsData['events']>[number]

/** Cartão do fato. Com relato publicado, o clique revela a dinâmica logo abaixo; sem ele, abre o dia na timeline. */
export function CorrelationEventItem({
  item,
  index,
  linked,
  cispNames,
  citedNote,
  terms,
  dynamics,
  plate,
  onOpenTimeline,
  onOpenOccurrence,
}: {
  item: PlateProfileOccurrence
  index: number
  linked: LinkedEvent | undefined
  cispNames: Record<string, string>
  citedNote: string | undefined
  terms: string[]
  dynamics: string | null
  plate: string
  onOpenTimeline: (day: string | null) => void
  onOpenOccurrence: (ro: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const panelId = `profile-corr-dynamics-${item.event_id.replace(/\W/g, '-')}`
  const anchor = PROFILE.anchor(item)
  const ro = item.ro
  return (
    <li
      className={`profile-corr-event${citedNote ? ' cited' : ''}${open ? ' open' : ''}`}
      id={correlationEventAnchor(item.event_id)}
    >
      <div className="profile-corr-event-rail" aria-hidden="true">
        <span>{index + 1}</span>
      </div>
      <div className="profile-corr-event-body">
        <button
          type="button"
          className="profile-corr-event-card"
          {...(recorte.hasDynamics
            ? {
                'aria-expanded': open,
                'aria-controls': panelId,
                onClick: () => {
                  setLoaded(true)
                  setOpen((value) => !value)
                },
              }
            : {
                'aria-label': `Abrir timeline de ${formatTimestamp(item.event_time)}`,
                onClick: () => onOpenTimeline(item.day),
              })}
        >
          <span className="profile-corr-event-when">
            <strong>{formatTimestamp(item.event_time)}</strong>
            <small>{cispUnitLabel(item.cisp, cispNames)}</small>
          </span>
          <span className="profile-corr-event-context">
            <span className="profile-corr-event-victim">
              <small>{anchor.label}</small>
              <strong>
                {anchor.value}
                {anchor.isPlate && (
                  <CercoBadge plate={anchor.value} className="cerco-plate-tag">
                    CERCO
                  </CercoBadge>
                )}
              </strong>
              {citedNote && (
                <b className="profile-cited-line" title={citedNote}>
                  Placa citada no relato
                </b>
              )}
              <span className="profile-corr-event-subject">
                <i
                  className={`profile-corr-modality ${item.modality?.toLowerCase() || ''}`}
                >
                  {item.modality
                    ? categoryLabel(item.modality)
                    : 'modalidade não informada'}
                </i>
                <em>{PROFILE.subject(item)}</em>
              </span>
            </span>
            <span className="profile-corr-event-place">
              <small>Local do fato</small>
              <strong title={item.event_address || ''}>
                {item.event_address || 'Endereço não informado'}
              </strong>
            </span>
          </span>
          <span className="profile-corr-event-evidence">
            {PROFILE.evidence(item, linked?.cooccurrences).map(
              ([label, value, title]) => (
                <span key={label} title={title}>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </span>
              ),
            )}
            {recorte.hasDynamics ? (
              <em>
                {open ? 'Fechar relato' : 'Ler dinâmica'}{' '}
                <ChevronDown className="profile-corr-chevron" size={14} />
              </em>
            ) : (
              <em>
                Ver dia <ArrowRight size={14} />
              </em>
            )}
          </span>
        </button>
        {ro && (
          <Button
            size="sm"
            variant="ghost"
            className="profile-corr-open-ro"
            onClick={() => onOpenOccurrence(ro)}
          >
            <FileSearch size={14} />
            Perfil do RO {ro}: quem passou junto e perto
          </Button>
        )}
        {terms.length > 0 && dynamics && !open && (
          <p className="profile-corr-snippet">
            <HighlightedText text={dynamics} terms={terms} window={90} />
          </p>
        )}
        {recorte.hasDynamics && (
          <div
            className="profile-corr-dynamics"
            id={panelId}
            // React 18 descarta a prop `inert` booleana; a propriedade do DOM é ligada aqui a cada render.
            ref={(node) => {
              if (node) node.inert = !open
            }}
          >
            <div>
              {loaded && (
                <OccurrenceDynamicsPanel
                  eventIds={[item.event_id]}
                  highlight={[...terms, plate.toLowerCase()]}
                />
              )}
              <Button
                size="sm"
                variant="ghost"
                className="profile-corr-open-day"
                onClick={() => onOpenTimeline(item.day)}
              >
                <CalendarClock size={14} />
                Ver o dia na timeline
              </Button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
