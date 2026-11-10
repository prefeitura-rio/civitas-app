'use client'

import { useState } from 'react'

import satelliteThumbnail from '@/assets/satellite-thumbnail.png'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMap } from '@/hooks/useContexts/use-map-context'
import { cn } from '@/lib/utils'
import { MapStyle } from '@/utils/get-map-style'

interface StyleOption {
  id: MapStyle
  label: string
}

const STYLE_OPTIONS: readonly StyleOption[] = [
  { id: MapStyle.Map, label: 'Padrão' },
  { id: MapStyle.Satellite, label: 'Satélite' },
  { id: MapStyle.Dark, label: 'Escuro' },
]

export function getNextMapStyle(current: MapStyle): MapStyle {
  switch (current) {
    case MapStyle.Map:
      return MapStyle.Satellite
    case MapStyle.Satellite:
      return MapStyle.Dark
    case MapStyle.Dark:
    default:
      return MapStyle.Map
  }
}

function StyleThumbnail({ style, label }: { style: MapStyle; label: string }) {
  return (
    <div className="relative size-full overflow-hidden bg-[#445]">
      {style === MapStyle.Satellite ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={satelliteThumbnail.src}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[-68%] top-[-20%] max-w-none select-none"
          style={{ width: '300%' }}
        />
      ) : style === MapStyle.Dark ? (
        <svg viewBox="0 0 96 96" className="block size-full" aria-hidden="true">
          <rect width="96" height="96" fill="#1a2030" />
          <rect x="8" y="8" width="30" height="22" rx="4" fill="#1f2b2a" />
          <path d="M0 72 Q28 60 52 74 T96 68 V96 H0Z" fill="#0e1320" />
          <path d="M0 46 L96 38" stroke="#2e3750" strokeWidth="4" />
          <path d="M32 0 L42 96" stroke="#2e3750" strokeWidth="4" />
          <path d="M64 0 L72 62" stroke="#2e3750" strokeWidth="3" />
          <path d="M0 24 L96 54" stroke="#3a4560" strokeWidth="2.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 96 96" className="block size-full" aria-hidden="true">
          <rect width="96" height="96" fill="#f2efe9" />
          <rect x="8" y="8" width="30" height="22" rx="4" fill="#cfe5c1" />
          <path d="M0 72 Q28 60 52 74 T96 68 V96 H0Z" fill="#a9d3f2" />
          <g fill="none">
            <path
              d="M0 46L96 38M32 0L42 96M64 0L72 62"
              stroke="#d9d4c8"
              strokeWidth="7"
            />
            <path
              d="M0 46L96 38M32 0L42 96M64 0L72 62"
              stroke="#fff"
              strokeWidth="5"
            />
            <path d="M0 24L96 54" stroke="#e8b84a" strokeWidth="6" />
            <path d="M0 24L96 54" stroke="#f7d56b" strokeWidth="4" />
          </g>
        </svg>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-[#0f1216]/80 py-0.5 text-center text-[11px] font-medium leading-tight text-white">
        {label}
      </span>
    </div>
  )
}

function ClusterIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <circle cx="10" cy="14" r="6" />
        <circle cx="17.5" cy="7.5" r="3.5" />
        <circle cx="19" cy="17.5" r="2" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <circle cx="6" cy="7" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="17" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="6" cy="18" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="18" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function MapFloatingControls() {
  const { mapStyle, setMapStyle, clusterMode, toggleClusterMode } = useMap()
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false)

  const isClusterAuto = clusterMode === 'auto'
  const clusterTooltipText = isClusterAuto
    ? 'Agrupamento: automático'
    : 'Agrupamento: desligado'

  const activeStyleOption =
    STYLE_OPTIONS.find((option) => option.id === mapStyle) ?? STYLE_OPTIONS[0]
  const nextStyleId = getNextMapStyle(mapStyle)
  const nextStyleOption =
    STYLE_OPTIONS.find((option) => option.id === nextStyleId) ??
    STYLE_OPTIONS[1]

  return (
    <div
      className="pointer-events-auto absolute bottom-9 right-3 z-40 flex flex-col items-end gap-2.5"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.stopPropagation()}
    >
      <TooltipProvider delayDuration={150} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={clusterTooltipText}
              aria-pressed={isClusterAuto}
              onClick={toggleClusterMode}
              className={cn(
                'relative flex size-10 items-center justify-center rounded-xl border border-border bg-card/95 text-card-foreground backdrop-blur-sm transition-colors duration-150',
                'hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <ClusterIcon active={isClusterAuto} />
              {isClusterAuto && (
                <span
                  data-testid="cluster-active-indicator"
                  className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary"
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              side="left"
              sideOffset={8}
              className="border-border bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground"
            >
              {clusterTooltipText}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>

      <div
        className="relative flex items-center"
        onMouseEnter={() => setIsStyleMenuOpen(true)}
        onMouseLeave={() => setIsStyleMenuOpen(false)}
        onFocusCapture={() => setIsStyleMenuOpen(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsStyleMenuOpen(false)
          }
        }}
      >
        {isStyleMenuOpen && (
          <div className="absolute inset-y-0 right-full flex items-center pr-2">
            <div
              role="group"
              aria-label="Selecionar estilo do mapa"
              className="flex h-[72px] items-center gap-2 rounded-xl border border-border bg-card/95 px-2.5 py-2 text-card-foreground backdrop-blur-sm"
            >
              {STYLE_OPTIONS.map((option) => {
                const isSelected = mapStyle === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={`Estilo do mapa: ${option.label}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setMapStyle(option.id)
                      setIsStyleMenuOpen(false)
                    }}
                    className={cn(
                      'size-14 shrink-0 overflow-hidden rounded-lg border-2 p-0 transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/60',
                    )}
                  >
                    <StyleThumbnail style={option.id} label={option.label} />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          aria-label={`Estilo do mapa atual: ${activeStyleOption.label} (clique para ${nextStyleOption.label})`}
          aria-expanded={isStyleMenuOpen}
          onClick={() => setMapStyle(nextStyleOption.id)}
          className={cn(
            'group flex size-[72px] items-center justify-center rounded-xl border border-border bg-card/95 p-1 text-card-foreground backdrop-blur-sm transition-colors duration-150',
            'hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <div className="size-full overflow-hidden rounded-lg border-2 border-transparent transition-colors duration-150 group-hover:border-primary">
            <StyleThumbnail
              style={activeStyleOption.id}
              label={activeStyleOption.label}
            />
          </div>
        </button>
      </div>
    </div>
  )
}
