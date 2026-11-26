import type { PickingInfo } from 'deck.gl'

import { calculateTooltipAbsolutePosition } from '@/app/(app)/veiculos/components/map/components/context-menu/components/calculate-tooltip-absolute-position'

const CARD = { width: 400, height: 350 }

function pickAt(x: number, y: number) {
  return {
    x,
    y,
    layer: { id: 'AISP' },
    viewport: { width: 931, height: 861 },
  } as unknown as PickingInfo
}

describe('calculateTooltipAbsolutePosition', () => {
  it('converte o ponto do mapa para a janela, com o mapa abaixo da barra de personificação', () => {
    const position = calculateTooltipAbsolutePosition(
      pickAt(740, 323),
      CARD.width,
      CARD.height,
      { left: 56, top: 44 },
    )

    expect(position).toEqual({
      top: 323 - 20 + 44,
      left: 740 - 400 - 20 + 56,
    })
  })

  it('sem barra no topo, mantém a posição de hoje', () => {
    const position = calculateTooltipAbsolutePosition(
      pickAt(740, 323),
      CARD.width,
      CARD.height,
      { left: 56, top: 0 },
    )

    expect(position).toEqual({ top: 303, left: 376 })
  })
})
