import {
  createLeafletContext,
  type LeafletContextInterface,
  LeafletProvider,
} from '@react-leaflet/core'
import {
  type FitBoundsOptions,
  type LatLngBoundsExpression,
  Map as LeafletMap,
} from 'leaflet'
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { MapContainerProps } from 'react-leaflet'

/**
 * O `MapContainer` do react-leaflet 4 com a correção do react-leaflet 5. Quando um `Suspense` esconde e volta a
 * mostrar uma tela já montada (ao abrir pela primeira vez uma tela carregada com `lazy`), o React liga de novo o `ref`
 * do contêiner; o v4 cria outro mapa no mesmo nó e o Leaflet acusa "Map container is already initialized". Aqui o mapa
 * fica num ref e só é criado uma vez por contêiner. Mesma API do `MapContainer` do react-leaflet.
 */
function MapContainerComponent(
  {
    bounds,
    boundsOptions,
    center,
    children,
    className,
    id,
    placeholder,
    style,
    whenReady,
    zoom,
    ...options
  }: MapContainerProps,
  forwardedRef: ForwardedRef<LeafletMap>,
) {
  const [props] = useState({ className, id, style })
  const [context, setContext] = useState<LeafletContextInterface | null>(null)
  const mapInstance = useRef<LeafletMap | null>(null)
  // Antes de o mapa existir o ref recebe null, como no react-leaflet.
  useImperativeHandle(
    forwardedRef,
    () => (context?.map ?? null) as LeafletMap,
    [context],
  )

  // As props iniciais valem só na criação do mapa, como no react-leaflet; depois cada filho controla o que muda.
  const mapRef = useCallback((node: HTMLDivElement | null) => {
    if (node === null || mapInstance.current !== null) return
    const map = new LeafletMap(node, options)
    mapInstance.current = map
    if (center != null && zoom != null) map.setView(center, zoom)
    else if (bounds != null)
      map.fitBounds(
        bounds as LatLngBoundsExpression,
        boundsOptions as FitBoundsOptions,
      )
    if (whenReady != null) map.whenReady(whenReady)
    setContext(createLeafletContext(map))
    // initial props only, same as react-leaflet
  }, [])

  // Só desmontar remove o mapa. O ref é zerado junto (e só aí): no StrictMode o React roda a limpeza com
  // `context` ainda nulo, e zerar nesse momento faria o próximo religamento criar um segundo mapa.
  useEffect(
    () => () => {
      if (context === null) return
      context.map.remove()
      mapInstance.current = null
    },
    [context],
  )

  return (
    <div {...props} ref={mapRef}>
      {context ? (
        <LeafletProvider value={context}>{children}</LeafletProvider>
      ) : (
        (placeholder ?? null)
      )}
    </div>
  )
}

export const MapContainer = forwardRef(MapContainerComponent)
