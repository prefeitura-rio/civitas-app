'use client'

import '@/utils/string-extensions'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Radar } from '@/models/entities'

interface RadarSelectCardProps {
  selectedObject: Radar | null
  setSelectedObject: (value: Radar | null) => void
}

export function RadarSelectCard({
  selectedObject,
  setSelectedObject,
}: RadarSelectCardProps) {
  console.log('🔍 RadarSelectCard renderizando:', {
    selectedObject: selectedObject?.cetRioCode || 'null',
  })

  return (
    <Card
      className={cn(
        'absolute left-2 top-2 w-72 tracking-tighter',
        !selectedObject ? 'hidden' : '',
      )}
    >
      <div className="relative">
        <Button
          variant="outline"
          className="absolute right-1 top-1 h-5 w-5 p-0"
          onClick={() => {
            setSelectedObject(null)
          }}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="px-4 py-4">
          <CardTitle className="text-md text-center tracking-tighter">
            Radar{' '}
            <span className="font-extrabold text-primary">
              {selectedObject?.cetRioCode}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">{`${selectedObject?.location?.capitalizeFirstLetter() || ''} - ${selectedObject?.district?.capitalizeFirstLetter() || ''}`}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código:</span>
              <span className="font-medium">{selectedObject?.cetRioCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Localização:</span>
              <span className="font-medium">
                {selectedObject?.location?.capitalizeFirstLetter() || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bairro:</span>
              <span className="font-medium">
                {selectedObject?.district?.capitalizeFirstLetter() || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latitude:</span>
              <span className="font-medium">
                {selectedObject?.latitude?.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Longitude:</span>
              <span className="font-medium">
                {selectedObject?.longitude?.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Empresa:</span>
              <span className="font-medium">
                {selectedObject?.company || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ativo 24h:</span>
              <span
                className={cn(
                  'font-medium',
                  selectedObject?.activeInLast24Hours
                    ? 'text-emerald-600'
                    : 'text-rose-600',
                )}
              >
                {selectedObject?.activeInLast24Hours ? 'Sim' : 'Não'}
              </span>
            </div>
            {selectedObject?.lastDetectionTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última detecção:</span>
                <span className="font-medium">
                  {new Date(selectedObject.lastDetectionTime).toLocaleString(
                    'pt-BR',
                  )}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
