import { Building2, LoaderCircle, MapPin, Route } from 'lucide-react'
import { lazy, Suspense } from 'react'

import { ProfileHeading } from '@/modules/vehicle-intelligence/features/plate-profile/components/layout/profile-heading'
import { CirculationMap } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-map'
import { LegsTable } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/legs-table'
import { LocationsTable } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/locations-table'
import { NeighborhoodChoropleth } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/neighborhood-choropleth'
import { NeighborhoodTable } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/neighborhood-table'
import type { CirculationControls } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/use-circulation-controls'
import type { TrendsData } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/use-trends-data'
import type { RegisterSection } from '@/modules/vehicle-intelligence/features/plate-profile/use-active-section'
import type {
  PlateProfileData,
  RioNeighborhoodGeometry,
} from '@/modules/vehicle-intelligence/types/domain'

const importTrips3DMap = () =>
  import(
    '@/modules/vehicle-intelligence/features/plate-profile/components/trends/trips-3d-map'
  )
const ProfileTrips3DMap = lazy(importTrips3DMap)

/** Reserva a mesma altura do mapa enquanto ele carrega.
 *
 * O fallback anterior era uma faixa fina: ao trocar de aba a página encolhia
 * 760px e voltava a crescer quando o mapa montava, empurrando o conteúdo.
 */
function MapLoading({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="profile-map-loading" role="status" aria-live="polite">
      <LoaderCircle className="animate-spin" size={26} />
      <strong>{label}</strong>
      {hint && <span>{hint}</span>}
    </div>
  )
}

/** "Onde circula": pontos de coleta, viagens (mapa 3D) ou bairros, cada um com o seu mapa e a sua tabela. */
export function CirculationSection({
  readyData,
  trends,
  controls,
  neighborhoodGeometry,
  neighborhoodGeometryError,
  registerSection,
}: {
  readyData: PlateProfileData
  trends: TrendsData
  controls: CirculationControls
  neighborhoodGeometry: RioNeighborhoodGeometry | null
  neighborhoodGeometryError: string | null
  registerSection: RegisterSection
}) {
  const { circulationPoints, scopedOccurrences, periodDays } = trends
  const {
    circulationView,
    setCirculationView,
    circulationLayer,
    setCirculationLayer,
    showOccurrences,
    setShowOccurrences,
    radarMapRef,
    radarOpenSequence,
    radarOpenRequest,
    setRadarOpenRequest,
  } = controls
  const neighborhoodStats = readyData.neighborhoods || []
  return (
    <section
      className="profile-section"
      id="onde-circula"
      ref={registerSection('onde-circula')}
    >
      <ProfileHeading
        icon={MapPin}
        title="Onde circula"
        description="Cada visualização troca o mapa e a tabela. Os fatos do recorte global ligados à placa entram como camada sobreposta, em qualquer visualização."
        action={
          <div className="profile-section-actions">
            <div
              className="profile-subtabs"
              role="group"
              aria-label="Visualização de circulação"
            >
              <button
                type="button"
                aria-pressed={circulationView === 'points'}
                className={`profile-subtab${circulationView === 'points' ? ' active' : ''}`}
                onClick={() => setCirculationView('points')}
              >
                <MapPin size={15} />
                Pontos
              </button>
              <button
                type="button"
                aria-pressed={circulationView === 'trips'}
                className={`profile-subtab${circulationView === 'trips' ? ' active' : ''}`}
                onMouseEnter={importTrips3DMap}
                onFocus={importTrips3DMap}
                onClick={() => setCirculationView('trips')}
              >
                <Route size={15} />
                Viagens
              </button>
              <button
                type="button"
                aria-pressed={circulationView === 'neighborhoods'}
                className={`profile-subtab${circulationView === 'neighborhoods' ? ' active' : ''}`}
                onClick={() => setCirculationView('neighborhoods')}
              >
                <Building2 size={15} />
                Bairros
              </button>
            </div>
          </div>
        }
      />
      {circulationView === 'points' && (
        <>
          <CirculationMap
            points={circulationPoints}
            occurrences={scopedOccurrences}
            showOccurrences={showOccurrences}
            layer={circulationLayer}
            onLayerChange={setCirculationLayer}
            onToggleCorrelations={() => setShowOccurrences((value) => !value)}
            radarMapRef={radarMapRef}
            openRequest={radarOpenRequest}
            periodDays={periodDays}
            emptyHint="Nenhum ponto de coleta geolocalizado para esta placa."
          />
          <span className="profile-view-caption">
            Detecções agrupadas por ponto de coleta; aproxime para o cluster se
            desfazer, ou use Heatmap para ler a concentração sem perder o
            enquadramento.
          </span>
          <LocationsTable
            locations={readyData.top_locations}
            total={readyData.summary.total_detections}
            onPointFocus={(pointId) => radarMapRef.current?.focus(pointId)}
            onPointOpen={(pointId) => {
              setCirculationLayer('detections')
              radarOpenSequence.current += 1
              setRadarOpenRequest({
                pointId,
                sequence: radarOpenSequence.current,
              })
            }}
          />
        </>
      )}
      {circulationView === 'trips' &&
        (readyData.trip_legs.length === 0 &&
        !(showOccurrences && scopedOccurrences.length > 0) ? (
          <div className="profile-occurrences-empty">
            <Route size={22} />
            <span>
              Nenhuma viagem origem–destino consecutiva identificada no período.
            </span>
          </div>
        ) : (
          <>
            <Suspense
              fallback={
                <MapLoading
                  label="Preparando visualização 3D…"
                  hint="Carregando arcos origem–destino e o mapa base."
                />
              }
            >
              <ProfileTrips3DMap
                legs={readyData.trip_legs}
                occurrences={scopedOccurrences}
                showCorrelations={showOccurrences}
                onToggleCorrelations={() =>
                  setShowOccurrences((value) => !value)
                }
              />
            </Suspense>
            <span className="profile-view-caption">
              Arcos 3D ligam pares de pontos visitados em sequência com até 1
              hora de intervalo.
            </span>
            {readyData.trip_legs.length > 0 && (
              <LegsTable legs={readyData.trip_legs} />
            )}
          </>
        ))}
      {circulationView === 'neighborhoods' && (
        <>
          <NeighborhoodChoropleth
            geometry={neighborhoodGeometry}
            geometryError={neighborhoodGeometryError}
            neighborhoods={readyData.neighborhoods}
            points={circulationPoints}
            occurrences={scopedOccurrences}
            showOccurrences={showOccurrences}
          />
          <span className="profile-view-caption">
            Intensidade do polígono proporcional ao total de passagens no
            bairro.
          </span>
          <NeighborhoodTable neighborhoods={neighborhoodStats} />
        </>
      )}
    </section>
  )
}
