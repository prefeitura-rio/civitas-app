import type { GraphEdge } from '@/modules/vehicle-intelligence/features/correlations/graph-variants'
import {
  focusFrame,
  graphFingerprint,
  spiralPositions,
  strengthColor,
} from '@/modules/vehicle-intelligence/features/correlations/network-layout'

const edge = (source: string, target: string, weight: number) =>
  ({ source, target, weight }) as GraphEdge

describe('desenho da rede', () => {
  it('pinta a ligação pela força: alta, intermediária e baixa', () => {
    expect(strengthColor(70)).toBe('rgba(255,82,102,.88)')
    expect(strengthColor(40)).toBe('rgba(24,199,221,.62)')
    expect(strengthColor(39.9)).toBe('rgba(159,180,186,.22)')
  })

  it('espalha os nós numa espiral que não depende da ordem de chegada', () => {
    const positions = spiralPositions([{ id: 'B' }, { id: 'A' }, { id: 'C' }])
    const again = spiralPositions([{ id: 'C' }, { id: 'A' }, { id: 'B' }])
    expect([...positions.entries()]).toEqual([...again.entries()])
    const first = [...positions.values()][0]
    expect(Math.hypot(first.x, first.y)).toBeCloseTo(70)
  })

  it('assina o desenho sem depender da ordem, mas da chave, dos nós e do peso das ligações', () => {
    const nodes = [{ id: 'RO1' }, { id: 'ABC1D23' }]
    const signature = graphFingerprint('k', nodes, [edge('RO1', 'ABC1D23', 2)])
    expect(signature).toMatch(/^graph-v4:2:1:\d+$/)
    expect(
      graphFingerprint('k', [...nodes].reverse(), [edge('RO1', 'ABC1D23', 2)]),
    ).toBe(signature)
    expect(
      graphFingerprint('outra', nodes, [edge('RO1', 'ABC1D23', 2)]),
    ).not.toBe(signature)
    expect(graphFingerprint('k', nodes, [edge('RO1', 'ABC1D23', 3)])).not.toBe(
      signature,
    )
  })

  it('enquadra os nós na área livre, sem passar de 0,8', () => {
    const close = focusFrame(
      [
        { x: 0, y: 0 },
        { x: 10, y: 20 },
      ],
      800,
      720,
      0,
      0,
    )
    expect(close).toEqual({
      bounds: { left: 0, right: 10, top: 0, bottom: 20 },
      scale: 0.8,
    })
    const wide = focusFrame(
      [
        { x: -1000, y: 0 },
        { x: 1000, y: 100 },
      ],
      1324,
      720,
      324,
      0,
    )
    expect(wide.scale).toBeCloseTo((1324 - 324 - 140) / 2000)
  })
})
