'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  BusFront,
  Cctv,
  ChevronUp,
  FlameKindling,
  Layers,
  Satellite,
  School,
  Shield,
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
import { Toggle } from '@/components/ui/toggle'
import { useMap } from '@/hooks/useContexts/use-map-context'
import { MapStyle } from '@/utils/get-map-style'
import { POINT_CLUSTER_COLORS } from '@/utils/point-cluster-colors'

type Layer = {
  name: string
  icon: React.ReactNode
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
  clusterColor?: [number, number, number, number]
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
      radars: { isVisible: isRadarVisible, setIsVisible: setIsRadarVisible },
      cameras: { isVisible: isCameraVisible, setIsVisible: setIsCameraVisible },
      fogoCruzado: {
        isVisible: isFogoCruzadoVisible,
        setIsVisible: setIsFogoCruzadoVisible,
      },
      AISP: { isVisible: isAISPVisible, setIsVisible: setIsAISPVisible },
      CISP: { isVisible: isCISPVisible, setIsVisible: setIsCISPVisible },
      schools: {
        isVisible: isSchoolsVisible,
        setIsVisible: setIsSchoolsVisible,
      },
      busStops: {
        isVisible: isBusStopsVisible,
        setIsVisible: setIsBusStopsVisible,
      },
    },
    mapStyle,
    setMapStyle,
  } = useMap()

  const [isOpen, setIsOpen] = useState(false)

  const layers: Layer[] = [
    {
      name: 'LPR',
      icon: <Cctv />,
      isVisible: isRadarVisible,
      setIsVisible: setIsRadarVisible,
      clusterColor: POINT_CLUSTER_COLORS.lpr,
    },
    {
      name: 'Câmeras',
      icon: <Video />,
      isVisible: isCameraVisible,
      setIsVisible: setIsCameraVisible,
      clusterColor: POINT_CLUSTER_COLORS.cameras,
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
      setIsVisible: (isVisible) => {
        setIsAISPVisible(isVisible)
        if (isVisible) setIsCISPVisible(false)
      },
    },
    {
      name: 'CISP',
      icon: <Shield />,
      isVisible: isCISPVisible,
      setIsVisible: (isVisible) => {
        setIsCISPVisible(isVisible)
        if (isVisible) setIsAISPVisible(false)
      },
    },
    {
      name: 'Escolas Municipais',
      icon: <School />,
      isVisible: isSchoolsVisible,
      setIsVisible: setIsSchoolsVisible,
      clusterColor: POINT_CLUSTER_COLORS.schools,
    },
    {
      name: 'Paradas de Ônibus',
      icon: <BusFront />,
      isVisible: isBusStopsVisible,
      setIsVisible: setIsBusStopsVisible,
      clusterColor: POINT_CLUSTER_COLORS.busStops,
    },
  ]

  return (
    <Card className="absolute bottom-4 left-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
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
                        <Toggle
                          key={index}
                          pressed={layer.isVisible}
                          onPressedChange={layer.setIsVisible}
                          style={getLayerButtonStyle(layer)}
                          className={`flex size-20 shrink-0 flex-col items-center justify-center ${
                            layer.clusterColor
                              ? ''
                              : 'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
                          }`}
                          aria-label={`Toggle ${layer.name} layer`}
                        >
                          {layer.icon}
                          <span className="mt-1 text-xs">{layer.name}</span>
                        </Toggle>
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
  )
}
