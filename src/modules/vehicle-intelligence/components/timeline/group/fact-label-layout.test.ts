import type { GroupEvent } from '@/modules/vehicle-intelligence/components/timeline/group/events'
import { layoutFactLabels } from '@/modules/vehicle-intelligence/components/timeline/group/fact-label-layout'
import { instantMs } from '@/modules/vehicle-intelligence/lib/dates'

const dayStart = instantMs('2026-03-02T00:00:00-03:00')
const hour = 3_600_000
const fact = (label: string, at: number) =>
  ({ kind: 'fact', key: label, at, label, detections: [] }) as GroupEvent
const percent = (t: number) => ((t - dayStart) / (24 * hour)) * 100

describe('rótulos dos fatos no eixo', () => {
  it('sem largura medida, cada rótulo fica centrado no horário com o texto completo', () => {
    const [label] = layoutFactLabels(
      [fact('Fato 1', dayStart + 12 * hour)],
      percent,
      0,
    )
    expect(label.text).toBe('Fato 1 · 12:00')
    expect(label.transform).toBe('translateX(-50%)')
  })

  it('fatos próximos: o primeiro encosta à esquerda e o seguinte à direita; sem espaço, viram número ou só o pino', () => {
    const near = [
      fact('Fato 1', dayStart + 12 * hour),
      fact('Fato 2', dayStart + 12.5 * hour),
    ]
    const wide = layoutFactLabels(near, percent, 2000)
    expect(wide.map((label) => [label.text, label.transform])).toEqual([
      ['Fato 1 · 12:00', 'translateX(calc(-100% + 8px))'],
      ['Fato 2 · 12:30', 'translateX(-8px)'],
    ])
    const narrow = layoutFactLabels(near, percent, 300)
    expect(narrow.map((label) => label.text)).toEqual(['1', ''])
    expect(narrow.map((label) => label.fullText)).toEqual([
      'Fato 1 · 12:00',
      'Fato 2 · 12:30',
    ])
    const crowded = layoutFactLabels(
      [
        fact('Fato 1', dayStart + 12 * hour),
        fact('Fato 2', dayStart + 12.1 * hour),
        fact('Fato 3', dayStart + 12.2 * hour),
      ],
      percent,
      300,
    )
    expect(crowded.map((label) => label.text)).toEqual(['1', '', ''])
  })
})
