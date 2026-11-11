import { MapPin } from 'lucide-react'
import type { CSSProperties } from 'react'

import { OccurrenceDynamics } from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics'
import { AuthorCitations } from '@/modules/vehicle-intelligence/components/plate/author-citations'
import { CercoBadge } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import { GroupFactDetails } from '@/modules/vehicle-intelligence/components/timeline/popups/group-fact-details'
import {
  geocodeQualityLabel,
  vehicleLabel,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-format'
import type {
  CrimeSite,
  TimelineTrack,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import {
  copassagem,
  recorte,
} from '@/modules/vehicle-intelligence/config/recortes'
import { formatTime } from '@/modules/vehicle-intelligence/lib/dates'
import { formatDistance } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

export function CrimeSitePopup({
  site,
  tracks,
}: {
  site: CrimeSite
  tracks: TimelineTrack[]
}) {
  const item = site.case
  const mode =
    item.offender_mode && item.offender_mode !== 'NÃO INFORMADO'
      ? `autor ${categoryLabel(item.offender_mode).toLowerCase()}`
      : 'deslocamento não informado'
  return (
    <div
      className="analysis-map-popup analysis-crime-popup"
      style={
        {
          '--popup-accent': site.track.color,
          '--popup-role': site.track.color,
        } as CSSProperties
      }
    >
      <div className="analysis-popup-top">
        <span className="analysis-popup-role victim">
          <MapPin size={12} />
          FATO
        </span>
        <span className="analysis-popup-status">
          {item.modality ? categoryLabel(item.modality) : 'não informado'}
          {copassagem ? '' : ` · ${mode}`}
        </span>
      </div>
      {copassagem ? (
        <div className="analysis-popup-identity">
          <strong className="analysis-popup-plate analysis-popup-plate-primary">
            {item.victim_plate}
            {item.victim_plate && (
              <CercoBadge plate={item.victim_plate} className="cerco-plate-tag">
                CERCO
              </CercoBadge>
            )}
          </strong>
          <span className="analysis-popup-track">
            <i />
            {site.track.label} ·{' '}
            {item.ro ? `RO ${item.ro}` : `ocorrência ${item.event_id}`}
          </span>
          <span className="analysis-popup-vehicle">{vehicleLabel(item)}</span>
        </div>
      ) : (
        <div className="analysis-popup-identity">
          <strong className="analysis-popup-plate analysis-popup-plate-primary">
            RO {item.ro ?? item.event_id}
          </strong>
          <span className="analysis-popup-track">
            <i />
            {site.track.label} · CISP {item.event_cisp}
          </span>
          <span className="analysis-popup-vehicle">
            {item.crime_type || 'tipo de delito não informado'}
          </span>
        </div>
      )}
      <b className="analysis-popup-time">{formatTime(item.event_time)}</b>
      <span className="analysis-popup-place">
        {item.event_address || 'Endereço não informado'}
        {item.event_neighborhood ? ` · ${item.event_neighborhood}` : ''}
      </span>
      {item.group && (
        <GroupFactDetails group={item.group} tracks={tracks} day={item.day} />
      )}
      {recorte.hasDynamics && <OccurrenceDynamics eventIds={[item.event_id]} />}
      {!!item.candidate_author_citations?.length && (
        <>
          <strong>Placa {item.candidate_plate} citada neste RO</strong>
          <AuthorCitations citations={item.candidate_author_citations} />
        </>
      )}
      {item.cameras && (
        <details className="analysis-crime-metrics">
          <summary>Dados de correlação</summary>
          <dl className="analysis-popup-grid">
            <dt>Leituras no entorno</dt>
            <dd>{item.correlations}</dd>
            <dt>Mais próxima do horário</dt>
            <dd>
              {item.min_fact_delta_minutes == null
                ? '—'
                : `${item.min_fact_delta_minutes} min`}
            </dd>
            <dt>Equipamento mais próximo</dt>
            <dd>
              {formatDistance(item.min_fact_distance_meters, { fixedKm: true })}
            </dd>
            <dt>Equipamentos no raio</dt>
            <dd>{item.cameras.length}</dd>
          </dl>
        </details>
      )}
      <span className="analysis-crime-popup-note">
        {geocodeQualityLabel(item.geocode_quality)}.
      </span>
    </div>
  )
}
