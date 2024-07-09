'use client'
import { OfficialCarsContextProvider } from '@/contexts/official-cars-context'

import { Map } from './components/map'

export default function OfficialCars() {
  return (
    <div className="h-screen w-full">
      <OfficialCarsContextProvider>
        <Map />
      </OfficialCarsContextProvider>
    </div>
  )
}
