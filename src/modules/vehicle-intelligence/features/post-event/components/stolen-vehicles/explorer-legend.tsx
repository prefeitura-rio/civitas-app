import { TerritoriesLegend } from '@/modules/vehicle-intelligence/components/map/territories-layer'
import { LegendKeys } from '@/modules/vehicle-intelligence/features/post-event/components/shared/legend-keys'
import { clusterConnectionWeight } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import { legendParameters } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/legend-parameters'
import {
  modalityName,
  PRIMARY,
  SECONDARY,
  TEXT,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/recorte-texts'
import type { MasterPostData } from '@/modules/vehicle-intelligence/features/post-event/types'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

/** A legenda do mapa: a linha das cores e, aberta, "Como ler" com os parâmetros do motor. */
export function ExplorerLegend({
  methodology,
  open,
  onToggle,
  selectedConnectionCount,
  selectedConnectionMaximum,
  showCisps,
  showTerritories,
}: {
  methodology: MasterPostData['methodology']
  open: boolean
  onToggle: () => void
  selectedConnectionCount: number
  selectedConnectionMaximum: number
  showCisps: boolean
  showTerritories: boolean
}) {
  const {
    primaryPoleRadius,
    primaryPoleMinimum,
    secondaryPoleRadius,
    secondaryPoleMinimum,
    disconnectionPoleRadius,
    disconnectionPoleMinimum,
    concentratedPoleMinimum,
    concentratedPoleMinimumDays,
    originConcentrationRadius,
    originConcentrationMinimum,
    originConcentrationDays,
  } = legendParameters(methodology)
  return (
    <div
      className={`post-event-map-legend map-legend-pill ${open ? 'expanded' : 'collapsed'}`}
      aria-label="Legenda do mapa"
    >
      <LegendKeys
        primaryLabel={categoryLabel(PRIMARY)}
        secondaryLabel={categoryLabel(SECONDARY)}
        open={open}
        onToggle={onToggle}
      />
      {open && (
        <div className="map-legend-content">
          <div>
            <i className="origin robbery concentrated" />
            <span>
              <b>Polo de {modalityName(PRIMARY)}</b>
              <small>
                Contínuo: raio {primaryPoleRadius} m e mínimo{' '}
                {primaryPoleMinimum} {TEXT.unit}. Tracejado: concentração de{' '}
                {originConcentrationMinimum} {TEXT.unit} em{' '}
                {originConcentrationDays} dias dentro de{' '}
                {originConcentrationRadius} m.
              </small>
            </span>
          </div>
          <div>
            <i className="origin theft concentrated" />
            <span>
              <b>Polo de {modalityName(SECONDARY)}</b>
              <small>
                Contínuo: raio {secondaryPoleRadius} m e mínimo{' '}
                {secondaryPoleMinimum} {TEXT.unit}. Tracejado: concentração de{' '}
                {originConcentrationMinimum} {TEXT.unit} em{' '}
                {originConcentrationDays} dias dentro de{' '}
                {originConcentrationRadius} m.
              </small>
            </span>
          </div>
          <div>
            <i className="destination" />
            <span>
              <b>{TEXT.destination}</b>
              <small>
                Mínimo {disconnectionPoleMinimum} radares dentro de{' '}
                {disconnectionPoleRadius} m.
                {TEXT.destinationNote}
              </small>
            </span>
          </div>
          <div>
            <i className="destination concentrated" />
            <span>
              <b>Polo de desconexão · concentração</b>
              <small>
                Contorno tracejado: ao menos {concentratedPoleMinimum} finais em{' '}
                {concentratedPoleMinimumDays} dias, mesmo em um único radar.
              </small>
            </span>
          </div>
          {selectedConnectionCount > 0 && (
            <div>
              <i
                className="flow-line"
                style={{
                  borderTopWidth: clusterConnectionWeight(
                    selectedConnectionMaximum,
                    selectedConnectionMaximum,
                  ),
                }}
              />
              <span>
                <b>Conexão recorrente</b>
                <small>
                  Todas as ligações recorrentes do polo selecionado são
                  desenhadas; não representam rota viária.
                </small>
              </span>
            </div>
          )}
          {showCisps && (
            <div>
              <i className="cisp-boundary" />
              <span>
                <b>Limite de CISP</b>
                <small>Divisão territorial da delegacia selecionada.</small>
              </span>
            </div>
          )}
          {showTerritories && <TerritoriesLegend />}
        </div>
      )}
    </div>
  )
}
