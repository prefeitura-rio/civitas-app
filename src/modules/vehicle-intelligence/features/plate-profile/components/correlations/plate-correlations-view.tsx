import {
  AlertTriangle,
  CalendarClock,
  LoaderCircle,
  MapPin,
  Network,
} from 'lucide-react'

import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { CitationSummary } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/citation-summary'
import { citationNote } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/citations'
import {
  calendarDaySpan,
  intervalLabel,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-format'
import { CorrelationTimeline } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-timeline'
import { ProfileCorrelationTimelineSummary } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-timeline-summary'
import { CorrelationsMap } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlations-map'
import { DenunciaSummary } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/denuncia-summary'
import { ProfileHeading } from '@/modules/vehicle-intelligence/features/plate-profile/components/layout/profile-heading'
import { PROFILE } from '@/modules/vehicle-intelligence/features/plate-profile/profile-variants'
import type {
  PlateCitationsData,
  PlateCorrelationsData,
  PlateDenunciasData,
} from '@/modules/vehicle-intelligence/types/domain'

export function PlateCorrelationsView({
  plate,
  data,
  error,
  onOpenTimeline,
  onOpenOccurrence,
  citations = null,
  denuncias = null,
}: {
  plate: string
  data: PlateCorrelationsData | null
  error: string | null
  onOpenTimeline: (day: string | null) => void
  onOpenOccurrence: (ro: string) => void
  citations?: PlateCitationsData | null
  /** As denúncias do Disque Denúncia que citam a placa. */
  denuncias?: PlateDenunciasData | null
}) {
  const citedNotes = new Map(
    citations?.ready
      ? citations.citations.map(
          (item) =>
            [
              item.event_id,
              citationNote(
                item,
                citations.methodology.event_window_minutes,
                citations.methodology.radius_meters,
              ),
            ] as const,
        )
      : [],
  )
  const citedIds = new Set(citedNotes.keys())
  if (error)
    return (
      <div className="profile-state error" role="alert">
        <AlertTriangle size={26} />
        <strong>Não foi possível carregar as correlações</strong>
        <span>{error}</span>
      </div>
    )
  if (!data)
    return (
      <div className="profile-state" role="status">
        <LoaderCircle className="animate-spin" size={26} />
        <strong>Lendo a rede de correlações</strong>
        <span>Consultando o grafo materializado da placa {plate}.</span>
      </div>
    )
  if (!data.ready)
    return (
      <div className="profile-state" role="status">
        <Network size={26} />
        <strong>Grafo de correlatas indisponível</strong>
        <span>{data.reason}</span>
      </div>
    )

  if (!data.summary.linked_events) {
    return (
      <div className="profile-corr">
        <CitationSummary plate={plate} data={citations} />
        <DenunciaSummary data={denuncias} />
        <div className="profile-occurrences-empty">
          <Network size={22} />
          <span>
            {plate} não aparece como placa correlata em nenhuma ocorrência deste
            recorte. Use “Ver todos os fatos” para ignorar o recorte global.
          </span>
        </div>
      </div>
    )
  }

  const summary = data.summary
  const cispNames = data.cisp_names ?? {}
  const occurrences = data.occurrences
    .filter((item) => item.role === 'candidate')
    .sort(
      (a, b) =>
        new Date(a.event_time).getTime() - new Date(b.event_time).getTime(),
    )
  const gaps = occurrences
    .slice(1)
    .map(
      (item, index) =>
        new Date(item.event_time).getTime() -
        new Date(occurrences[index].event_time).getTime(),
    )
    .filter((value) => value > 0)
    .sort((a, b) => a - b)
  const medianGap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0
  const activityDays = calendarDaySpan(summary.first_seen, summary.last_seen)
  // Citada num RO sem correlação (ou fora dos filtros do recorte): o RO entra no perfil numa lista própria.
  const timelineIds = new Set(occurrences.map((item) => item.event_id))
  const citedOffTimeline = citations?.ready
    ? citations.citations.filter((item) => !timelineIds.has(item.event_id))
    : []

  return (
    <div className="profile-corr">
      {citedOffTimeline.length > 0 && (
        <CitationSummary
          plate={plate}
          data={citations}
          items={citedOffTimeline}
        />
      )}
      <DenunciaSummary data={denuncias} />
      <section className="profile-section" id="corr-timeline">
        <ProfileHeading
          icon={CalendarClock}
          eyebrow="A · OCORRÊNCIAS LIGADAS"
          title={PROFILE.sections.timeline.title.replace('{plate}', plate)}
          description={`${PROFILE.sections.timeline.text} ${recorte.hasDynamics ? 'Clique num fato para ler a dinâmica.' : 'Clique num fato para abrir o dia na timeline.'}`}
        />
        <div className="profile-corr-timeline">
          <ProfileCorrelationTimelineSummary
            count={summary.linked_events}
            days={activityDays}
            medianInterval={intervalLabel(medianGap)}
          />
          <CorrelationTimeline
            occurrences={occurrences}
            events={data.events ?? []}
            cispNames={cispNames}
            citedNotes={citedNotes}
            plate={plate}
            onOpenTimeline={onOpenTimeline}
            onOpenOccurrence={onOpenOccurrence}
          />
        </div>
      </section>

      <section className="profile-section" id="corr-mapa">
        <ProfileHeading
          icon={MapPin}
          eyebrow="B · GEOGRAFIA DAS OCORRÊNCIAS"
          title={<>Onde as correlações aconteceram</>}
          description={PROFILE.sections.map}
        />
        <CorrelationsMap
          occurrences={occurrences}
          cispNames={cispNames}
          onOpenDay={(day) => onOpenTimeline(day)}
          citedIds={citedIds}
        />
      </section>

      <p className="profile-disclaimer">
        <AlertTriangle size={14} />
        {PROFILE.disclaimer}
      </p>
    </div>
  )
}
