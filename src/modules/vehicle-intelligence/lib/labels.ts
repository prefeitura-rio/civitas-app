const CATEGORY_LABELS: Record<string, string> = {
  CELULAR: 'Celular',
  TRANSEUNTE: 'Transeunte',
  OUTROS: 'Outros',
  MOTO: 'Moto',
  CARRO: 'Carro',
  BICICLETA: 'Bicicleta',
  'A PÉ': 'A pé',
  'NÃO INFORMADO': 'Não informado',
  ROUBO: 'Roubo',
  FURTO: 'Furto',
  CARGA: 'Carga subtraída',
  CARGA_VEICULO: 'Veículo + carga',
  VEICULO: 'Só veículo',
  'CAMINHÃO/TRATOR': 'Caminhão',
  'SUV/UTILITÁRIO': 'SUV/Utilitário',
  'SUV/UTILITÁRIO (PROXY)': 'SUV/Utilitário',
  'ÔNIBUS/MICRO-ÔNIBUS': 'Ônibus/Micro-ônibus',
}

/** Rótulo legível para alvo, deslocamento, tipo de fato e categoria do veículo, que chegam em maiúsculas da API. */
export function categoryLabel(value: string) {
  return (
    CATEGORY_LABELS[value] ??
    value.charAt(0) + value.slice(1).toLocaleLowerCase('pt-BR')
  )
}

const LOWERCASE_WORDS = new Set(['da', 'das', 'de', 'do', 'dos', 'e'])

/** "VILAR DOS TELES" vira "Vilar dos Teles". */
export function titleCase(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) =>
      index && LOWERCASE_WORDS.has(word)
        ? word
        : word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1),
    )
    .join(' ')
}

/** "064" + "064A. DP - [VILAR DOS TELES]" vira { code: "064", locality: "Vilar dos Teles", unit: "64ª DP" }. */
export function cispParts(
  code: string,
  rawName?: string | null,
): { code: string; locality: string | null; unit: string } {
  const normalized = /^\d+$/.test(code) ? code.padStart(3, '0') : code
  const locality = rawName?.match(/\[([^\]]+)\]/)?.[1]
  const number = rawName?.trim().match(/^0*(\d+)\s*A?\.?\s*DP/i)?.[1]
  return {
    code: normalized,
    locality: locality ? titleCase(locality) : null,
    unit: number ? `${Number(number)}ª DP` : `CISP ${normalized}`,
  }
}

/**
 * "RUA VISCONDE DE PIRAJA" → "Rua Visconde de Piraja". Diferente de `titleCase`, também põe maiúscula depois de
 * "(", "/" e "-" e mantém os espaços do texto (endereços, bairros, nomes de delegacia).
 */
export const titleCaseText = (text: string) =>
  text
    .toLocaleLowerCase('pt-BR')
    .replace(
      /(^|[\s(/-])(\p{L})(\p{L}*)/gu,
      (whole, before: string, letter: string, rest: string, offset: number) =>
        offset > 0 && LOWERCASE_WORDS.has(`${letter}${rest}`)
          ? whole
          : `${before}${letter.toLocaleUpperCase('pt-BR')}${rest}`,
    )

/** O endereço do RO sem a cidade e sem o bairro do fim: "Rua Visconde de Piraja, 526". */
export function shortAddress(address: string | null | undefined): string {
  if (!address) return 'endereço não informado'
  const parts = address
    .replace(/,?\s*Rio de Janeiro\s*\/\s*RJ\s*$/i, '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length > 1 && !/\d/.test(parts[parts.length - 1])) parts.pop()
  return titleCaseText(parts.join(', '))
}

/** "CISP 14 · Leblon" a partir do código e do nome da delegacia ("014A. DP - [LEBLON]"). */
export function cispLabel(
  cisp: string | null | undefined,
  rawName: string | null | undefined,
): string {
  if (!cisp) return 'CISP não informada'
  const code = /^\d+$/.test(cisp) ? String(Number(cisp)) : cisp
  const neighborhood = rawName
    ?.replace(/^\d+A?\. DP - /i, '')
    .replace(/^\[(.*)\]$/, '$1')
    .trim()
  return neighborhood
    ? `CISP ${code} · ${titleCaseText(neighborhood)}`
    : `CISP ${code}`
}
