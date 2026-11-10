import { act, renderHook } from '@testing-library/react'

import { useMapSize } from '@/hooks/use-map-size'

describe('renderer-reported map dimensions', () => {
  it('waits for the renderer and keeps each map instance independent', () => {
    const first = renderHook(() => useMapSize())
    const second = renderHook(() => useMapSize())
    expect(first.result.current.mapSize).toBeNull()
    expect(second.result.current.mapSize).toBeNull()

    act(() => first.result.current.handleResize({ width: 900, height: 520 }))

    expect(first.result.current.mapSize).toEqual({ width: 900, height: 520 })
    expect(second.result.current.mapSize).toBeNull()
  })

  it('updates on resize without replacing equal dimensions or callback references', () => {
    const { result } = renderHook(() => useMapSize())
    const onResize = result.current.handleResize
    act(() => onResize({ width: 900, height: 520 }))
    const measured = result.current.mapSize
    act(() => onResize({ width: 900, height: 520 }))
    expect(result.current.mapSize).toBe(measured)
    expect(result.current.handleResize).toBe(onResize)

    act(() => onResize({ width: 420, height: 360 }))
    expect(result.current.mapSize).toEqual({ width: 420, height: 360 })
  })

  it.each([
    { width: 0, height: 520 },
    { width: 900, height: 0 },
    { width: -1, height: 520 },
    { width: Infinity, height: 520 },
    { width: 900, height: NaN },
  ])('invalidates dimensions when the renderer reports %p', (dimensions) => {
    const { result } = renderHook(() => useMapSize())
    act(() => result.current.handleResize({ width: 900, height: 520 }))

    act(() => result.current.handleResize(dimensions))

    expect(result.current.mapSize).toBeNull()
  })

  it('forgets the previous surface size before a remount', () => {
    const { result } = renderHook(() => useMapSize())
    act(() => result.current.handleResize({ width: 900, height: 520 }))
    act(() => result.current.resetMapSize())
    expect(result.current.mapSize).toBeNull()

    act(() => result.current.handleResize({ width: 420, height: 360 }))
    expect(result.current.mapSize).toEqual({ width: 420, height: 360 })
  })
})
