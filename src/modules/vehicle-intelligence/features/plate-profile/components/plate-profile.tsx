import { EventScopeBar } from '@/modules/vehicle-intelligence/components/filters/event-scope-bar'
import { CorrelationOverview } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/correlation-overview'
import { PlateCorrelationsView } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/plate-correlations-view'
import { useProfileIndicators } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/use-profile-indicators'
import { vehicleLine } from '@/modules/vehicle-intelligence/features/plate-profile/components/correlations/vehicle'
import { ProfileAnalysisTabs } from '@/modules/vehicle-intelligence/features/plate-profile/components/layout/profile-analysis-tabs'
import { ProfileIndexNav } from '@/modules/vehicle-intelligence/features/plate-profile/components/layout/profile-index-nav'
import { ProfileTopBar } from '@/modules/vehicle-intelligence/features/plate-profile/components/layout/profile-top-bar'
import { TrendsState } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/trends-state'
import { TrendsView } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/trends-view'
import { useCirculationControls } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/use-circulation-controls'
import { useTrendsData } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/use-trends-data'
import {
  CORRELATION_SECTION_DEFS,
  correlationSectionBadge,
  SECTION_DEFS,
  sectionBadge,
  type SectionId,
} from '@/modules/vehicle-intelligence/features/plate-profile/profile-sections'
import {
  useCorrelationSections,
  useTrendsSections,
} from '@/modules/vehicle-intelligence/features/plate-profile/use-active-section'
import { usePlateProfileData } from '@/modules/vehicle-intelligence/features/plate-profile/use-plate-profile-data'
import { PlateReportsMenu } from '@/modules/vehicle-intelligence/features/reports'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import { usePlateScopeQuery } from '@/modules/vehicle-intelligence/stores/event-scope'
import type {
  OpenPlate,
  PlateProfileAnalysis,
} from '@/modules/vehicle-intelligence/types/navigation'

/** O perfil da placa: cabeçalho fixo e as duas análises, correlações e tendências de circulação. */
export function CorrelationPlateProfile({
  plate,
  analysis,
  onAnalysisChange,
  onBack,
  onOpenTimeline,
  onOpenPlate,
  onOpenOccurrence,
}: {
  plate: string
  analysis: PlateProfileAnalysis
  onAnalysisChange: (analysis: PlateProfileAnalysis) => void
  onBack: () => void
  onOpenTimeline: (day: string | null) => void
  /** Busca da barra do perfil: a placa e, se escolhida na busca, a aba a abrir. */
  onOpenPlate: OpenPlate
  /** O perfil do RO de uma ocorrência ligada à placa. */
  onOpenOccurrence: (ro: string) => void
}) {
  const scopeQuery = usePlateScopeQuery()
  const {
    data,
    error,
    retry,
    correlationData,
    correlationError,
    citationData,
    denunciaData,
    neighborhoodGeometry,
    neighborhoodGeometryError,
  } = usePlateProfileData(plate, analysis, scopeQuery)
  const indicators = useProfileIndicators(plate, correlationData, citationData)
  const trends = useTrendsData(data, correlationData)
  const { periodDays } = trends
  const circulationControls = useCirculationControls()

  const { activeSection, registerSection, scrollToSection } = useTrendsSections(
    data?.ready,
    plate,
  )
  const totalDays = periodDays.length
  const missingDays = data
    ? Math.max(0, totalDays - data.summary.active_days)
    : 0
  const { activeCorrelationSection, scrollToCorrelationSection } =
    useCorrelationSections(analysis, correlationData?.ready, plate)

  const correlationCount = correlationData?.ready
    ? correlationData.summary.linked_events
    : null
  const vehicle = correlationData?.ready
    ? vehicleLine(correlationData.summary)
    : null
  const correlationPeriod = correlationData?.ready
    ? {
        start: correlationData.summary.first_seen,
        end: correlationData.summary.last_seen,
      }
    : undefined
  const profilePeriod =
    analysis === 'trends'
      ? data?.period || correlationPeriod
      : correlationPeriod || data?.period
  const ready = Boolean(data?.ready || correlationData?.ready)

  return (
    <section className="profile-shell">
      <ProfileTopBar
        plate={plate}
        vehicle={vehicle}
        onBack={onBack}
        onOpenTimeline={() => onOpenTimeline(null)}
        period={profilePeriod}
        disabled={!ready}
        timelineLabel="Timeline das correlações"
        onOpenPlate={onOpenPlate}
        report={
          <PlateReportsMenu
            plate={plate}
            scope={scopeQuery}
            correlationsReady={Boolean(correlationData?.ready)}
            linkedEvents={
              correlationData?.ready ? correlationData.summary.linked_events : 0
            }
          />
        }
      >
        <ProfileAnalysisTabs
          analysis={analysis}
          onChange={onAnalysisChange}
          correlationCount={correlationCount}
        />
      </ProfileTopBar>
      <EventScopeBar />

      {analysis === 'correlations' &&
        (correlationData?.ready && correlationData.summary.linked_events > 0 ? (
          <div className="profile-body">
            <ProfileIndexNav
              label="Seções da análise de correlações"
              sections={CORRELATION_SECTION_DEFS.map(({ id, label }) => ({
                id,
                label,
                badge: correlationSectionBadge(id, correlationData, indicators),
              }))}
              activeSection={activeCorrelationSection}
              onSelect={scrollToCorrelationSection}
            />
            <div className="profile-main">
              <CorrelationOverview
                plate={plate}
                data={correlationData}
                indicators={indicators}
              />
              <PlateCorrelationsView
                plate={plate}
                data={correlationData}
                error={correlationError}
                onOpenTimeline={onOpenTimeline}
                onOpenOccurrence={onOpenOccurrence}
                citations={citationData}
                denuncias={denunciaData}
              />
            </div>
          </div>
        ) : (
          <PlateCorrelationsView
            plate={plate}
            data={correlationData}
            error={correlationError}
            onOpenTimeline={onOpenTimeline}
            onOpenOccurrence={onOpenOccurrence}
            citations={citationData}
            denuncias={denunciaData}
          />
        ))}

      {analysis === 'trends' &&
        (data?.ready ? (
          <div className="profile-body">
            <ProfileIndexNav
              label="Seções das tendências de circulação"
              sections={SECTION_DEFS.map(({ id, label }) => ({
                id,
                label,
                badge: sectionBadge(id, data),
              }))}
              activeSection={activeSection}
              onSelect={(id) => scrollToSection(id as SectionId)}
              coverage={
                <div className="profile-coverage">
                  <span>Cobertura</span>
                  <strong>
                    {formatNumber(data.summary.active_days)}{' '}
                    <small>de {formatNumber(totalDays)} dias</small>
                  </strong>
                  <span className="profile-coverage-note">
                    {missingDays > 0
                      ? `${pluralize(missingDays, 'dia', 'dias')} sem nenhuma leitura de OCR no período.`
                      : 'Cobertura completa no período.'}
                  </span>
                </div>
              }
            />
            <div className="profile-main">
              <TrendsView
                plate={plate}
                readyData={data}
                trends={trends}
                controls={circulationControls}
                neighborhoodGeometry={neighborhoodGeometry}
                neighborhoodGeometryError={neighborhoodGeometryError}
                registerSection={registerSection}
                onOpenPlate={onOpenPlate}
              />
            </div>
          </div>
        ) : (
          <TrendsState
            plate={plate}
            data={data}
            error={error}
            onRetry={retry}
          />
        ))}
    </section>
  )
}
