/**
 * Origem da placa: o estado (UF) que emitiu a placa, pelas três primeiras letras.
 *
 * Cada UF recebe faixas de sequências de três letras (Senatran/Denatran) e a placa Mercosul continua nelas: ABC1D23
 * é da mesma faixa que ABC-1234. A placa não muda quando o veículo troca de estado, então isto é onde ela foi emitida,
 * não o registro atual (frota de locadora emplacada em MG ou no PR, motos da Mottu no PR, circulam no Rio).
 *
 * Tabela conferida em 15/10/2026, cruzando três fontes e as leituras do Rio:
 * - W: Wikipédia PT, "Placas de identificação de veículos no Brasil", revisão de 04/04/2026 (a última com a tabela
 *   completa, com o mês de início de cada faixa), igual à Wikipédia EN de 01/2026 nas faixas em comum;
 * - F: placafipe.com/placas-por-estado (2026): faixas mais novas, vistas em placas, que a Wikipédia ainda não tinha.
 * - Divergências: TNA–TNC e TNE–TNG (BA pelas Wikipédias, que dão AL a partir de TNH; AL pelo Placa FIPE) e REX (MS pelas
 *   Wikipédias; DF pelo Placa FIPE) ficam com a UF da Wikipédia e a outra como alternativa. SAV: 0001 a 1000 (0A01 a 1A00)
 *   foi de SP, o resto do CE (Wikipédia EN).
 * - Sem UF: séries que nenhuma fonte dá a um estado (as retidas no Senatran e as que ainda não foram distribuídas). Placa
 *   lida numa delas é provável erro de leitura (OCR), placa adulterada ou série nova ainda não mapeada.
 */

import ranges from './plate-origin-ranges.json'

/** [início, fim, UF, em uso desde (mês/ano), fonte, UF alternativa quando as fontes divergem]. A tabela fica em
 * `plate-origin-ranges.json`, a mesma que a montagem do banco lê (`pipeline/construir.py`, colunas `origem_*` da
 * tabela `placas`). */
type SeriesRange = readonly [
  string,
  string,
  string,
  string | null,
  'W' | 'F',
  string?,
]

const RANGES = ranges.faixas as unknown as readonly SeriesRange[]

export const UF_NAMES: Record<string, string> = ranges.nomes_uf

/** UF das câmeras dos três recortes: placa de outra UF ganha destaque. */
export const LOCAL_UF = ranges.uf_local

const SOURCES: Record<SeriesRange[4], string> = ranges.fontes

export interface PlateOrigin {
  /** "uf": a faixa é de um estado; "divergente": as fontes discordam (`uf` é a mais provável); "sem-uf": série de nenhum
   * estado; "fora-do-padrao": não é placa brasileira (antiga ABC1234 ou Mercosul ABC1D23). Os mesmos valores da
   * coluna `origem_tipo` do banco. */
  kind: 'uf' | 'divergente' | 'sem-uf' | 'fora-do-padrao'
  uf: string | null
  alternative: string | null
  /** Sigla para a etiqueta: "RJ", "BA/AL", "SEM UF", "FORA DO PADRÃO". */
  code: string
  /** Uma linha para a tela: "Rio de Janeiro (RJ) · faixa TTA–TUX, em uso desde 11/2024". */
  description: string
  isLocal: boolean
}

/** Número da placa no formato antigo (a Mercosul troca o 2º dígito por letra, A = 0 … J = 9: 1A00 = 1000; as letras
 * depois de J, das personalizadas, ficam acima de 9). */
function oldFormatNumber(plate: string): number {
  const fifth = plate[4]
  const digit = /\d/.test(fifth) ? Number(fifth) : fifth.charCodeAt(0) - 65
  return Number(plate[3]) * 1000 + digit * 100 + Number(plate.slice(5, 7))
}

/** A faixa que contém o prefixo (busca binária: as faixas estão em ordem e não se sobrepõem). */
function findRange(prefix: string): SeriesRange | null {
  let low = 0
  let high = RANGES.length - 1
  while (low <= high) {
    const middle = (low + high) >> 1
    const [first, last] = RANGES[middle]
    if (prefix < first) high = middle - 1
    else if (prefix > last) low = middle + 1
    else return RANGES[middle]
  }
  return null
}

const cache = new Map<string, PlateOrigin>()

/** A origem de uma placa pelas três primeiras letras (com a exceção da SAV, decidida pelo número). */
export function plateOrigin(input: string): PlateOrigin {
  const plate = input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
  const cached = cache.get(plate)
  if (cached) return cached
  let origin: PlateOrigin
  if (!/^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(plate)) {
    origin = {
      kind: 'fora-do-padrao',
      uf: null,
      alternative: null,
      code: 'FORA DO PADRÃO',
      isLocal: false,
      description:
        'Não segue a placa brasileira (ABC1234 ou ABC1D23): placa estrangeira, especial ou erro de leitura.',
    }
  } else {
    const prefix = plate.slice(0, 3)
    const range = findRange(prefix)
    if (!range) {
      origin = {
        kind: 'sem-uf',
        uf: null,
        alternative: null,
        code: 'SEM UF',
        isLocal: false,
        description: `Série ${prefix} não distribuída a nenhum estado: provável erro de leitura, placa adulterada ou série nova.`,
      }
    } else {
      const [first, last, rangeUf, since, source, rangeAlternative] = range
      // SAV: 0001 a 1000 foi de SP; o resto, do CE. Fora a SAV, a alternativa é a UF da outra fonte.
      const sav = prefix === 'SAV'
      const uf = sav ? (oldFormatNumber(plate) <= 1000 ? 'SP' : 'CE') : rangeUf
      const alternative = sav ? null : (rangeAlternative ?? null)
      const series = sav
        ? uf === 'SP'
          ? 'SAV 0001–1000 (0A01–1A00)'
          : 'SAV 1001–9999'
        : first === last
          ? first
          : `${first}–${last}`
      const start = sav && uf === 'SP' ? '09/2009' : since
      const inUse = start ? `, em uso desde ${start}` : ''
      const divergence = alternative
        ? ` · fontes divergem: ${SOURCES.W} diz ${uf}, ${SOURCES.F} diz ${alternative}`
        : ''
      origin = {
        kind: alternative ? 'divergente' : 'uf',
        uf,
        alternative,
        code: alternative ? `${uf}/${alternative}` : uf,
        isLocal: uf === LOCAL_UF,
        description: `${UF_NAMES[uf]} (${uf}) · faixa ${series}${inUse} · fonte: ${sav ? 'Wikipédia EN (01/2026)' : SOURCES[source]}${divergence}`,
      }
    }
  }
  cache.set(plate, origin)
  return origin
}
