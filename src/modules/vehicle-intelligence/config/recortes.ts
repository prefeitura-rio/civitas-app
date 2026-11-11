/**
 * Recorte ativo do painel unificado, e o que muda entre os recortes (dados, não lógica).
 *
 * O recorte vem do parâmetro `?recorte=` e define qual motor responde às
 * chamadas `/api/v1/...` do módulo carregado: elas viram `/api/<recorte>/v1/...`.
 * Trocar de recorte recarrega a página, para que filtros, sessões e estilos
 * de um recorte nunca vazem para outro.
 */
import { serviceUrl } from '@/modules/vehicle-intelligence/app/base-path'
import type { CrimeType } from '@/modules/vehicle-intelligence/types/domain'

export type RecorteId =
  | 'transeuntes'
  | 'veiculos'
  | 'carga'
  | 'transeuntes_cidade'
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
  /** Recorte em teste: o menu e o cabeçalho o marcam como experimental. */
  experimental?: boolean
  /**
   * As duas modalidades dos fatos, na ordem do padrão dos filtros. A primeira é a principal: vermelho nos mapas do
   * pós-evento; a segunda, âmbar.
   */
  modalities: readonly [CrimeType, CrimeType]
  /** O filtro do tipo do fato no trilho do grafo: rótulo e, quando precisa, a ajuda. */
  modalityField: { label: string; help?: string }
  /** O alvo do fato (o que foi levado): o filtro do trilho, a palavra na contagem ("2 alvos") e as escolhas fixas. */
  target: { label: string; help: string; noun: string; fixedChoices?: string[] }
  /** Copassagem: como as telas falam da placa vítima (no roubo de carga, a vítima é a carga e o veículo). */
  victim?: VictimTexts
  /** O título da tela de pós-evento e, na copassagem, os textos das trajetórias do veículo vítima. */
  postEvent: { eyebrow: string; title: string; trajectories?: TrajectoryTexts }
  /** Ajuda da janela de tempo no trilho do grafo, quando a da estratégia não serve (o horário vem de outra fonte). */
  windowHelp?: string
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

export interface VictimTexts {
  /** Filtro de situação da placa: a correlata que também é vítima. */
  alsoVictimLabel: string
  /** Indicador do perfil: a placa "já registrada como vítima de subtração". */
  alsoVictimText: string
  /** Ajuda da data em que a correlata foi subtraída, no ranking. */
  stolenHelp: string
  /** Ajuda do mínimo de vítimas e da distância do radar ao fato, no trilho do grafo. */
  minimumVictimsHelp: string
  factDistanceHelp: string
}

export interface TrajectoryTexts {
  hero: string
  /** "veículos vítimas", "veículos subtraídos". */
  vehicles: string
  /** A unidade contada: "fatos" ou "vínculos RO–placa". */
  unit: string
  /** As duas modalidades de origem juntas: "roubo e furto", "carga e carga + veículo". */
  modalities: string
  destination: string
  destinationNote: string
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

const TRANSEUNTES_GROUPS: GroupsConfig = {
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
}

const VEHICLE_TARGET = { noun: 'categoria' }

/**
 * Modo experimental (o recorte "Transeuntes · cidade", do banco experimental): desligado em 11/11/2026, a pedido
 * ("tirar por enquanto toda a parte experimental"). A definição do recorte e as telas dele ficam no código; desligado,
 * ele sai do seletor de recorte, da busca de placas e do `?recorte=`. Para religar: `true` aqui (e `npm run build`) e
 * `CIVITAS_EXPERIMENTAL=1` ao subir o painel (`servidor/banco.py`).
 */
export const MODO_EXPERIMENTAL = false

const TODOS_OS_RECORTES: ReadonlyArray<Recorte> = [
  {
    id: 'transeuntes',
    label: 'Transeuntes',
    title: 'Roubos e furtos a transeuntes',
    brand: 'Roubos a transeuntes',
    strategy: 'entorno_fato',
    badge: 'Zona Sul · Motos · 2026',
    modalities: ['ROUBO', 'FURTO'],
    modalityField: { label: 'Tipo do fato' },
    target: {
      label: 'Alvo',
      help: 'Aparelho celular ou pertences do transeunte.',
      noun: 'alvo',
      fixedChoices: ['CELULAR', 'TRANSEUNTE', 'OUTROS'],
    },
    postEvent: {
      eyebrow: 'CIRCULAÇÃO · PLACAS CITADAS',
      title: 'Trajetória pós-evento',
    },
    hasDynamics: true,
    hasCitations: true,
    groups: TRANSEUNTES_GROUPS,
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
    modalities: ['ROUBO', 'FURTO'],
    modalityField: { label: 'Tipo do fato' },
    target: {
      ...VEHICLE_TARGET,
      label: 'Veículo subtraído',
      help: 'Categoria do veículo roubado ou furtado.',
    },
    victim: {
      alsoVictimLabel: 'Também subtraída',
      alsoVictimText: 'já registrada como vítima de subtração',
      stolenHelp:
        'Data e hora em que a própria placa correlata foi registrada como roubada ou furtada.',
      minimumVictimsHelp:
        'Quantidade mínima de veículos roubados ou furtados relacionados à placa encontrada.',
      factDistanceHelp:
        'Distância entre o radar que leu a placa vítima e o local do roubo ou furto.',
    },
    postEvent: {
      eyebrow: 'INVESTIGAÇÃO · PÓS-EVENTO',
      title: 'Trajetórias após subtração',
      trajectories: {
        hero: 'Roubo, furto e desconexão são apresentados como polos. A cor indica o papel; a área do círculo é proporcional ao número de ocorrências.',
        vehicles: 'veículos subtraídos',
        unit: 'fatos',
        modalities: 'roubo e furto',
        destination: 'Polo de desconexão · vários radares',
        destinationNote: '',
      },
    },
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
    modalities: ['CARGA_VEICULO', 'CARGA'],
    modalityField: {
      label: 'Categoria da carga',
      help: 'A categoria “Carga subtraída” inclui classificação automática pendente de revisão.',
    },
    target: {
      ...VEHICLE_TARGET,
      label: 'Veículo da carga',
      help: 'Categoria do veículo associado à carga.',
    },
    victim: {
      alsoVictimLabel: 'Também vítima de carga',
      alsoVictimText: 'também consta como vítima neste recorte de carga',
      stolenHelp:
        'Data e hora em que o veículo da placa correlata foi registrado como subtraído junto com a carga.',
      minimumVictimsHelp:
        'Quantidade mínima de veículos vítimas de carga relacionados à placa encontrada.',
      factDistanceHelp:
        'Distância entre o radar que leu a placa vítima e o local do roubo de carga.',
    },
    postEvent: {
      eyebrow: 'INVESTIGAÇÃO · PÓS-EVENTO',
      title: 'Trajetórias após roubo de carga',
      trajectories: {
        hero: 'Os polos de origem são separados por categoria. Os polos de desconexão reúnem as duas categorias e mostram as contagens de cada uma no popup. Na carga subtraída, o deslocamento pode ser a vítima seguindo viagem; a última leitura não confirma abandono ou descarga.',
        vehicles: 'veículos vítimas',
        unit: 'vínculos RO–placa',
        modalities: 'carga e carga + veículo',
        destination: 'Polo de desconexão · ambas as categorias',
        destinationNote:
          ' O popup mostra quantas desconexões vêm de cada categoria.',
      },
    },
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
  {
    // Experimental (09/11/2026): a cidade com os ROs do ISP, sem relato (Zona Sul em 10/11; a cidade toda desde 11/11). Sem
    // dinâmica, placas citadas e deslocamento do autor; o horário é o do registro (`pipeline/ocorrencias/transeuntes_cidade.py`).
    id: 'transeuntes_cidade',
    label: 'Transeuntes · cidade',
    title: 'Roubos e furtos a transeuntes na cidade',
    brand: 'Transeuntes na cidade',
    strategy: 'entorno_fato',
    badge: 'Cidade · ISP · Experimental',
    experimental: true,
    modalities: ['ROUBO', 'FURTO'],
    modalityField: { label: 'Tipo do fato' },
    target: {
      label: 'Alvo',
      help: 'Aparelho celular ou pertences do transeunte.',
      noun: 'alvo',
      fixedChoices: ['CELULAR', 'TRANSEUNTE'],
    },
    postEvent: {
      eyebrow: 'CIRCULAÇÃO · PLACAS CITADAS',
      title: 'Trajetória pós-evento',
    },
    windowHelp:
      'Intervalo antes e depois do horário do registro no ISP (sem revisão pelo relato). Grafo e ranking usam esta janela; o ranking considera todas as associações elegíveis, mesmo fora da visualização.',
    hasDynamics: false,
    // Sem relato no ISP, mas a etiqueta é da placa: os ROs revisados de outros recortes que a citam (`analise.autoria`).
    hasCitations: true,
    groups: TRANSEUNTES_GROUPS,
  },
]

/** Os recortes que o painel oferece: os experimentais só com o modo experimental ligado. */
export const RECORTES: ReadonlyArray<Recorte> = TODOS_OS_RECORTES.filter(
  (item) => MODO_EXPERIMENTAL || !item.experimental,
)

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

/** Guarda o recorte desta aba (a troca de recorte em `app/navigation.ts` também chama). */
export function rememberRecorte(id: RecorteId): void {
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
