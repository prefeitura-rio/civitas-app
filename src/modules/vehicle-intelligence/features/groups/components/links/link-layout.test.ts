import {
  edgeKey,
  edgeStatus,
  forceLayout,
} from '@/modules/vehicle-intelligence/features/groups/components/links/link-layout'
import type {
  GroupEdge,
  GroupMember,
} from '@/modules/vehicle-intelligence/types/groups'

const members = (...plates: string[]) =>
  plates.map((plate) => ({ plate }) as GroupMember)
const edge = (
  a: string,
  b: string,
  overrides: Partial<GroupEdge> = {},
): GroupEdge => ({
  a,
  b,
  shared_events: 2,
  chance: null,
  together_at_fact: 2,
  disconnected_together: 0,
  days_together: 0,
  days_together_outside_facts: 0,
  strong: false,
  double_read: false,
  routine: false,
  ...overrides,
})

describe('ligações do grupo: layout e situação', () => {
  it('põe uma placa só no centro e o par na horizontal', () => {
    expect(forceLayout(members('A'), [])).toEqual({ A: { x: 0.5, y: 0.45 } })
    const pair = forceLayout(members('A', 'B'), [
      edge('A', 'B', { strong: true }),
    ])
    expect(pair.A.y).toBe(0.45)
    expect(pair.B.y).toBe(0.45)
    expect([pair.A.x, pair.B.x].sort()).toEqual([0.14, 0.86])
  })

  it('é determinístico e fica dentro da área útil', () => {
    const group = members('A', 'B', 'C', 'D', 'E')
    const edges = [
      edge('A', 'B', { strong: true }),
      edge('B', 'C'),
      edge('C', 'D', { strong: true }),
      edge('D', 'E'),
    ]
    const layout = forceLayout(group, edges)
    expect(forceLayout(group, edges)).toEqual(layout)
    for (const { x, y } of Object.values(layout)) {
      expect(x).toBeGreaterThanOrEqual(0.14 - 1e-9)
      expect(x).toBeLessThanOrEqual(0.86 + 1e-9)
      expect(y).toBeGreaterThanOrEqual(0.12 - 1e-9)
      expect(y).toBeLessThanOrEqual(0.78 + 1e-9)
    }
  })

  it('dá a situação do par: forte, leitura dupla, rotina ou fraca', () => {
    expect(edgeKey(edge('A', 'B'))).toBe('A|B')
    expect(
      edgeStatus(edge('A', 'B', { strong: true, double_read: true }))[0],
    ).toBe('Forte')
    expect(
      edgeStatus(edge('A', 'B', { double_read: true, routine: true }))[0],
    ).toBe('Leitura dupla')
    expect(edgeStatus(edge('A', 'B', { routine: true }))[0]).toBe('Rotina')
    expect(edgeStatus(edge('A', 'B'))).toEqual(['Fraca', '#9fb4ba'])
  })
})
