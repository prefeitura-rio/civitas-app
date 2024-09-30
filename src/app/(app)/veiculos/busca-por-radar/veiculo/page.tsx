'use client'
import { useSearchParams } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { VehicleInfo } from '../../busca-por-placa/veiculo/components/trip-list/components/vehicle-info'

export default function Vehicle() {
  const searchParams = useSearchParams()
  const plate = searchParams.get('plate') || ''

  return (
    <Card className="w-full">
      <CardHeader>
        {/* <CardTitle className="text-center">Detalhes do Veículo</CardTitle> */}
        <CardTitle className="text-center">
          Placa: <span className="code-highlight">{plate}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <VehicleInfo plate={plate} />
      </CardContent>
    </Card>
  )
}
