import React from 'react'

import { Card, CardDescription } from '@/components/ui/card'

export function SideList() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex min-w-80 gap-6 p-4">
        <div className="flex items-center">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
            <span className="font-bold text-black">1</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <CardDescription className="text-sm">Localização:</CardDescription>
          <div className="flex flex-col gap-1">
            <span className="block">RUA HUMAITA PROXIMO AO Nº229</span>
            <span className="block text-sm">Sentido: BOTAFOGO - FX 2</span>
          </div>
          <CardDescription className="text-xs">
            Data: 17/06/2024 às 17:45
          </CardDescription>
        </div>
      </Card>

      <Card className="flex min-w-80 gap-6 p-4">
        <div className="flex items-center">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-black">
            <span className="font-bold text-black">2</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <CardDescription className="text-sm">Localização:</CardDescription>
          <div className="flex flex-col gap-1">
            <span className="block">RUA HUMAITA PROXIMO AO Nº229</span>
            <span className="block text-sm">Sentido: BOTAFOGO - FX 2</span>
          </div>
          <CardDescription className="text-xs">
            Data: 17/06/2024 às 17:45
          </CardDescription>
        </div>
      </Card>
    </div>
  )
}
