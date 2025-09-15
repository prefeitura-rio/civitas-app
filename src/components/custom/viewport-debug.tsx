export function ViewportDebug() {
  return (
    <div
      className="fixed left-4 top-4 z-[200] rounded bg-black/80 p-2 font-mono text-xs text-white"
      style={
        {
          '--viewport-info':
            '"Viewport: " var(--viewport-width) " x " var(--viewport-height)',
          '--map-info': '"Map: " var(--map-width) " x " var(--map-height)',
        } as React.CSSProperties
      }
    >
      <div className="before:content-['Viewport:_100vw_x_100vh']"></div>
      <div className="before:content-['Map:_100%_x_100%']"></div>
    </div>
  )
}
