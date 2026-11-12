import type { GroupEvent } from '@/modules/vehicle-intelligence/types/groups'

/** Os pares do RO com a evidência; sem evidência, os pares só dividem o RO. */
export function eventPairs(
  groupEvent: GroupEvent,
): Array<{ pair: string; text: string }> {
  if (groupEvent.pairs.length) {
    return groupEvent.pairs.map((pair) => ({
      pair: `${pair.a} + ${pair.b}`,
      text:
        [
          pair.together && 'juntas no fato',
          pair.disconnected && 'desconectaram juntas',
        ]
          .filter(Boolean)
          .join(' e ') || 'dividem o RO',
    }))
  }
  const pairs = []
  for (let i = 0; i < groupEvent.plates.length; i += 1) {
    for (let j = i + 1; j < groupEvent.plates.length; j += 1)
      pairs.push({
        pair: `${groupEvent.plates[i]} + ${groupEvent.plates[j]}`,
        text: 'dividem o RO',
      })
  }
  return pairs
}
