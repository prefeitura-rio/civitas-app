/**
 * O módulo mora em `/inteligencia-veicular` no civitas-app. As rotas internas (`routes.ts`) continuam relativas
 * ("/", "/groups", "/profile/ABC1D23"); estas funções as levam para a URL e de volta. As chamadas à API passam pelo
 * BFF `/api/bff-iv`, que confere a sessão e a permissão da tela.
 */
import {
  VEHICLE_INTELLIGENCE_BASE_PATH,
  VEHICLE_INTELLIGENCE_BFF_PREFIX,
} from '@/lib/vehicle-intelligence/constants'

export const BASE_PATH = VEHICLE_INTELLIGENCE_BASE_PATH

/** Arquivos estáticos do módulo (em `public/vehicle-intelligence/`). */
const STATIC_PREFIX = '/vehicle-intelligence'

/** "/groups" → "/inteligencia-veicular/groups"; "/" → "/inteligencia-veicular". */
export function toAppPath(routePath: string): string {
  return routePath === '/' ? BASE_PATH : `${BASE_PATH}${routePath}`
}

/** "/inteligencia-veicular/groups" → "/groups"; a raiz do módulo (ou um caminho de fora dele) → "/". */
export function toRoutePath(pathname: string): string {
  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) return '/'
  return pathname.startsWith(`${BASE_PATH}/`)
    ? pathname.slice(BASE_PATH.length)
    : '/'
}

/** A URL de um recurso do servidor do módulo: a API (`/api/...`) e os tiles (`/tiles/...`) pelo BFF; `/data/...` estático. */
export function serviceUrl(path: string): string {
  if (path.startsWith('/api/') || path.startsWith('/tiles/')) {
    return `${VEHICLE_INTELLIGENCE_BFF_PREFIX}${path}`
  }
  if (path.startsWith('/data/')) return `${STATIC_PREFIX}${path}`
  return path
}
