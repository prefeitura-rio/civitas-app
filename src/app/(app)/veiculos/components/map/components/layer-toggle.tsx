'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  BusFront,
  Cctv,
  ChevronDown,
  ChevronUp,
  FlameKindling,
  Layers,
  LoaderCircle,
  Satellite,
  School,
  Shield,
  TriangleAlert,
  Video,
} from 'lucide-react'
import { type CSSProperties, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Toggle } from '@/components/ui/toggle'
import type { OriginFilter } from '@/hooks/mapLayers/use-origin-filter'
import { useMap } from '@/hooks/useContexts/use-map-context'
import { cn } from '@/lib/utils'
import { MapStyle } from '@/utils/get-map-style'
import { POINT_CLUSTER_COLORS } from '@/utils/point-cluster-colors'

type OriginFilterControls = Omit<OriginFilter<unknown>, 'visibleData'>

type Layer = {
  name: string
  icon: React.ReactNode
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
  clusterColor?: [number, number, number, number]
  isLoading?: boolean
  isError?: boolean
  originFilter?: OriginFilterControls
}

function OriginFilterButton({
  layerName,
  filter,
  open,
  color,
  onClick,
}: {
  layerName: string
  filter: OriginFilterControls
  open: boolean
  color: string
  onClick: () => void
}) {
  const hiddenCount = filter.hiddenOrigins.size

  return (
    <button
      type="button"
      data-origin-filter-trigger
      aria-expanded={open}
      aria-label={
        hiddenCount > 0
          ? `Filtrar ${layerName} por origem (${hiddenCount} oculta${hiddenCount > 1 ? 's' : ''})`
          : `Filtrar ${layerName} por origem`
      }
      title="Filtrar por origem"
      onClick={onClick}
      style={{ color }}
      className="absolute right-1 top-1 flex items-center gap-0.5 rounded-md p-1 hover:bg-black/10"
    >
      {hiddenCount > 0 ? (
        <span className="grid size-3 place-items-center rounded-full border border-current">
          <span className="size-1.5 rounded-full bg-current" />
        </span>
      ) : (
        <span className="size-2 rounded-full bg-current" />
      )}
      <ChevronDown
        className={cn('size-3 transition-transform', open && 'rotate-180')}
      />
    </button>
  )
}

function OriginFilterPanel({
  layerName,
  filter,
}: {
  layerName: string
  filter: OriginFilterControls
}) {
  return (
    <div className="w-72">
      <p className="text-sm font-semibold">Origem · {layerName}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Selecione as origens exibidas
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {filter.originCounts.map(({ origin, count }) => {
          const shown = !filter.hiddenOrigins.has(origin)
          return (
            <button
              key={origin}
              type="button"
              aria-pressed={shown}
              onClick={() => filter.toggleOrigin(origin)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors',
                shown
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="truncate">{origin}</span>
              <span className="tabular-nums">
                {count.toLocaleString('pt-BR')}
              </span>
            </button>
          )
        })}
        {filter.hiddenOrigins.size > 0 && (
          <button
            type="button"
            onClick={filter.showAllOrigins}
            className="px-1 text-sm font-medium text-primary hover:underline"
          >
            Mostrar todas
          </button>
        )}
      </div>
    </div>
  )
}

function getLayerButtonStyle(layer: Layer): CSSProperties | undefined {
  if (!layer.clusterColor || !layer.isVisible) return undefined

  const [red, green, blue] = layer.clusterColor
  const backgroundColor = `rgb(${red}, ${green}, ${blue})`
  const relativeLuminance = [red, green, blue]
    .map((channel) => {
      const normalized = channel / 255
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4
    })
    .reduce((sum, channel, index) => {
      return sum + channel * [0.2126, 0.7152, 0.0722][index]
    }, 0)

  return {
    backgroundColor,
    color: relativeLuminance > 0.179 ? '#111827' : '#ffffff',
  }
}

export function MapLayerControl() {
  const {
    layers: {
      radars: radarLayer,
      cameras: cameraLayer,
      fogoCruzado: {
        isVisible: isFogoCruzadoVisible,
        setIsVisible: setIsFogoCruzadoVisible,
      },
      AISP: {
        isVisible: isAISPVisible,
        setIsVisible: setIsAISPVisible,
        isLoading: isAISPLoading,
        isError: isAISPError,
      },
      CISP: {
        isVisible: isCISPVisible,
        setIsVisible: setIsCISPVisible,
        isLoading: isCISPLoading,
        isError: isCISPError,
      },
      schools: {
        isVisible: isSchoolsVisible,
        setIsVisible: setIsSchoolsVisible,
        isLoading: isSchoolsLoading,
        isError: isSchoolsError,
      },
      busStops: {
        isVisible: isBusStopsVisible,
        setIsVisible: setIsBusStopsVisible,
        isLoading: isBusStopsLoading,
        isError: isBusStopsError,
      },
    },
    mapStyle,
    setMapStyle,
  } = useMap()

  const [isOpen, setIsOpen] = useState(false)
  const [originLayer, setOriginLayer] = useState<string | null>(null)

  const layers: Layer[] = [
    {
      name: 'LPR',
      icon: <Cctv />,
      isVisible: radarLayer.isVisible,
      setIsVisible: radarLayer.setIsVisible,
      clusterColor: POINT_CLUSTER_COLORS.lpr,
      originFilter: radarLayer,
    },
    {
      name: 'Câmeras',
      icon: <Video />,
      isVisible: cameraLayer.isVisible,
      setIsVisible: cameraLayer.setIsVisible,
      clusterColor: POINT_CLUSTER_COLORS.cameras,
      originFilter: cameraLayer,
    },
    {
      name: 'Fogo Cruzado',
      icon: <FlameKindling />,
      isVisible: isFogoCruzadoVisible,
      setIsVisible: setIsFogoCruzadoVisible,
      clusterColor: POINT_CLUSTER_COLORS.incidents,
    },
    {
      name: 'Satélite',
      icon: <Satellite />,
      isVisible: mapStyle === MapStyle.Satellite,
      setIsVisible: (satellite) => {
        setMapStyle(satellite ? MapStyle.Satellite : MapStyle.Map)
      },
    },
    {
      name: 'AISP',
      icon: <Shield />,
      isVisible: isAISPVisible,
      isLoading: isAISPLoading,
      isError: isAISPError,
      setIsVisible: (isVisible) => {
        setIsAISPVisible(isVisible)
        if (isVisible) setIsCISPVisible(false)
      },
    },
    {
      name: 'CISP',
      icon: <Shield />,
      isVisible: isCISPVisible,
      isLoading: isCISPLoading,
      isError: isCISPError,
      setIsVisible: (isVisible) => {
        setIsCISPVisible(isVisible)
        if (isVisible) setIsAISPVisible(false)
      },
    },
    {
      name: 'Escolas Municipais',
      icon: <School />,
      isVisible: isSchoolsVisible,
      isLoading: isSchoolsLoading,
      isError: isSchoolsError,
      setIsVisible: setIsSchoolsVisible,
      clusterColor: POINT_CLUSTER_COLORS.schools,
    },
    {
      name: 'Paradas de Ônibus',
      icon: <BusFront />,
      isVisible: isBusStopsVisible,
      isLoading: isBusStopsLoading,
      isError: isBusStopsError,
      setIsVisible: setIsBusStopsVisible,
      clusterColor: POINT_CLUSTER_COLORS.busStops,
    },
  ]

  const activeOriginLayer = layers.find(
    (layer) =>
      layer.name === originLayer && layer.isVisible && layer.originFilter,
  )

  return (
    <Popover
      open={activeOriginLayer !== undefined}
      onOpenChange={(open) => {
        if (!open) setOriginLayer(null)
      }}
    >
      <PopoverAnchor asChild>
        <Card className="absolute bottom-4 left-4">
          <Collapsible
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open)
              if (!open) setOriginLayer(null)
            }}
          >
            <motion.div
              initial={false}
              animate={{
                width: isOpen ? 180 : 60,
                height: isOpen ? 'auto' : 40,
                transition: { duration: 0.3, ease: 'easeInOut' },
              }}
              className="overflow-hidden rounded-lg shadow-lg"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-2"
                >
                  <Layers className="size-6 shrink-0" />
                  <span className={`ml-2 ${isOpen ? 'inline' : 'hidden'}`}>
                    Camadas
                  </span>
                  <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={isOpen ? 'ml-auto' : ''}
                  >
                    <ChevronUp className="size-4 shrink-0" />
                  </motion.div>
                </Button>
              </CollapsibleTrigger>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <CollapsibleContent forceMount asChild>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="p-2">
                        <div className="grid grid-cols-2 gap-2">
                          {layers.map((layer, index) => (
                            <div key={index} className="relative">
                              <Toggle
                                pressed={layer.isVisible}
                                onPressedChange={layer.setIsVisible}
                                style={getLayerButtonStyle(layer)}
                                className={`flex size-20 shrink-0 flex-col items-center justify-center ${
                                  layer.clusterColor
                                    ? ''
                                    : 'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
                                }`}
                                aria-label={`Toggle ${layer.name} layer`}
                                aria-busy={layer.isLoading || undefined}
                                aria-description={
                                  layer.isError
                                    ? 'Erro ao carregar. Desative e ative para tentar novamente.'
                                    : undefined
                                }
                                title={
                                  layer.isError
                                    ? 'Erro ao carregar. Desative e ative para tentar novamente.'
                                    : undefined
                                }
                              >
                                {layer.isLoading ? (
                                  <LoaderCircle
                                    className="animate-spin"
                                    aria-label="Carregando"
                                  />
                                ) : layer.isError ? (
                                  <TriangleAlert aria-label="Erro ao carregar" />
                                ) : (
                                  layer.icon
                                )}
                                <span className="mt-1 text-xs">
                                  {layer.name}
                                </span>
                                {layer.isError && (
                                  <span className="text-xs">
                                    Erro ao carregar
                                  </span>
                                )}
                              </Toggle>
                              {layer.isVisible &&
                                layer.originFilter &&
                                layer.originFilter.originCounts.length > 0 && (
                                  <OriginFilterButton
                                    layerName={layer.name}
                                    filter={layer.originFilter}
                                    open={originLayer === layer.name}
                                    color={
                                      getLayerButtonStyle(layer)?.color ??
                                      '#fff'
                                    }
                                    onClick={() =>
                                      setOriginLayer((current) =>
                                        current === layer.name
                                          ? null
                                          : layer.name,
                                      )
                                    }
                                  />
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </motion.div>
          </Collapsible>
        </Card>
      </PopoverAnchor>
      {activeOriginLayer?.originFilter && (
        <PopoverContent
          side="right"
          align="start"
          sideOffset={16}
          alignOffset={36}
          className="p-4"
          onInteractOutside={(event) => {
            const target = event.target
            if (
              target instanceof Element &&
              target.closest('[data-origin-filter-trigger]')
            ) {
              event.preventDefault()
            }
          }}
        >
          <OriginFilterPanel
            layerName={activeOriginLayer.name}
            filter={activeOriginLayer.originFilter}
          />
        </PopoverContent>
      )}
    </Popover>
  )
}
