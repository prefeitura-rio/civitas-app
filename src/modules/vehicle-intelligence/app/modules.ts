/**
 * O registro das telas do painel: de cada uma saem a rota (`routes.ts`), o item do menu (`sidebar.tsx`), o título e
 * o layout da casca (`app.tsx`) e o que acontece com ela na troca de recorte (`switchRecorte`). Os componentes de
 * cada tela ficam em `app.tsx`, num mapa com uma entrada por id daqui (o TypeScript cobra a que faltar).
 */
import {
  FileSearch,
  IdCard,
  LayoutDashboard,
  type LucideIcon,
  MapPinned,
  Network,
  Route as RouteIcon,
  UsersRound,
} from 'lucide-react'

import type { Route } from '@/modules/vehicle-intelligence/app/routes'
import {
  copassagem,
  recorte,
} from '@/modules/vehicle-intelligence/config/recortes'

export type ModuleId =
  | 'overview'
  | 'correlation'
  | 'post-event'
  | 'groups'
  | 'territories'
  | 'profile'
  | 'occurrence'

/** Como a casca dispõe a tela: o padrão, o perfil da placa (sem cabeçalho), a timeline (tela cheia) ou as listas. */
export type ShellLayout = 'default' | 'plate-profile' | 'timeline' | 'lists'

export interface AppModule {
  id: ModuleId
  /** O caminho da tela; os caminhos abaixo dele (`/groups/...`) são da mesma tela. */
  path: string
  /** O item do menu lateral. */
  label: string
  icon: LucideIcon
  /** O título do cabeçalho na rota (o perfil de um grupo ou território tem título próprio). */
  page: (route: Route) => { eyebrow: string; title: string }
  layout: (route: Route) => ShellLayout
  /** Na troca de recorte a tela continua aberta no outro; as demais voltam à visão geral. */
  keepsOnRecorteSwitch: boolean
}

const fixed = (eyebrow: string, title: string) => () => ({ eyebrow, title })

/** Na ordem do menu. */
export const MODULES: ReadonlyArray<AppModule> = [
  {
    id: 'overview',
    path: '/',
    label: 'Visão geral',
    icon: LayoutDashboard,
    page: fixed('SEGURANÇA PÚBLICA · INTELIGÊNCIA VEICULAR', recorte.title),
    layout: () => 'default',
    keepsOnRecorteSwitch: false,
  },
  {
    id: 'correlation',
    path: '/correlation',
    label: 'Placas correlatas',
    icon: Network,
    page: fixed(
      copassagem
        ? 'INVESTIGAÇÃO · PRÉ-EVENTO'
        : 'INVESTIGAÇÃO · ENTORNO DO FATO',
      'Placas correlatas',
    ),
    layout: () => 'default',
    keepsOnRecorteSwitch: true,
  },
  {
    id: 'post-event',
    path: '/post-event',
    label: 'Trajetória pós-evento',
    icon: RouteIcon,
    page: fixed(recorte.postEvent.eyebrow, recorte.postEvent.title),
    layout: () => 'default',
    keepsOnRecorteSwitch: true,
  },
  {
    id: 'groups',
    path: '/groups',
    label: 'Grupos',
    icon: UsersRound,
    page: (route) =>
      route.group
        ? { eyebrow: 'INVESTIGAÇÃO', title: 'Perfil do grupo' }
        : { eyebrow: 'INVESTIGAÇÃO', title: 'Grupos de suspeitas' },
    layout: (route) =>
      route.group?.view === 'timeline' ? 'timeline' : 'lists',
    keepsOnRecorteSwitch: false,
  },
  {
    id: 'territories',
    path: '/territories',
    label: 'Territórios',
    icon: MapPinned,
    page: (route) =>
      route.territory
        ? {
            eyebrow: 'INVESTIGAÇÃO · TERRITÓRIOS',
            title: 'Perfil do território',
          }
        : { eyebrow: 'INVESTIGAÇÃO', title: 'Territórios' },
    layout: () => 'lists',
    keepsOnRecorteSwitch: false,
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Perfil de placa',
    icon: IdCard,
    page: fixed('INVESTIGAÇÃO · CORRELAÇÕES E CIRCULAÇÃO', 'Perfil de placa'),
    layout: (route) =>
      route.plate?.view === 'timeline'
        ? 'timeline'
        : route.plate
          ? 'plate-profile'
          : 'default',
    keepsOnRecorteSwitch: true,
  },
  {
    id: 'occurrence',
    path: '/occurrence',
    label: 'Perfil do RO',
    icon: FileSearch,
    page: fixed(
      copassagem ? 'INVESTIGAÇÃO · RO E PLACA VÍTIMA' : 'INVESTIGAÇÃO · RO',
      'Perfil do RO',
    ),
    layout: () => 'lists',
    keepsOnRecorteSwitch: false,
  },
]

export const moduleById = (id: ModuleId) =>
  MODULES.find((module) => module.id === id)!

/** A tela de um caminho já normalizado (`/` e caminhos desconhecidos são a visão geral). */
export function moduleOfPath(path: string): ModuleId {
  const found = MODULES.find(
    (module) =>
      module.path !== '/' &&
      (path === module.path || path.startsWith(`${module.path}/`)),
  )
  return found?.id ?? 'overview'
}
