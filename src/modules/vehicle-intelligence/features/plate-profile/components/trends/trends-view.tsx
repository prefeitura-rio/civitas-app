import {
  Activity,
  CalendarClock,
  Clock,
  Pause,
  Repeat,
  TriangleAlert,
  Users,
} from 'lucide-react'

import type { OpenSearchedPlate } from '@/modules/vehicle-intelligence/components/plate/plate-search'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import { RoutineNeighbors } from '@/modules/vehicle-intelligence/features/groups'
import { ProfileHeading } from '@/modules/vehicle-intelligence/features/plate-profile/components/layout/profile-heading'
import { CirculationSection } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-section'
import { DailySeriesChart } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/daily-series-chart'
import { GapsSection } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/gaps-section'
import { LocationSparklines } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/location-sparklines'
import { ProfileHeatmap } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/profile-heatmap'
import { ShiftRows } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/shift-rows'
import { TrendsKpis } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/trends-kpis'
import type { CirculationControls } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/use-circulation-controls'
import type { TrendsData } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/use-trends-data'
import type { ShiftKey } from '@/modules/vehicle-intelligence/features/plate-profile/shifts'
import type { RegisterSection } from '@/modules/vehicle-intelligence/features/plate-profile/use-active-section'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type {
  PlateProfileData,
  RioNeighborhoodGeometry,
} from '@/modules/vehicle-intelligence/types/domain'

/** As tendências de circulação com o perfil pronto: destaques e as seções do índice "Nesta análise". */
export function TrendsView({
  plate,
  readyData,
  trends,
  controls,
  neighborhoodGeometry,
  neighborhoodGeometryError,
  registerSection,
  onOpenPlate,
}: {
  plate: string
  readyData: PlateProfileData
  trends: TrendsData
  controls: CirculationControls
  neighborhoodGeometry: RioNeighborhoodGeometry | null
  neighborhoodGeometryError: string | null
  registerSection: RegisterSection
  onOpenPlate: OpenSearchedPlate
}) {
  const { periodDays, scopedOccurrenceDays, occurrenceIndices } = trends
  return (
    <>
      {recorte.readingsCoverageNote && (
        <p className="profile-view-caption">{recorte.readingsCoverageNote}</p>
      )}
      <TrendsKpis summary={readyData.summary} />

      <CirculationSection
        readyData={readyData}
        trends={trends}
        controls={controls}
        neighborhoodGeometry={neighborhoodGeometry}
        neighborhoodGeometryError={neighborhoodGeometryError}
        registerSection={registerSection}
      />

      <section
        className="profile-section"
        id="quando-circula"
        ref={registerSection('quando-circula')}
      >
        <ProfileHeading
          icon={Activity}
          title="Quando circula, dia a dia"
          description="Passagens por dia no período. As marcas verticais indicam dias com ocorrência vinculada à placa no recorte global. Um vale pode significar veículo parado ou ausência de leitura nos equipamentos."
        />
        <DailySeriesChart
          series={readyData.daily_series}
          occurrenceDays={scopedOccurrenceDays}
        />
      </section>

      <section
        className="profile-section"
        id="recorrencia"
        ref={registerSection('recorrencia')}
      >
        <ProfileHeading
          icon={Repeat}
          title="Recorrência por local"
          description="Volume diário nos seis pontos mais frequentes. Serve para separar um ponto de rotina, com linha contínua, de um ponto de passagem eventual, com picos isolados."
        />
        <LocationSparklines
          locations={readyData.top_locations}
          periodDays={periodDays}
          occurrenceIndices={occurrenceIndices}
        />
      </section>

      <div className="profile-duo-grid">
        <section
          className="profile-section profile-duo-card"
          id="rotina-semanal"
          ref={registerSection('rotina-semanal')}
        >
          <ProfileHeading
            icon={CalendarClock}
            title="Rotina semanal"
            description="Hora do dia na vertical, dia da semana na horizontal. Quanto mais intensa a célula, maior a movimentação."
          />
          <ProfileHeatmap matrix={readyData.weekday_hour_heatmap} />
        </section>
        <section
          className="profile-section profile-duo-card"
          id="turnos"
          ref={registerSection('turnos')}
        >
          <ProfileHeading
            icon={Clock}
            title="Turnos do dia"
            description="Distribuição das passagens entre os quatro turnos e o bairro dominante em cada um."
          />
          <ShiftRows
            totals={readyData.shift_totals}
            profiles={readyData.shift_profiles}
            predominant={readyData.summary.predominant_shift as ShiftKey | null}
          />
        </section>
      </div>

      <section
        className="profile-section"
        id="hiatos"
        ref={registerSection('hiatos')}
      >
        <ProfileHeading
          icon={Pause}
          title="Onde o carro para e retoma"
          description={`Intervalos de ${readyData.hiatos.min_hours} h ou mais sem nenhuma detecção. O último ponto antes indica onde a circulação encerra; o primeiro depois, onde retoma. ${formatNumber(readyData.hiatos.count)} hiatos no período.`}
        />
        <GapsSection gaps={readyData.hiatos} />
      </section>

      {recorte.groups.hasRoutine && (
        <section
          className="profile-section"
          id="rotina-parecida"
          ref={registerSection('rotina-parecida')}
        >
          <ProfileHeading
            icon={Users}
            title="Motos de rotina parecida"
            description="As motos cuja rotina mais se parece com a desta placa: onde e quando são lidas, onde começam e terminam o dia, o ritmo da semana. Rotina parecida não é ligação: os dias juntas, os ROs e a base, ao lado, dizem se vale investigar."
          />
          <RoutineNeighbors plates={[plate]} onOpenPlate={onOpenPlate} />
        </section>
      )}

      <p className="profile-disclaimer">
        <TriangleAlert size={14} />
        Ausência de detecção não prova ausência de passagem. O perfil reflete
        apenas leituras de OCR nos equipamentos disponíveis e não constitui
        prova de autoria.
      </p>
    </>
  )
}
