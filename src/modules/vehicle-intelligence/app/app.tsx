import { RefreshCw } from 'lucide-react'
import {
  type ComponentType,
  Fragment,
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useRef,
} from 'react'

import { AppHeader } from '@/modules/vehicle-intelligence/app/layout/app-header'
import {
  moduleById,
  type ModuleId,
  type ShellLayout,
} from '@/modules/vehicle-intelligence/app/modules'
import {
  type AppNavigation,
  currentPath,
  groupLabelFromHistory,
  useAppNavigation,
  useScrollRestoration,
} from '@/modules/vehicle-intelligence/app/navigation'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import { OverviewView } from '@/modules/vehicle-intelligence/features/overview/components/overview-view'
import { useDashboard } from '@/modules/vehicle-intelligence/features/overview/use-dashboard'
import type { OpenPlate } from '@/modules/vehicle-intelligence/types/navigation'

// Cada tela num pedaço próprio do build, carregado na primeira visita.
/** Pós-evento: trajetória do veículo vítima (copassagem) ou das placas citadas na dinâmica (entorno). */
const PostEventView = lazy<
  ComponentType<{ active: boolean; onOpenPlate: OpenPlate }>
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

/** As classes da casca em cada layout (`app.css`, `timeline.css`, `groups.css`). */
const SHELL_CLASSES: Record<
  ShellLayout,
  { shell: string; main: string; content: string }
> = {
  default: {
    shell: 'app-shell',
    main: 'main-content',
    content: 'dashboard-content',
  },
  'plate-profile': {
    shell: 'app-shell',
    main: 'main-content correlation-profile-main',
    content: 'dashboard-content correlation-profile-content',
  },
  timeline: {
    shell: 'app-shell timeline-open',
    main: 'main-content correlation-timeline-main',
    content: 'dashboard-content correlation-timeline-content',
  },
  lists: {
    shell: 'app-shell',
    main: 'main-content',
    content: 'dashboard-content groups-content',
  },
}

type ScreenContext = {
  navigation: AppNavigation
  active: ModuleId
  visited: Set<ModuleId>
}

/**
 * O que cada tela desenha na casca. A lista de uma tela visitada fica montada (escondida) ao trocar de tela, para
 * voltar a ela com os filtros e a rolagem como estavam; perfis e timelines são montados só enquanto abertos.
 */
const SCREENS: Record<ModuleId, (context: ScreenContext) => ReactNode> = {
  overview: () => null,
  correlation: ({ navigation, active, visited }) =>
    visited.has('correlation') && (
      <div hidden={active !== 'correlation'}>
        <CorrelationView
          active={active === 'correlation'}
          onOpenPlate={navigation.openPlate}
          onOpenOccurrence={navigation.openOccurrence}
        />
      </div>
    ),
  'post-event': ({ navigation, active, visited }) =>
    visited.has('post-event') && (
      <div hidden={active !== 'post-event'}>
        <PostEventView
          active={active === 'post-event'}
          onOpenPlate={navigation.openPlate}
        />
      </div>
    ),
  groups: ({ navigation, active, visited }) => {
    const { route } = navigation
    const group = active === 'groups' ? route.group : null
    return (
      <>
        {visited.has('groups') && (
          <div hidden={active !== 'groups' || Boolean(route.group)}>
            <GroupsView
              active={active === 'groups' && !route.group}
              onOpenGroup={navigation.openGroup}
              onOpenPlate={navigation.openPlate}
            />
          </div>
        )}
        {group?.view === 'profile' && (
          <GroupProfile
            id={group.id}
            label={groupLabelFromHistory()}
            onBack={navigation.openGroups}
            onOpenPlate={navigation.openPlate}
            onOpenTimeline={(day) =>
              navigation.openGroupTimeline(group.id, day)
            }
          />
        )}
        {group?.view === 'timeline' && (
          <GroupTimeline
            id={group.id}
            initialDay={group.day}
            label={groupLabelFromHistory()}
            onBack={() => navigation.backFromGroupTimeline(group.id)}
          />
        )}
      </>
    )
  },
  territories: ({ navigation, active, visited }) => {
    const territory = navigation.route.territory
    return (
      <>
        {visited.has('territories') && (
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
            onOpenPlate={navigation.openPlate}
            onOpenGroup={navigation.openGroup}
          />
        )}
      </>
    )
  },
  profile: ({ navigation, active }) => {
    if (active !== 'profile') return null
    const plate = navigation.route.plate
    if (!plate) return <PlateProfileSearch onOpenPlate={navigation.openPlate} />
    return plate.view === 'timeline' ? (
      <CorrelationPlateTimeline
        plate={plate.plate}
        initialDay={plate.day}
        onBack={() =>
          navigation.backFromPlateTimeline(plate.plate, plate.analysis)
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
          navigation.openPlateTimeline(plate.plate, plate.analysis, day)
        }
        onOpenPlate={navigation.openPlate}
        onOpenOccurrence={navigation.openOccurrence}
      />
    )
  },
  occurrence: ({ navigation, active, visited }) => {
    const occurrence =
      active === 'occurrence' ? navigation.route.occurrence : null
    return (
      <>
        {visited.has('occurrence') && (
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
            onOpenPlate={navigation.openPlate}
          />
        )}
      </>
    )
  },
}

/** A ordem das telas na casca; a visão geral vem antes, fora do `Suspense` (está no pacote principal). */
const SCREEN_ORDER: ModuleId[] = [
  'correlation',
  'post-event',
  'groups',
  'territories',
  'occurrence',
  'profile',
]

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

/** A casca do painel: menu, cabeçalho e a tela da rota (`SCREENS`). */
export function App() {
  const navigation = useAppNavigation()
  const { route } = navigation
  const active = route.module
  const visited = useRef(new Set<ModuleId>([active]))
  visited.current.add(active)
  const { data, error, loading } = useDashboard()
  const plate = active === 'profile' ? route.plate : null
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

  // `screen`, não `module`: o Next reserva o nome (@next/next/no-assign-module-variable).
  const screen = moduleById(active)
  const layout = screen.layout(route)
  const page = screen.page(route)
  const classes = SHELL_CLASSES[layout]
  const context: ScreenContext = {
    navigation,
    active,
    visited: visited.current,
  }

  return (
    <div className={classes.shell}>
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
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className={classes.main}
      >
        {layout !== 'timeline' && layout !== 'plate-profile' && (
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
            onOpenPlate={navigation.openPlate}
          />
        )}
        <div className={classes.content}>
          {visited.current.has('overview') && (
            <div hidden={active !== 'overview'}>
              <OverviewView data={data} error={error} loading={loading} />
            </div>
          )}
          <Suspense fallback={<RouteLoading />}>
            {SCREEN_ORDER.map((id) => (
              <Fragment key={id}>{SCREENS[id](context)}</Fragment>
            ))}
          </Suspense>
        </div>
      </main>
    </div>
  )
}
