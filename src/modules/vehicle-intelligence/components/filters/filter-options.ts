/** Peças comuns aos seletores de filtro: alternar um item, a busca sem acento e o nome da delegacia. */
import type { CispOption } from '@/modules/vehicle-intelligence/types/domain'

export function toggle<T>(items: T[], item: T): T[] {
  return items.includes(item)
    ? items.filter((current) => current !== item)
    : [...items, item]
}

/** Minúsculas e sem acento, para a busca nas listas. */
export function foldAccents(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function cispSecondaryLabel(item: CispOption) {
  const label = item.nome.replace(/^\d+A?\. DP - /, '').trim()
  const normalizedLabel = label.replace(/\s+/g, '').toLowerCase()
  const normalizedCode = `CISP${item.codigo}`.replace(/\s+/g, '').toLowerCase()
  return !label ||
    normalizedLabel === normalizedCode ||
    /nome não disponível/i.test(label)
    ? ''
    : label
}

/** Rótulos curtos das modalidades de carga nos seletores. */
export const MODALITY_SHORT_LABELS: Record<string, string> = {
  CARGA_VEICULO: 'Carga + veículo',
  CARGA: 'Carga',
}
