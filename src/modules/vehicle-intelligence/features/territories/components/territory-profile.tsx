/**
 * Perfil do território (redesign de 14/10, `design_handoff_perfil_territorio`): as motos de base no complexo numa tabela
 * com rolagem própria, filtro, busca e ordem; os grupos do território com um mini-grafo cada; os começos e fins de
 * leitura em abas, com a troca de moto logo abaixo da placa que parou; as possíveis trocas; quando agem (dia × hora, mês,
 * delegacias) e onde partem e desconectam perto do complexo. Etiquetas de placa = as do ranking (CERCO, CITADA NO
 * RELATO); placa sem citação e fora do Cerco não leva marca.
 */
import '@/modules/vehicle-intelligence/components/groups/groups.css'
import '@/modules/vehicle-intelligence/features/territories/territories.css'

import { Search } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { ErrorBanner } from '@/modules/vehicle-intelligence/components/error-banner'
import { Segments } from '@/modules/vehicle-intelligence/components/groups/controls'
import { PoleMap } from '@/modules/vehicle-intelligence/components/groups/group-map'
import { GroupTrends } from '@/modules/vehicle-intelligence/components/groups/group-trends'
import { MethodologyTerms } from '@/modules/vehicle-intelligence/components/groups/methodology-terms'
import { NotReadyPanel } from '@/modules/vehicle-intelligence/components/groups/not-ready-panel'
import { SectionNav } from '@/modules/vehicle-intelligence/components/groups/section-nav'
import {
  scrollToElement,
  useActiveSection,
} from '@/modules/vehicle-intelligence/components/groups/use-active-section'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import {
  territoryProfilePath,
  useTerritoryFilters,
} from '@/modules/vehicle-intelligence/features/territories/api'
import {
  baseStrength,
  type PlateFilter,
  type PlateSort,
  SORT_LABELS,
} from '@/modules/vehicle-intelligence/features/territories/components/profile/base-plates'
import { BasePlatesTable } from '@/modules/vehicle-intelligence/features/territories/components/profile/base-plates-table'
import { SuccessionsTable } from '@/modules/vehicle-intelligence/features/territories/components/profile/successions-table'
import { TerritoryActivity } from '@/modules/vehicle-intelligence/features/territories/components/profile/territory-activity'
import { TerritoryGroups } from '@/modules/vehicle-intelligence/features/territories/components/profile/territory-groups'
import { TerritoryHeader } from '@/modules/vehicle-intelligence/features/territories/components/profile/territory-header'
import { TerritoryKpis } from '@/modules/vehicle-intelligence/features/territories/components/profile/territory-kpis'
import type {
  TerritoryGroup,
  TerritoryMember,
  TerritoryProfileData,
} from '@/modules/vehicle-intelligence/features/territories/types'
import {
  ITEM,
  ITEMS,
  ITEMS_TITLE,
  SWAP_ITEM,
} from '@/modules/vehicle-intelligence/features/territories/vocabulary'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import {
  formatDecimal,
  formatNumber,
} from '@/modules/vehicle-intelligence/lib/format'

const SECTIONS = [
  ['plates', 'Placas'],
  ['groups', 'Grupos'],
  ['activity', 'Começos e fins'],
  ['successions', `Trocas de ${SWAP_ITEM}`],
  ['trends', 'Tendências'],
  ['map', 'Partidas e desconexões'],
] as const
type Section = (typeof SECTIONS)[number][0]
const SECTION_KEYS = SECTIONS.map(([key]) => key)
/** Os critérios do fim da página: [termo, chave da metodologia]. */
const METHODOLOGY_TERMS = [
  ['Base', 'base'],
  ['Em destaque', 'highlight'],
  ['Sem citação nem Cerco', 'new'],
  ['Vem de fora', 'outside'],
  ['Noturna', 'night'],
  ['Começos e fins', 'activity'],
  [`Troca de ${SWAP_ITEM}`, 'succession'],
] as const
const PLATE_COLOR = '#18c7dd'

export function TerritoryProfile({
  complex,
  onBack,
  onOpenPlate,
  onOpenGroup,
}: {
  complex: string
  onBack: () => void
  onOpenPlate: (plate: string) => void
  onOpenGroup: (plates: string[], label: string) => void
}) {
  const filters = useTerritoryFilters()
  const profilePath = territoryProfilePath(complex, filters)
  const profile = useApi<TerritoryProfileData>(profilePath)
  // Outro complexo ou outros filtros: o perfil anterior sai da tela enquanto o novo carrega.
  const data = profile.dataPath === profilePath ? profile.data : null
  const { error } = profile
  const [plateFilter, setPlateFilter] = useState<PlateFilter | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<PlateSort>('ranking')
  const isInCerco = useIsInCerco()
  const platesRef = useRef<HTMLElement>(null)
  const groupsRef = useRef<HTMLElement>(null)
  const activityRef = useRef<HTMLElement>(null)
  const successionsRef = useRef<HTMLElement>(null)
  const trendsRef = useRef<HTMLElement>(null)
  const mapRef = useRef<HTMLElement>(null)
  const refs = useMemo(
    () => ({
      plates: platesRef,
      groups: groupsRef,
      activity: activityRef,
      successions: successionsRef,
      trends: trendsRef,
      map: mapRef,
    }),
    [],
  )
  const section = useActiveSection(SECTION_KEYS, refs, Boolean(data?.ready))
  const members = useMemo(() => data?.members ?? [], [data])
  const highlighted = members.filter((m) => m.highlighted)
  const isKnown = (m: TerritoryMember) => m.cited || isInCerco(m.plate)
  const filterTests: Record<PlateFilter, (m: TerritoryMember) => boolean> = {
    priority: (m) => m.highlighted || isKnown(m),
    unmarked: (m) => m.highlighted && !isKnown(m),
    all: () => true,
  }
  const regionName = data?.recorte_region ?? 'região do recorte'
  // Sem placa em destaque, o padrão é "Todas" (como o interruptor antigo).
  const currentFilter: PlateFilter =
    plateFilter ?? (highlighted.length ? 'priority' : 'all')
  const term = search.trim().toUpperCase()
  const visibleMembers = useMemo(
    () =>
      members
        .filter(filterTests[currentFilter])
        .filter((m) => !term || m.plate.includes(term))
        .sort((a, b) =>
          sortKey === 'ranking'
            ? (a.rank ?? 1e9) - (b.rank ?? 1e9)
            : baseStrength(b) - baseStrength(a),
        ),
    // `filterTests` é recriado a cada render, mas só depende de `isInCerco`, que está na lista.
    // Dependências incompletas de propósito.
    [members, currentFilter, term, sortKey, isInCerco],
  )
  const membersByPlate = useMemo(
    () => new Map(members.map((m) => [m.plate, m])),
    [members],
  )
  const groupsByLabel = useMemo(
    () => new Map((data?.groups ?? []).map((g) => [g.label, g])),
    [data],
  )
  const openGroup = (group: TerritoryGroup) => {
    onOpenGroup(
      group.members.map((m) => m.plate),
      group.label,
    )
    window.scrollTo(0, 0)
  }
  const colors = useMemo(
    () => Object.fromEntries(members.map((m) => [m.plate, PLATE_COLOR])),
    [members],
  )
  const scrollToSection = (key: Section) =>
    scrollToElement(refs[key].current, 140)
  const territoryGroups = data?.groups ?? []
  // O corte vem da camada de rotinas (calibrado na troca simulada); nulo sem ela.
  const routineCut = data?.parameters?.succession_cut ?? null
  const mapData = useMemo(
    () =>
      data
        ? {
            members,
            points: data.points,
            events: data.events,
            territory: data.territory,
          }
        : null,
    [data, members],
  )

  return (
    <div className="groups-page group-profile">
      <TerritoryHeader
        complex={complex}
        data={data}
        regionName={regionName}
        onBack={onBack}
      />
      {error && <ErrorBanner message={error} />}
      {!data && !error && (
        <p role="status" className="groups-status">
          Carregando o território…
        </p>
      )}
      {data && !data.ready && (
        <NotReadyPanel reason={data.reason} buildCommand={data.build_command} />
      )}
      {data?.ready && (
        <>
          <TerritoryKpis
            data={data}
            members={members}
            highlightedCount={highlighted.length}
            unmarkedCount={members.filter(filterTests.unmarked).length}
            knownCount={members.filter(isKnown).length}
            regionName={regionName}
          />

          <SectionNav
            sections={SECTIONS}
            active={section}
            onSelect={scrollToSection}
          />

          <section ref={platesRef} className="groups-panel">
            <div className="panel-head">
              <div>
                <h2>{ITEMS_TITLE} de base</h2>
                <p>
                  {ITEMS_TITLE} que partem ou desconectam perto do complexo
                  acima da taxa das outras. Partidas e desconexões: quantos ROs
                  da {ITEM} caem aqui e quantas vezes a taxa das outras {ITEMS}.
                </p>
              </div>
              <div className="territory-controls">
                <Segments
                  label={`Filtro das ${ITEMS} de base`}
                  value={currentFilter}
                  onChange={setPlateFilter}
                  options={(
                    [
                      ['priority', 'Destaque, citadas ou Cerco'],
                      ['unmarked', 'Sem citação nem Cerco'],
                      ['all', 'Todas'],
                    ] as const
                  ).map(([value, text]) => ({
                    value,
                    label: text,
                    n: members.filter(filterTests[value]).length,
                  }))}
                />
                <label className="territory-search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Filtrar placa"
                    aria-label="Filtrar placa"
                    spellCheck={false}
                  />
                </label>
              </div>
            </div>
            <BasePlatesTable
              members={visibleMembers}
              sortKey={sortKey}
              onSortChange={setSortKey}
              groupsByLabel={groupsByLabel}
              regionName={regionName}
              onOpenPlate={onOpenPlate}
              onOpenGroup={openGroup}
            />
            <div className="list-footer">
              <span>
                {formatNumber(visibleMembers.length)} de{' '}
                {formatNumber(members.length)} {ITEMS} de base
              </span>
              <span>
                Ordem: {SORT_LABELS[sortKey]}. Clique no título da coluna para
                reordenar.
              </span>
            </div>
          </section>

          <section ref={groupsRef} className="groups-panel">
            <div className="panel-head">
              <div>
                <h2>
                  {territoryGroups.length === 1
                    ? '1 grupo'
                    : `${formatNumber(territoryGroups.length)} grupos`}
                </h2>
                <p>
                  Grupos que têm este complexo como célula ou alguma {ITEM} de
                  base aqui. Primeiro os de célula aqui; depois, os com mais
                  placas de base no complexo. Clique num grupo para abrir o
                  perfil.
                </p>
              </div>
            </div>
            {territoryGroups.length ? (
              <TerritoryGroups
                groups={territoryGroups}
                faction={data.faction ?? null}
                onOpen={openGroup}
              />
            ) : (
              <p className="list-empty">
                Nenhum grupo tem este complexo como célula nem {ITEM} de base
                aqui.
              </p>
            )}
          </section>

          <section ref={activityRef} className="groups-panel">
            <TerritoryActivity
              data={data}
              membersByPlate={membersByPlate}
              onOpenPlate={onOpenPlate}
            />
          </section>

          <section ref={successionsRef} className="groups-panel">
            <div className="panel-head">
              <div>
                <h2>Possíveis trocas de {SWAP_ITEM}</h2>
                <p className="wide">
                  Uma {ITEM} de base para de ser lida e outra começa logo
                  depois. Rotina: as últimas 8 semanas de quem parou contra as
                  primeiras 8 de quem começou (onde e quando são lidas, onde
                  começam e terminam o dia), descontando as rotinas genéricas.
                  {routineCut != null
                    ? ` Parecida a partir de ${formatDecimal(routineCut, 3, 3)}: o corte que deixa passar 1% das erradas numa troca simulada.`
                    : recorte.groups.hasRoutine
                      ? ' Sem a camada de rotinas, nenhuma conta como parecida.'
                      : ' A assinatura de rotina existe só para motos: aqui as trocas aparecem sem a semelhança, só pelas datas e pela mesma base.'}
                </p>
              </div>
            </div>
            {(data.successions ?? []).length === 0 ? (
              <p className="list-empty">
                Nenhuma placa de base parou de ser lida com outra começando logo
                depois.
              </p>
            ) : (
              <SuccessionsTable
                successions={data.successions ?? []}
                membersByPlate={membersByPlate}
                onOpenPlate={onOpenPlate}
              />
            )}
          </section>

          <section ref={trendsRef} className="groups-panel">
            <div className="groups-panel-head">
              <div>
                <h2>Tendências</h2>
                <p>
                  Os {formatNumber(data.events.length)} ROs em que alguma {ITEM}{' '}
                  de base partiu ou desconectou perto do complexo.
                </p>
              </div>
            </div>
            {data.trends && (
              <GroupTrends
                data={{ events: data.events, trends: data.trends }}
                togetherLabel={`Com 2+ ${ITEMS} de base`}
              />
            )}
          </section>

          <section ref={mapRef} className="groups-panel territory-section-map">
            <div className="groups-panel-head">
              <div>
                <h2>Partidas e desconexões perto do complexo</h2>
                <p className="wide">
                  Cada polo é uma câmera; o número é quantas partidas ou
                  desconexões das {ITEMS} de base caem ali. Não há câmera dentro
                  das comunidades: a leitura é na via de acesso.
                </p>
              </div>
            </div>
            {mapData && (
              <PoleMap
                key={complex}
                data={mapData}
                colors={colors}
                showPlateList={false}
                showSummary={false}
                footnote={`Partida: primeira leitura do dia do fato. Desconexão: último local antes de 8 h sem leitura. Só os pontos a até ${data.parameters?.radius_meters ?? 500} m do complexo.`}
              />
            )}
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
