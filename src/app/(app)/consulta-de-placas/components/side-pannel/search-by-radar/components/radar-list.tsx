import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'

export function RadarList() {
  const { mapRef, deckRef } = useCarPath()
  const bbox = mapRef.current?.getBounds()
  const canvasContainer = mapRef.current?.getCanvasContainer()
  const canvasHeight = canvasContainer?.clientHeight
  const canvasWidth = canvasContainer?.clientWidth
  const objects = deckRef.current?.pickObjects({
    x: 0,
    y: 0,
    width: canvasWidth,
    height: 944,
    layerIds: ['cameras'],
  })
  console.log({ bbox, objects, canvasHeight, canvasWidth })
  return (
    <div className="h-[calc(100%-17rem)] w-full">
      <h1>List</h1>
      {objects?.map((item) => (
        <div>
          <span>{`Código: ${item.object.properties.code}`}</span>
          <span>{`Localização: ${item.object.properties.location}`}</span>
        </div>
      ))}
    </div>
  )
}
