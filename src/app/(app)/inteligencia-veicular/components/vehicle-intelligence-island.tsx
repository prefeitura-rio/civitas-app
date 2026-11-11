'use client'

import dynamic from 'next/dynamic'

import { Spinner } from '@/components/custom/spinner'

// Só no navegador: o módulo lê a URL e o window ao carregar, e o Leaflet, o deck.gl e o vis-network não rodam no
// servidor.
const VehicleIntelligenceRoot = dynamic(
  () =>
    import('@/modules/vehicle-intelligence/vehicle-intelligence-root').then(
      (module) => module.VehicleIntelligenceRoot,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    ),
  },
)

export function VehicleIntelligenceIsland({
  fontClassName,
}: {
  fontClassName: string
}) {
  return <VehicleIntelligenceRoot fontClassName={fontClassName} />
}
