import { formatDate } from 'date-fns'

import { Label } from '@/components/ui/label'
import type { Radar } from '@/models/entities'

interface RadarInfoProps {
  radar: Radar
}

// const radarLabels: Record<
//   Exclude<keyof Radar, 'hasData' | 'activeInLast24Hours'>,
//   string
// > = {
//   cameraNumber: 'Câmera Número',
//   cetRioCode: 'Código CET-Rio',
//   location: 'Localização',
//   district: 'Bairro',
//   streetName: 'Logradouro',
//   direction: 'Direção',
//   company: 'Empresa',
//   longitude: 'Longitude',
//   latitude: 'Latitude',
//   lastDetectionTime: 'Última detecção',
//   lane: 'Faixa',
//   streetNumber: 'Número',
// }

const radarLabels: Record<string, string> = {
  cameraNumber: 'Câmera Número',
  cetRioCode: 'Código CET-Rio',
  lastDetectionTime: 'Última detecção',
  lane: 'Faixa',
}

export function RadarInfo({ radar }: RadarInfoProps) {
  return (
    <div>
      <h4 className="mt-4">Propriedades do Radar</h4>
      <div className="ml-4">
        {Object.entries(radarLabels).map(([key, label], index) => (
          <div key={index}>
            <Label>{label}: </Label>
            <span className="text-xs text-muted-foreground">
              {key === 'lastDetectionTime'
                ? formatDate(
                    radar[key as keyof Radar] as string,
                    'dd/MM/y HH:mm:ss',
                  )
                : radar[key as keyof Radar]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
