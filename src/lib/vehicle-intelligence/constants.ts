/** Tela do módulo no catálogo de permissões do civitas-api (perfis Coordenador e Analista). */
export const VEHICLE_INTELLIGENCE_SCREEN_CODE = 'vehicle_intelligence'

/**
 * Libera as telas além de Placas correlatas e Perfil de placa (Visão geral, Trajetória pós-evento, Grupos, Territórios e
 * a busca de RO). Nenhum perfil a recebe por padrão; o Desenvolvedor tem todas as telas no civitas-api.
 */
export const VEHICLE_INTELLIGENCE_FULL_SCREEN_CODE = 'vehicle_intelligence_full'

/** Rota do módulo no civitas-app (no sidebar, dentro de Veículos). */
export const VEHICLE_INTELLIGENCE_BASE_PATH = '/inteligencia-veicular'

/** BFF do serviço civitas-inteligencia-veicular: `/api/bff-iv/<caminho da API>`. */
export const VEHICLE_INTELLIGENCE_BFF_PREFIX = '/api/bff-iv'
