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
import type { CameraCOR } from '@/models/entities'

interface CameraSelectCardProps {
  selectedObject: CameraCOR | null
  setSelectedObject: (value: CameraCOR | null) => void
}

export function CameraSelectCard({
  selectedObject,
  setSelectedObject,
}: CameraSelectCardProps) {
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
            Câmera{' '}
            <span className="font-extrabold text-primary">
              {selectedObject?.code}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">{`${selectedObject?.location.capitalizeFirstLetter()} - ${selectedObject?.zone.capitalizeFirstLetter()}`}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código:</span>
              <span className="font-medium">{selectedObject?.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Localização:</span>
              <span className="font-medium">
                {selectedObject?.location.capitalizeFirstLetter()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zona:</span>
              <span className="font-medium">
                {selectedObject?.zone.capitalizeFirstLetter()}
              </span>
            </div>
            {selectedObject?.streamingUrl && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    window.open(selectedObject?.streamingUrl, '_blank')
                  }}
                >
                  Abrir Streaming
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
