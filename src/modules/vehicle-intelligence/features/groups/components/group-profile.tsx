/**
 * Perfil do grupo: membros, ligações entre eles (grafo interativo e pares), tendências (dia × hora, fatos por mês,
 * delegacias), o mapa de polos (partida, passagem junta, desconexão), os começos e fins de leitura com as trocas de moto
 * e os ROs com o relato. Abas fixas levam a cada seção; a timeline do grupo
 * abre pelo cabeçalho ou pela data de cada ocorrência.
 */
import '@/modules/vehicle-intelligence/components/groups/groups.css'

import { useEffect, useMemo, useRef, useState } from 'react'

import { ErrorBanner } from '@/modules/vehicle-intelligence/components/error-banner'
import { PoleMap } from '@/modules/vehicle-intelligence/components/groups/group-map'
import { GroupTrends } from '@/modules/vehicle-intelligence/components/groups/group-trends'
import { MethodologyTerms } from '@/modules/vehicle-intelligence/components/groups/methodology-terms'
import { NotReadyPanel } from '@/modules/vehicle-intelligence/components/groups/not-ready-panel'
import { plateColor } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { SectionNav } from '@/modules/vehicle-intelligence/components/groups/section-nav'
import {
  scrollToElement,
  useActiveSection,
} from '@/modules/vehicle-intelligence/components/groups/use-active-section'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import {
  groupLabel,
  groupProfilePath,
  platesFromGroupId,
  useGroupFilters,
} from '@/modules/vehicle-intelligence/features/groups/api'
import { GroupLinks } from '@/modules/vehicle-intelligence/features/groups/components/group-links'
import { EventsTable } from '@/modules/vehicle-intelligence/features/groups/components/profile/events-table'
import { GroupActivity } from '@/modules/vehicle-intelligence/features/groups/components/profile/group-activity'
import { GroupSummary } from '@/modules/vehicle-intelligence/features/groups/components/profile/group-summary'
import { MembersTable } from '@/modules/vehicle-intelligence/features/groups/components/profile/members-table'
import { GroupProfileHeader } from '@/modules/vehicle-intelligence/features/groups/components/profile/profile-header'
import { RoutineNeighbors } from '@/modules/vehicle-intelligence/features/groups/routines/routine-neighbors'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { GroupProfileData } from '@/modules/vehicle-intelligence/types/groups'

const ALL_SECTIONS = [
  ['members', 'Membros'],
  ['links', 'Ligações'],
  ['trends', 'Tendências'],
  ['territory', 'Território'],
  ['activity', 'Começos e fins'],
  ['routine', 'Rotina parecida'],
  ['events', 'Ocorrências'],
] as const
type Section = (typeof ALL_SECTIONS)[number][0]
// Rotina parecida: a assinatura de rotina existe só para motos (transeuntes).
const SECTIONS = ALL_SECTIONS.filter(
  ([key]) => key !== 'routine' || recorte.groups.hasRoutine,
)
const SECTION_KEYS = SECTIONS.map(([key]) => key)
/** Os critérios do fim da página: [termo, chave da metodologia]. */
const METHODOLOGY_TERMS = [
  ['Ligação forte', 'strong_link'],
  ['Acaso', 'chance'],
  ['Território', 'territory'],
] as const

export function GroupProfile({
  id,
  label,
  onBack,
  onOpenPlate,
  onOpenTimeline,
}: {
  id: string
  label?: string | null
  onBack: () => void
  onOpenPlate: (plate: string) => void
  onOpenTimeline: (day: string | null) => void
}) {
  const filters = useGroupFilters()
  const plates = useMemo(() => platesFromGroupId(id), [id])
  const profilePath = groupProfilePath(plates, filters)
  const profile = useApi<GroupProfileData>(profilePath)
  // Outro grupo ou outros filtros: o perfil anterior sai da tela enquanto o novo carrega.
  const data = profile.dataPath === profilePath ? profile.data : null
  const { error } = profile
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(
    label ?? null,
  )
  const membersRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLElement>(null)
  const activityRef = useRef<HTMLElement>(null)
  const trendsRef = useRef<HTMLElement>(null)
  const territoryRef = useRef<HTMLElement>(null)
  const routineRef = useRef<HTMLElement>(null)
  const eventsRef = useRef<HTMLElement>(null)
  const refs = useMemo(
    () => ({
      members: membersRef,
      links: linksRef,
      activity: activityRef,
      trends: trendsRef,
      territory: territoryRef,
      routine: routineRef,
      events: eventsRef,
    }),
    [],
  )
  useEffect(() => {
    // Aberto direto pelo link, o perfil acha o número do grupo (G1, G2…) na lista com os mesmos filtros.
    if (label) {
      setResolvedLabel(label)
      return
    }
    const controller = new AbortController()
    groupLabel(id, filters, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setResolvedLabel(value)
      })
      .catch(() => null)
    return () => controller.abort()
  }, [id, label, filters])
  const section = useActiveSection(SECTION_KEYS, refs, Boolean(data?.ready))
  const colors = useMemo(
    () =>
      Object.fromEntries(
        (data?.members ?? []).map((m, i) => [m.plate, plateColor(i)]),
      ),
    [data],
  )
  const scrollToSection = (key: Section) =>
    scrollToElement(refs[key].current, 140)
  const events = data?.events ?? []

  return (
    <div className="groups-page group-profile">
      <GroupProfileHeader
        label={resolvedLabel}
        plates={plates}
        data={data}
        colors={colors}
        onBack={onBack}
        onOpenTimeline={onOpenTimeline}
      />
      {error && <ErrorBanner message={error} />}
      {!data && !error && (
        <p role="status" className="groups-status">
          Carregando o perfil do grupo…
        </p>
      )}
      {data && !data.ready && (
        <NotReadyPanel reason={data.reason} buildCommand={data.build_command} />
      )}
      {data?.ready && (
        <>
          <GroupSummary data={data} />

          <SectionNav
            sections={SECTIONS}
            active={section}
            onSelect={scrollToSection}
          />

          <section ref={membersRef} className="groups-panel">
            <div className="groups-panel-head">
              <div>
                <h2>Membros</h2>
                <p>
                  Números do ranking Dias de circulação com os mesmos filtros. A
                  cor de cada placa é a mesma no mapa e na lista de ocorrências.
                </p>
              </div>
            </div>
            <MembersTable
              members={data.members}
              colors={colors}
              onOpenPlate={onOpenPlate}
            />
          </section>

          <section ref={linksRef} className="groups-panel">
            <div className="groups-panel-head">
              <div>
                <h2>Ligações</h2>
                <p>
                  Linha cheia: ligação forte, comboio no fato. Tracejada:
                  dividem RO sem ligação forte. Clique numa ligação ou placa
                  para ver a evidência; arraste as placas para reorganizar.
                </p>
              </div>
            </div>
            <GroupLinks
              key={data.id}
              members={data.members}
              edges={data.edges}
              colors={colors}
            />
          </section>

          <section ref={trendsRef} className="groups-panel">
            <div className="groups-panel-head">
              <div>
                <h2>Tendências</h2>
                <p>Quando e onde o grupo age.</p>
              </div>
            </div>
            <GroupTrends data={data} />
          </section>

          <section ref={territoryRef} className="groups-panel">
            <div className="groups-panel-head">
              <div>
                <h2>Território e circulação</h2>
                <p className="wide">
                  Onde o grupo começa o dia do fato, por onde passa junto perto
                  da hora do fato e onde as placas somem depois. Cada polo é uma
                  câmera; o número é a quantidade de leituras do grupo ali.
                </p>
              </div>
            </div>
            <PoleMap key={data.id} data={data} colors={colors} />
          </section>

          <section ref={activityRef} className="groups-panel">
            <GroupActivity data={data} onOpenPlate={onOpenPlate} />
          </section>

          {recorte.groups.hasRoutine && (
            <section ref={routineRef} className="groups-panel">
              <div className="groups-panel-head">
                <div>
                  <h2>Motos de rotina parecida</h2>
                  <p className="wide">
                    Motos de fora do grupo cuja rotina (onde e quando são lidas,
                    onde começam e terminam o dia, o ritmo da semana) mais se
                    parece com a de algum membro. Rotina parecida não é ligação:
                    os dias juntas, os ROs e a base dizem se vale investigar.
                  </p>
                </div>
              </div>
              <RoutineNeighbors
                key={data.id}
                plates={data.members.map((m) => m.plate)}
                forGroup
                onOpenPlate={onOpenPlate}
              />
            </section>
          )}

          <section ref={eventsRef} className="groups-panel">
            <div className="groups-panel-head">
              <div>
                <h2>{formatNumber(events.length)} ocorrências</h2>
                <p>
                  Em ordem de data. A evidência lista os pares do grupo que
                  passaram juntos perto do fato ou desconectaram juntos depois
                  {recorte.strategy === 'copassagem'
                    ? '; na copassagem, todas as placas do RO passaram com a vítima'
                    : ''}
                  . Clique na data para ver o dia na timeline.
                </p>
              </div>
            </div>
            <EventsTable
              events={events}
              colors={colors}
              plates={data.members.map((m) => m.plate)}
              onOpenDay={onOpenTimeline}
            />
          </section>

          {data.methodology && (
            <section className="groups-method">
              <div>
                <h2>Critérios</h2>
              </div>
              <MethodologyTerms
                terms={METHODOLOGY_TERMS}
                methodology={data.methodology}
              />
            </section>
          )}
        </>
      )}
    </div>
  )
}
