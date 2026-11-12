/**
 * Recorte ativo do painel unificado.
 *
 * O recorte vem do parâmetro `?recorte=` e define qual motor responde às
 * chamadas `/api/v1/...` do módulo carregado: elas viram `/api/<recorte>/v1/...`.
 * Trocar de recorte recarrega a página, para que filtros, sessões e estilos
 * de um recorte nunca vazem para outro.
 */

import {
  serviceUrl,
  toAppPath,
  toRoutePath,
} from '@/modules/vehicle-intelligence/app/base-path'

export type RecorteId = 'transeuntes' | 'veiculos' | 'carga'
/** Como o motor liga placas a fatos: leituras no entorno do fato ou passagens junto à placa vítima. */
export type Strategy = 'entorno_fato' | 'copassagem'

export interface Recorte {
  id: RecorteId
  label: string
  title: string
  /** Subtítulo da marca no menu lateral. */
  brand: string
  strategy: Strategy
  /** Selo do cabeçalho com a base do recorte ("Zona Sul · Motos · 2026"). */
  badge?: string
  /** O motor publica o relato (dinâmica) das ocorrências. */
  hasDynamics: boolean
  /** O motor confere os ROs que citam a placa no relato (`/pre-event/citations`). */
  hasCitations: boolean
  /** Ressalva de cobertura das leituras, mostrada no perfil da placa. */
  readingsCoverageNote?: string
  /** Grupos e territórios (camada `pipeline.derivados grupos --recorte <id>`): vocabulário e padrões da tela do recorte. */
  groups: GroupsConfig
  /** Relatório geral do motor (`/reports/general`): nome do arquivo e textos do botão. */
  report?: ReportConfig
}

export interface ReportConfig {
  fileName: string
  buttonLabel: string
  description: string
  rankingStage: string
}

/**
 * O que muda entre os recortes nas páginas de grupos e territórios. Transeuntes: motos (a camada é só delas), ligação
 * de comboio (juntas no fato e desconexão conjunta). Veículos e carga: placas de qualquer tipo, ligação por ROs em comum
 * (regra simples pedida em 15/10) e mínimos menores, porque as placas têm de 2 a 14 ROs (`analise/grupos.py`, `REGRAS`).
 */
export interface GroupsConfig {
  /** "moto"/"motos" ou "placa"/"placas" nos textos. */
  item: string
  items: string
  /** "moto" ou "veículo": "Troca de moto", "Possíveis trocas de veículo". */
  swapItem: string
  /** A camada só tem motos: as consultas mandam `veiculo=MOTO`. */
  motorcyclesOnly: boolean
  /** Assinatura de rotina (rotina parecida e semelhança das trocas): só motos. */
  hasRoutine: boolean
  seeds: number
  minimumSeedEvents: number
  minimumOptions: number[]
  /** Destaque dos territórios: [corte do ranking, mínimo de ocorrências]; o primeiro é o padrão. */
  highlights: Array<[number, number]>
  /** A regra da ligação forte, para a introdução da página, a legenda da ordem e o filtro "Ligação". */
  intro: string
  orderNote: string
  linkRules: Array<[string, string]>
}

const COPASSAGEM_GROUPS: Omit<
  GroupsConfig,
  'minimumSeedEvents' | 'minimumOptions' | 'highlights'
> = {
  item: 'placa',
  items: 'placas',
  swapItem: 'veículo',
  motorcyclesOnly: false,
  hasRoutine: false,
  seeds: 200,
  intro:
    'Placas correlatas que dividem 3 ou mais ROs, quase sempre de vítimas e dias diferentes. Os grupos partem das primeiras placas do ranking Dias de circulação.',
  orderNote:
    'Ordenados pela força: a soma dos ROs em comum das ligações fortes.',
  linkRules: [
    ['padrao', '3+ ROs em comum'],
    ['estrito', '4+ ROs em comum'],
  ] as Array<[string, string]>,
}

export const RECORTES: ReadonlyArray<Recorte> = [
  {
    id: 'transeuntes',
    label: 'Transeuntes',
    title: 'Roubos e furtos a transeuntes',
    brand: 'Roubos a transeuntes',
    strategy: 'entorno_fato',
    badge: 'Zona Sul · Motos · 2026',
    hasDynamics: true,
    hasCitations: true,
    groups: {
      item: 'moto',
      items: 'motos',
      swapItem: 'moto',
      motorcyclesOnly: true,
      hasRoutine: true,
      seeds: 200,
      minimumSeedEvents: 10,
      minimumOptions: [5, 10, 15, 20],
      highlights: [
        [500, 5],
        [300, 5],
        [300, 10],
        [200, 10],
      ],
      intro:
        'Placas que passam juntas perto da hora do fato e desconectam juntas depois, quase sem andar juntas em outros dias. Os grupos partem das primeiras placas do ranking Dias de circulação.',
      orderNote:
        'Ordenados pela força: passagens juntas no fato somadas às desconexões juntas.',
      linkRules: [
        ['padrao', 'Padrão'],
        ['estrito', 'Estrita (com desconexão)'],
      ],
    },
    report: {
      fileName: 'relatorio_transeuntes_motos',
      buttonLabel: 'Gerar relatório de transeuntes',
      rankingStage: 'Calculando os rankings Top 50',
      description:
        'Motos suspeitas (sem táxis ativos) ligadas a pelo menos 10 ocorrências: as 50 primeiras no ranking geral e em dias de circulação, em HTML e PDF. A geração continua mesmo se você fechar este menu.',
    },
  },
  {
    id: 'veiculos',
    label: 'Veículos',
    title: 'Roubos e furtos de veículos',
    brand: 'Inteligência veicular',
    strategy: 'copassagem',
    hasDynamics: false,
    hasCitations: false,
    groups: {
      ...COPASSAGEM_GROUPS,
      minimumSeedEvents: 4,
      minimumOptions: [3, 4, 5, 6],
      highlights: [
        [500, 4],
        [300, 4],
        [500, 3],
        [200, 5],
      ],
    },
    report: {
      fileName: 'relatorio_top15_correlacoes',
      buttonLabel: 'Gerar relatório de veículos',
      rankingStage: 'Calculando os 15 rankings',
      description:
        'Os 15 rankings do snapshot publicado, em HTML e PDF. A geração continua mesmo se você fechar este menu.',
    },
  },
  {
    id: 'carga',
    label: 'Carga',
    title: 'Roubo de carga',
    brand: 'Roubo de carga',
    strategy: 'copassagem',
    hasDynamics: true,
    hasCitations: false,
    groups: {
      ...COPASSAGEM_GROUPS,
      minimumSeedEvents: 3,
      minimumOptions: [2, 3, 4, 5],
      highlights: [
        [300, 3],
        [200, 3],
        [500, 2],
        [100, 4],
      ],
    },
    readingsCoverageNote:
      'Leituras de 2026 até 27/09. A partir de 16/09, a cobertura está restrita às placas consultadas; ausência de leitura não confirma ausência de circulação.',
    report: {
      fileName: 'relatorio_roubo_carga',
      buttonLabel: 'Gerar relatório de carga',
      rankingStage: 'Calculando os rankings Top 20',
      description:
        'Dois recortes de placas Top 20: sem táxis ativos e suspeitas de moto. Cada um traz rankings por proximidade e cobertura. A geração continua mesmo se você fechar este menu.',
    },
  },
]

/** O último recorte escolhido nesta aba: os links do sidebar do CIVITAS não levam o `?recorte=`. */
const RECORTE_SESSION_KEY = 'civitas:vehicle-intelligence:recorte'

function knownRecorte(value: string | null): RecorteId | undefined {
  return RECORTES.find((item) => item.id === value)?.id
}

function storedRecorte(): string | null {
  try {
    return window.sessionStorage.getItem(RECORTE_SESSION_KEY)
  } catch {
    return null
  }
}

function rememberRecorte(id: RecorteId): void {
  try {
    window.sessionStorage.setItem(RECORTE_SESSION_KEY, id)
  } catch {
    // Sem sessionStorage (modo privado restrito), o recorte só não é lembrado entre as telas.
  }
}

/** O recorte da URL (`?recorte=`); sem ele, o último escolhido nesta aba; sem nenhum, transeuntes. */
function recorteFromUrl(): RecorteId {
  const requested = knownRecorte(
    new URLSearchParams(window.location.search).get('recorte'),
  )
  if (requested) {
    rememberRecorte(requested)
    return requested
  }
  return knownRecorte(storedRecorte()) ?? 'transeuntes'
}

export const recorteAtual: RecorteId = recorteFromUrl()
export const recorte: Recorte = RECORTES.find(
  (item) => item.id === recorteAtual,
)!
export const copassagem = recorte.strategy === 'copassagem'

/** Converte `/api/v1/...` no caminho do motor do recorte ativo, e a URL final passa pelo BFF (`serviceUrl`). */
export function recorteApiPath(path: string): string {
  return serviceUrl(
    path.startsWith('/api/v1/') ? `/api/${recorteAtual}${path.slice(4)}` : path,
  )
}

/** Chave de armazenamento do navegador isolada por recorte. */
export function recorteStorageKey(key: string): string {
  return `civitas:${recorteAtual}:${key}`
}

export function switchRecorte(target: RecorteId): void {
  if (target === recorteAtual) return
  // A placa aberta continua aberta no outro recorte; as demais telas voltam
  // ao início do módulo equivalente.
  const pathname = toRoutePath(window.location.pathname)
  const plateMatch = pathname.match(/^\/profile\/([A-Za-z0-9]{3,8})/)
  const route = plateMatch
    ? `/profile/${plateMatch[1].toUpperCase()}/correlations`
    : (['/correlation', '/post-event', '/profile'].find((item) =>
        pathname.startsWith(item),
      ) ?? '/')
  rememberRecorte(target)
  window.location.assign(`${toAppPath(route)}?recorte=${target}`)
}
