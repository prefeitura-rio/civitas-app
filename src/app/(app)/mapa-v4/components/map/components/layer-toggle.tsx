import React from 'react'

interface LayerToggleProps {
  layers: string[]
  enabledLayers: Record<string, boolean>
  onToggle: (layerId: string) => void
}

export default function LayerToggle({
  layers,
  enabledLayers,
  onToggle,
}: LayerToggleProps) {
  return (
    <div className="absolute right-4 top-4 rounded-lg bg-white p-4 shadow-lg">
      <h3 className="mb-2 text-lg font-semibold">Toggle Layers</h3>
      {layers.map((layerId) => (
        <div key={layerId} className="mb-2 flex items-center">
          <input
            type="checkbox"
            id={layerId}
            checked={enabledLayers[layerId]}
            onChange={() => onToggle(layerId)}
            className="mr-2"
          />
          <label htmlFor={layerId}>{layerId}</label>
        </div>
      ))}
    </div>
  )
}
