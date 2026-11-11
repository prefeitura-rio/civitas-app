import type { Feature, Geometry } from 'geojson'
import { geoJSON, latLngBounds, type Layer, type PathOptions } from 'leaflet'
import { useEffect } from 'react'
import { CircleMarker, GeoJSON, Popup, Tooltip, useMap } from 'react-leaflet'

import { BaseTiles } from '@/modules/vehicle-intelligence/components/map/base-tiles'
import { MapContainer } from '@/modules/vehicle-intelligence/components/map/map-container'
import { OccurrenceDynamics } from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics'
import { Panel } from '@/modules/vehicle-intelligence/components/panel'
import { PanelHeader } from '@/modules/vehicle-intelligence/components/panel-header'
import { OVERVIEW } from '@/modules/vehicle-intelligence/features/overview/overview-variants'
import {
  formatDateTime,
  formatMonthYearRange,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  escapeHtml,
  formatNumber,
  formatPercent,
} from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type {
  CispProperties,
  CrimeType,
  DashboardData,
  DashboardPoint,
} from '@/modules/vehicle-intelligence/types/domain'

const POINT_COLORS: Record<CrimeType, string> = {
  ROUBO: '#ff4d5e',
  FURTO: '#f2b233',
  CARGA_VEICULO: '#e45765',
  CARGA: '#d99a2b',
  VEICULO: '#8b95a1',
}

/** Enquadra a área dos fatos; a malha estadual inteira esconderia os pontos. */
function FitArea({ data }: { data: DashboardData }) {
  const map = useMap()
  const signature = `${data.mapa.features.length}:${data.pontos?.length ?? 0}`
  useEffect(() => {
    const bounds = latLngBounds([])
    ;(data.pontos ?? [])
      .filter((point) => !point.fora_area_cisps)
      .forEach((point) => bounds.extend([point.latitude, point.longitude]))
    if (!bounds.isValid() && data.mapa.features.length) {
      bounds.extend(geoJSON(data.mapa).getBounds())
    }
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.25), { maxZoom: 16 })
    // A assinatura evita reenquadrar a cada filtro que não muda a área.
    // Dependências incompletas de propósito.
  }, [map, signature])
  return null
}

function FactPoint({ point }: { point: DashboardPoint }) {
  const pointColor = POINT_COLORS[point.modalidade]
  return (
    <CircleMarker
      center={[point.latitude, point.longitude]}
      radius={5.5}
      pathOptions={{
        color: '#101414',
        weight: 1.2,
        fillColor: pointColor,
        fillOpacity: 0.92,
      }}
    >
      <Tooltip direction="top">
        {point.id} · {point.tipo}
        {point.placas_autores_citadas ? ' · placa citada no relato' : ''}
      </Tooltip>
      <Popup className="civitas-popup" maxWidth={320}>
        <div className="map-popup">
          <div className="popup-head">
            <span>{point.id}</span>
            <em>CISP {point.cisp}</em>
          </div>
          <h3>{point.tipo}</h3>
          <div className="popup-total">
            <span>Data e hora do fato</span>
            <strong>
              {point.data_hora
                ? formatDateTime(point.data_hora)
                : `${point.data_fato || ''} · horário não definido`}
            </strong>
          </div>
          {point.origem_horario && (
            <p>Origem: {point.origem_horario.replaceAll('_', ' ')}</p>
          )}
          {point.intervalo_inicio && point.intervalo_fim && (
            <p>
              Intervalo: {formatDateTime(point.intervalo_inicio)} —{' '}
              {formatDateTime(point.intervalo_fim)}
            </p>
          )}
          {point.placas_autores_citadas && (
            <p style={{ color: '#e879f9' }}>
              <strong>Placas citadas como veículo do autor:</strong>{' '}
              {point.placas_autores_citadas}
            </p>
          )}
          {point.placas_autores_parciais && (
            <p>Placas parciais: {point.placas_autores_parciais}</p>
          )}
          <div className="popup-split">
            <div>
              <i
                className={point.modalidade === 'ROUBO' ? 'robbery' : 'theft'}
              ></i>
              <span>Deslocamento</span>
              <strong>{categoryLabel(point.deslocamento)}</strong>
            </div>
            <div>
              <span>Alvo</span>
              <strong>{categoryLabel(point.alvo)}</strong>
            </div>
          </div>
          {point.endereco && (
            <div className="popup-share">
              <span>Local</span>
              <strong>
                {point.endereco}
                {point.bairro ? ` · ${point.bairro}` : ''}
              </strong>
            </div>
          )}
          <OccurrenceDynamics eventIds={[point.id]} />
        </div>
      </Popup>
    </CircleMarker>
  )
}

function intensityColor(intensity: number): string {
  if (intensity > 0.78) return '#ff263f'
  if (intensity > 0.54) return '#d71932'
  if (intensity > 0.32) return '#9d2637'
  if (intensity > 0.12) return '#5e2932'
  return '#30262a'
}

const scopeLabel = OVERVIEW.focusArea ? 'na área' : 'no recorte'

function cispPopupHtml(properties: CispProperties): string {
  return `<div class="map-popup">
    <div class="popup-head"><span>CISP ${escapeHtml(properties.cisp)}</span><em>#${escapeHtml(properties.posicao || '—')} no ranking</em></div>
    <h3>${escapeHtml(properties.nome)}</h3>
    <div class="popup-total"><span>Ocorrências ${scopeLabel}</span><strong>${formatNumber(properties.ocorrencias)}</strong></div>
    <div class="popup-split">
      ${OVERVIEW.columns.map((column, index) => `<div>${index < 2 ? `<i class="${index ? 'theft' : 'robbery'}"></i>` : ''}<span>${column.label}</span><strong>${formatNumber(properties[column.key] ?? 0)}</strong></div>`).join('')}
    </div>
    <div class="popup-share"><span>Participação ${scopeLabel}</span><strong>${formatPercent(properties.participacao, 2)}</strong></div>
  </div>`
}

export function ChoroplethMap({ data }: { data: DashboardData }) {
  const style = (feature?: Feature<Geometry, CispProperties>): PathOptions => {
    const properties = feature?.properties
    return {
      color: properties?.selected ? '#ffd7dc' : '#60737a',
      weight: properties?.selected ? 1.15 : 0.55,
      fillColor: intensityColor(properties?.intensidade || 0),
      fillOpacity: OVERVIEW.focusArea
        ? properties?.selected
          ? 0.42
          : 0.1
        : properties?.selected
          ? 0.82
          : 0.16,
    }
  }

  const bindCisp = (
    feature: Feature<Geometry, CispProperties>,
    layer: Layer,
  ) => {
    layer.bindPopup(cispPopupHtml(feature.properties), {
      className: 'civitas-popup',
      maxWidth: 340,
    })
    layer.bindTooltip(
      `CISP ${escapeHtml(feature.properties.cisp)} · ${formatNumber(feature.properties.ocorrencias)}`,
      {
        sticky: true,
        direction: 'top',
      },
    )
  }

  return (
    <Panel className="map-panel">
      {OVERVIEW.focusArea ? (
        <PanelHeader
          eyebrow={
            data.summary.area
              ? `Área foco · ${data.summary.area}`
              : 'Distribuição territorial'
          }
          title="Fatos na área e CISPs"
          description="Distribuição dos fatos georreferenciados e das CISPs da área."
          action={
            <div className="map-period">
              {formatMonthYearRange(
                data.metadata.periodo_inicio,
                data.metadata.periodo_fim,
              )}
            </div>
          }
        />
      ) : (
        <PanelHeader
          eyebrow="Distribuição territorial"
          title="Ocorrências por CISP"
          description="Intensidade proporcional ao total de ocorrências na CISP; clique em uma área para ver os números."
          action={
            <div className="map-period">
              {formatMonthYearRange(
                data.metadata.periodo_inicio,
                data.metadata.periodo_fim,
              )}
            </div>
          }
        />
      )}
      <div
        className={
          OVERVIEW.focusArea ? 'map-wrap overview-map-wrap' : 'map-wrap'
        }
      >
        <MapContainer
          {...(OVERVIEW.focusArea
            ? { center: [-22.94, -43.18], zoom: 14, minZoom: 10, maxZoom: 18 }
            : { center: [-22.91, -43.37], zoom: 10, minZoom: 8, maxZoom: 15 })}
          preferCanvas
          zoomControl={false}
        >
          <BaseTiles style="dark_all" />
          <GeoJSON
            key={JSON.stringify(
              data.mapa.features.map((item) => [
                item.properties.cisp,
                item.properties.selected,
                item.properties.ocorrencias,
              ]),
            )}
            data={data.mapa}
            style={style}
            onEachFeature={bindCisp}
          />
          {data.pontos?.map((point) => (
            <FactPoint key={point.id} point={point} />
          ))}
          {OVERVIEW.focusArea && <FitArea data={data} />}
        </MapContainer>
        {OVERVIEW.focusArea ? (
          <div className="map-legend">
            <i
              style={{
                background: POINT_COLORS.ROUBO,
                borderRadius: 999,
                width: 8,
                height: 8,
                marginLeft: 2,
              }}
            ></i>
            <span>Roubo</span>
            <i
              style={{
                background: POINT_COLORS.FURTO,
                borderRadius: 999,
                width: 8,
                height: 8,
                marginLeft: 8,
              }}
            ></i>
            <span>Furto</span>
          </div>
        ) : (
          <div className="map-legend">
            <span>Menor</span>
            <i className="l1"></i>
            <i className="l2"></i>
            <i className="l3"></i>
            <i className="l4"></i>
            <i className="l5"></i>
            <span>Maior</span>
          </div>
        )}
        {OVERVIEW.focusArea ? (
          <div className="map-counter">
            <strong>{formatNumber(data.pontos?.length ?? 0)}</strong>
            <span>fatos no mapa</span>
          </div>
        ) : (
          <div className="map-counter">
            <strong>
              {data.summary.cisps_selecionadas || data.mapa.features.length}
            </strong>
            <span>CISPs no recorte</span>
          </div>
        )}
      </div>
    </Panel>
  )
}
