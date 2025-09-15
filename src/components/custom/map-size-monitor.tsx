export function MapSizeMonitor() {
  return (
    <div
      className="map-size-monitor pointer-events-none absolute inset-0 z-0 @container"
      style={
        {
          '--viewport-width': '100vw',
          '--viewport-height': '100vh',
          '--map-width': '100%',
          '--map-height': '100%',
        } as React.CSSProperties
      }
    />
  )
}
