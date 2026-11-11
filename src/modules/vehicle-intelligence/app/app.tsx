import { RefreshCw } from 'lucide-react'
import { type ComponentType, lazy, Suspense, useEffect, useRef } from 'react'

import { AppHeader } from '@/modules/vehicle-intelligence/app/layout/app-header'
import {
  currentPath,
  groupLabelFromHistory,
  useAppNavigation,
  useScrollRestoration,
} from '@/modules/vehicle-intelligence/app/navigation'
import type { ModuleId } from '@/modules/vehicle-intelligence/app/routes'
import {
  copassagem,
  recorte,
} from '@/modules/vehicle-intelligence/config/recortes'
import { OverviewView } from '@/modules/vehicle-intelligence/features/overview/components/overview-view'
import { useDashboard } from '@/modules/vehicle-intelligence/features/overview/use-dashboard'

// Cada tela num pedaço próprio do build, carregado na primeira visita.
/** Pós-evento: trajetória do veículo vítima (copassagem) ou das placas citadas na dinâmica (entorno). */
const PostEventView = lazy<
  ComponentType<{ active: boolean; onOpenPlate: (plate: string) => void }>
>(() =>
  copassagem
    ? import(
        '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles-view'
      )
    : import(
        '@/modules/vehicle-intelligence/features/post-event/components/cited-plates-view'
      ),
)
const CorrelationView = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/correlations/components/correlation-view'
  ).then((module) => ({ default: module.CorrelationView })),
)
const CorrelationPlateProfile = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/plate-profile/components/plate-profile'
  ).then((module) => ({
    default: module.CorrelationPlateProfile,
  })),
)
const CorrelationPlateTimeline = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/plate-profile/components/plate-timeline'
  ).then((module) => ({
    default: module.CorrelationPlateTimeline,
  })),
)
const PlateProfileSearch = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/plate-profile/components/profile-ui'
  ).then((module) => ({ default: module.PlateProfileSearch })),
)
const GroupsView = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/groups/components/groups-view'
  ).then((module) => ({ default: module.GroupsView })),
)
const GroupProfile = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/groups/components/group-profile'
  ).then((module) => ({ default: module.GroupProfile })),
)
const GroupTimeline = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/groups/components/group-timeline'
  ).then((module) => ({ default: module.GroupTimeline })),
)
const TerritoriesView = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/territories/components/territories-view'
  ).then((module) => ({ default: module.TerritoriesView })),
)
const TerritoryProfile = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/territories/components/territory-profile'
  ).then((module) => ({
    default: module.TerritoryProfile,
  })),
)
const OccurrenceSearch = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-search'
  ).then((module) => ({
    default: module.OccurrenceSearch,
  })),
)
const OccurrencePage = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/occurrence-profile/components/occurrence-page'
  ).then((module) => ({
    default: module.OccurrencePage,
  })),
)

const PAGE_TITLES: Record<ModuleId, { eyebrow: string; title: string }> = {
  overview: {
    eyebrow: 'SEGURANÇA PÚBLICA · INTELIGÊNCIA VEICULAR',
    title: recorte.title,
  },
  correlation: {
    eyebrow: copassagem
      ? 'INVESTIGAÇÃO · PRÉ-EVENTO'
      : 'INVESTIGAÇÃO · ENTORNO DO FATO',
    title: 'Placas correlatas',
  },
  'post-event': copassagem
    ? {
        eyebrow: 'INVESTIGAÇÃO · PÓS-EVENTO',
        title:
          recorte.id === 'carga'
            ? 'Trajetórias após roubo de carga'
            : 'Trajetórias após subtração',
      }
    : {
        eyebrow: 'CIRCULAÇÃO · PLACAS CITADAS',
        title: 'Trajetória pós-evento',
      },
  profile: {
    eyebrow: 'INVESTIGAÇÃO · CORRELAÇÕES E CIRCULAÇÃO',
    title: 'Perfil de placa',
  },
  groups: { eyebrow: 'INVESTIGAÇÃO', title: 'Grupos de suspeitas' },
  territories: { eyebrow: 'INVESTIGAÇÃO', title: 'Territórios' },
  occurrence: {
    eyebrow: copassagem
      ? 'INVESTIGAÇÃO · RO E PLACA VÍTIMA'
      : 'INVESTIGAÇÃO · RO',
    title: 'Perfil do RO',
  },
}

function RouteLoading() {
  return (
    <div
      className="grid min-h-[50dvh] place-content-center justify-items-center gap-3 text-muted-foreground"
      role="status"
    >
      <RefreshCw
        className="animate-spin text-primary motion-reduce:animate-none"
        size={24}
      />
      <span className="text-xs">Carregando módulo…</span>
    </div>
  )
}

/**
 * A casca do painel: menu, cabeçalho e a tela da rota. Uma tela visitada fica montada (escondida) ao trocar de tela,
 * para voltar a ela com os filtros e a rolagem como estavam; perfis e timelines são montados só enquanto abertos.
 */
export function App() {
  const navigation = useAppNavigation()
  const { route } = navigation
  const active = route.module
  const visited = useRef(new Set<ModuleId>([active]))
  visited.current.add(active)
  const groupId = route.group?.id ?? null
  const territory = route.territory
  const occurrence = active === 'occurrence' ? route.occurrence : null
  const { data, error, loading } = useDashboard()
  const plate = active === 'profile' ? route.plate : null
  const isGroupTimeline =
    active === 'groups' && route.group?.view === 'timeline'
  const isTimeline = plate?.view === 'timeline' || isGroupTimeline
  const isProfilePage = plate?.view === 'profile'
  const mainRef = useRef<HTMLElement>(null)

  // A cada troca de tela, de placa ou de dia, o foco vai para o conteúdo (leitor de tela e teclado).
  const locationKey = `${active}:${plate?.plate ?? ''}:${plate?.view ?? ''}:${plate?.analysis ?? ''}:${plate?.day ?? ''}`
  const previousLocation = useRef(locationKey)
  useEffect(() => {
    if (previousLocation.current !== locationKey) {
      mainRef.current?.focus({ preventScroll: true })
      previousLocation.current = locationKey
    }
  }, [locationKey])
  useScrollRestoration(currentPath())

  const page =
    active === 'groups' && groupId
      ? { eyebrow: 'INVESTIGAÇÃO', title: 'Perfil do grupo' }
      : active === 'territories' && territory
        ? {
            eyebrow: 'INVESTIGAÇÃO · TERRITÓRIOS',
            title: 'Perfil do território',
          }
        : PAGE_TITLES[active]
  const shellClass = isTimeline ? 'app-shell timeline-open' : 'app-shell'
  const mainClass = isTimeline
    ? 'main-content correlation-timeline-main'
    : isProfilePage
      ? 'main-content correlation-profile-main'
      : 'main-content'
  const contentClass = isTimeline
    ? 'dashboard-content correlation-timeline-content'
    : isProfilePage
      ? 'dashboard-content correlation-profile-content'
      : active === 'groups' ||
          active === 'territories' ||
          active === 'occurrence'
        ? 'dashboard-content groups-content'
        : 'dashboard-content'

  return (
    <div className={shellClass}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          mainRef.current?.focus()
          mainRef.current?.scrollIntoView()
        }}
      >
        Pular para o conteúdo principal
      </a>
      <main id="main-content" ref={mainRef} tabIndex={-1} className={mainClass}>
        {!isTimeline && !isProfilePage && (
          <AppHeader
            eyebrow={page.eyebrow}
            title={page.title}
            loading={loading}
            period={
              data
                ? {
                    start: data.metadata.periodo_inicio,
                    end: data.metadata.periodo_fim,
                  }
                : undefined
            }
            onOpenPlate={navigation.openPlateHere}
          />
        )}
        <div className={contentClass}>
          {visited.current.has('overview') && (
            <div hidden={active !== 'overview'}>
              <OverviewView data={data} error={error} loading={loading} />
            </div>
          )}
          <Suspense fallback={<RouteLoading />}>
            {visited.current.has('correlation') && (
              <div hidden={active !== 'correlation'}>
                <CorrelationView
                  active={active === 'correlation'}
                  onOpenPlate={navigation.openCorrelationPlate}
                  onOpenOccurrence={navigation.openOccurrence}
                />
              </div>
            )}
            {visited.current.has('post-event') && (
              <div hidden={active !== 'post-event'}>
                <PostEventView
                  active={active === 'post-event'}
                  onOpenPlate={navigation.openPostEventPlate}
                />
              </div>
            )}
            {visited.current.has('groups') && (
              <div hidden={active !== 'groups' || Boolean(groupId)}>
                <GroupsView
                  active={active === 'groups' && !groupId}
                  onOpenGroup={navigation.openGroup}
                  onOpenPlate={navigation.openListedPlate}
                />
              </div>
            )}
            {active === 'groups' && route.group?.view === 'profile' && (
              <GroupProfile
                id={route.group.id}
                label={groupLabelFromHistory()}
                onBack={navigation.openGroups}
                onOpenPlate={navigation.openListedPlate}
                onOpenTimeline={(day) =>
                  navigation.openGroupTimeline(route.group!.id, day)
                }
              />
            )}
            {visited.current.has('territories') && (
              <div hidden={active !== 'territories' || Boolean(territory)}>
                <TerritoriesView
                  active={active === 'territories' && !territory}
                  onOpenTerritory={navigation.openTerritory}
                />
              </div>
            )}
            {active === 'territories' && territory && (
              <TerritoryProfile
                key={territory}
                complex={territory}
                onBack={navigation.openTerritories}
                onOpenPlate={navigation.openListedPlate}
                onOpenGroup={navigation.openGroup}
              />
            )}
            {visited.current.has('occurrence') && (
              <div hidden={active !== 'occurrence' || Boolean(occurrence)}>
                <OccurrenceSearch
                  active={active === 'occurrence' && !occurrence}
                  onOpen={navigation.openOccurrence}
                />
              </div>
            )}
            {occurrence && (
              <OccurrencePage
                key={occurrence}
                occurrenceKey={occurrence}
                onBack={navigation.backFromOccurrence}
                onOpenOccurrence={navigation.openOccurrence}
                onOpenPlate={navigation.openListedPlate}
              />
            )}
            {isGroupTimeline && route.group && (
              <GroupTimeline
                id={route.group.id}
                initialDay={route.group.day}
                label={groupLabelFromHistory()}
                onBack={() => navigation.backFromGroupTimeline(route.group!.id)}
              />
            )}
            {active === 'profile' &&
              (plate ? (
                plate.view === 'timeline' ? (
                  <CorrelationPlateTimeline
                    plate={plate.plate}
                    initialDay={plate.day}
                    onBack={() =>
                      navigation.backFromPlateTimeline(
                        plate.plate,
                        plate.analysis,
                      )
                    }
                  />
                ) : (
                  <CorrelationPlateProfile
                    plate={plate.plate}
                    analysis={plate.analysis}
                    onAnalysisChange={(analysis) =>
                      navigation.changePlateAnalysis(plate.plate, analysis)
                    }
                    onBack={navigation.backFromProfile}
                    onOpenTimeline={(day) =>
                      navigation.openPlateTimeline(
                        plate.plate,
                        plate.analysis,
                        day,
                      )
                    }
                    onOpenPlate={navigation.openPlateHere}
                    onOpenOccurrence={navigation.openOccurrence}
                  />
                )
              ) : (
                <PlateProfileSearch
                  onOpenPlate={(searched, analysis = 'correlations') =>
                    navigation.openPlate(searched, analysis, '/profile')
                  }
                />
              ))}
          </Suspense>
        </div>
      </main>
    </div>
  )
}
