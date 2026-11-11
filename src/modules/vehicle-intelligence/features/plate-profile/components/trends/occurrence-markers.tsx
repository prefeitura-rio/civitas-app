import { divIcon } from 'leaflet'
import type { CSSProperties } from 'react'
import { Marker, Popup } from 'react-leaflet'

import { OccurrenceDynamics } from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics'
import {
  copassagem,
  recorte,
} from '@/modules/vehicle-intelligence/config/recortes'
import { formatCoords } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'
import {
  candidateColor,
  victimColor,
} from '@/modules/vehicle-intelligence/features/plate-profile/profile-colors'
import { formatTimestamp } from '@/modules/vehicle-intelligence/features/plate-profile/profile-format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type { PlateProfileOccurrence } from '@/modules/vehicle-intelligence/types/domain'

/** Cor do pino: em copassagem a placa também aparece como vítima. */
const occurrenceColor = (role: PlateProfileOccurrence['role']) =>
  copassagem && role === 'victim' ? victimColor : candidateColor

export const occurrenceLegend = copassagem ? (
  <>
    <i className="legend-dot" style={{ background: victimColor }} />
    Vítima
    <i className="legend-dot" style={{ background: candidateColor }} />
    Correlata
  </>
) : (
  <>
    <i className="legend-dot" style={{ background: candidateColor }} />
    Fato em cujo entorno a placa foi lida
  </>
)

export function pinSvg(color: string, width: number, height: number): string {
  return `<svg viewBox="0 0 26 32" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><path d="M13 1C6.9 1 2 5.7 2 11.6 2 19 13 31 13 31s11-12 11-19.4C24 5.7 19.1 1 13 1Z" fill="${color}" stroke="#0f1111" stroke-width="2"/><circle cx="13" cy="11.4" r="4.2" fill="#0f1111"/></svg>`
}

function occurrenceIcon(role: PlateProfileOccurrence['role']) {
  const color = occurrenceColor(role)
  return divIcon({
    className: 'profile-occurrence-icon',
    iconSize: [26, 32],
    iconAnchor: [13, 30],
    html: `<div class="profile-occurrence-pin" style="--pin:${color}">${pinSvg(color, 26, 32)}</div>`,
  })
}

export function OccurrenceMarkers({
  occurrences,
}: {
  occurrences: PlateProfileOccurrence[]
}) {
  return (
    <>
      {occurrences.map((item) => {
        if (
          !Number.isFinite(item.event_latitude) ||
          !Number.isFinite(item.event_longitude)
        )
          return null
        const coords = formatCoords(item.event_latitude, item.event_longitude)
        return (
          <Marker
            key={item.event_id}
            position={[
              item.event_latitude as number,
              item.event_longitude as number,
            ]}
            icon={occurrenceIcon(item.role)}
          >
            <Popup className="civitas-popup">
              <div
                className="profile-occurrence-popup"
                style={
                  { '--role': occurrenceColor(item.role) } as CSSProperties
                }
              >
                <span className={`profile-occurrence-role ${item.role}`}>
                  {copassagem
                    ? item.role === 'victim'
                      ? 'PLACA VÍTIMA'
                      : 'PLACA CORRELATA'
                    : `RO ${item.event_id}`}
                </span>
                <strong>
                  {item.crime_type || categoryLabel(item.modality)}
                </strong>
                {item.papel_placa && (
                  <small>
                    Papel no RO: vítima · confiança{' '}
                    {item.confianca_papel || 'não informada'}
                  </small>
                )}
                {item.classificacao === 'automatica_a_revisar' && (
                  <small>Categoria inferida · revisão pendente</small>
                )}
                {item.precisao_horario === 'hora_isp_sem_minuto' && (
                  <small>Horário com precisão de uma hora</small>
                )}
                {item.horario_data_divergente === 'sim' && (
                  <small>
                    Data divergente entre fontes; mantida a data
                    georreferenciada
                  </small>
                )}
                <span className="profile-occurrence-when">
                  {formatTimestamp(item.event_time)}
                </span>
                <span className="profile-occurrence-place">
                  {item.event_address || 'Endereço não informado'}
                </span>
                {coords && (
                  <span className="profile-occurrence-coords">
                    Lat/Lon {coords}
                  </span>
                )}
                {recorte.hasDynamics && (
                  <OccurrenceDynamics eventIds={[item.event_id]} />
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}
