import type { PickingInfo } from 'deck.gl'

import { calculateTooltipAbsolutePosition } from '@/app/(app)/veiculos/components/map/components/context-menu/components/calculate-tooltip-absolute-position'

const BELOW_IMPERSONATION_BAR = { left: 56, top: 44 }

function pickAt(x: number, y: number) {
  return {
    x,
    y,
    layer: { id: 'AISP' },
    viewport: { width: 931, height: 861 },
  } as unknown as PickingInfo
}

describe('calculateTooltipAbsolutePosition', () => {
  it.each([
    ['metade direita e de cima', 740, 323, 400, 350, { top: 347, left: 376 }],
    ['metade esquerda e de baixo', 300, 800, 400, 350, { top: 474, left: 376 }],
    ['encostado na borda direita', 460, 323, 500, 350, { top: 347, left: 477 }],
    ['encostado na borda esquerda', 500, 323, 500, 350, { top: 347, left: 66 }],
    ['encostado no topo', 740, 30, 400, 350, { top: 104, left: 376 }],
    [
      'encostado embaixo, com o tamanho padrão do card',
      740,
      400,
      undefined,
      undefined,
      { top: 320, left: 376 },
    ],
  ])(
    'card %s, convertido para a janela com o mapa abaixo da barra',
    (_, x, y, cardWidth, cardHeight, expected) => {
      expect(
        calculateTooltipAbsolutePosition(
          pickAt(x, y),
          cardWidth,
          cardHeight,
          BELOW_IMPERSONATION_BAR,
        ),
      ).toEqual(expected)
    },
  )

  it('sem barra no topo, só desloca pela barra lateral', () => {
    expect(
      calculateTooltipAbsolutePosition(pickAt(740, 323), 400, 350, {
        left: 56,
        top: 0,
      }),
    ).toEqual({ top: 303, left: 376 })
  })
})
