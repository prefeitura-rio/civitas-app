import { LoaderCircle, Radar, TriangleAlert } from 'lucide-react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import type { PlateProfileData } from '@/modules/vehicle-intelligence/types/domain'

/** As tendências sem perfil pronto: outra placa em processamento (429), erro, carregando ou base indisponível. */
export function TrendsState({
  plate,
  data,
  error,
  busy,
  onRetry,
}: {
  plate: string
  data: PlateProfileData | null
  error: string | null
  busy: boolean
  onRetry: () => void
}) {
  if (error && busy) {
    return (
      <div className="profile-state" role="status">
        <LoaderCircle className="animate-spin" size={28} />
        <strong>Outra placa está sendo processada</strong>
        <span>
          A varredura do histórico de detecções roda uma placa por vez. Tentando
          novamente em instantes — não é preciso recarregar a página.
        </span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="profile-state error" role="alert">
        <TriangleAlert size={26} />
        <strong>Não foi possível montar o perfil</strong>
        <span>{error}</span>
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="profile-state" role="status">
        <LoaderCircle className="animate-spin" size={28} />
        <strong>Varredura do histórico de detecções</strong>
        <span>
          Lendo as passagens de {plate} no banco de detecções para montar o
          perfil de circulação.
        </span>
      </div>
    )
  }
  return (
    <div className="profile-state" role="status">
      <Radar size={26} />
      <strong>Base evento a evento indisponível</strong>
      <span>{data.reason}</span>
    </div>
  )
}
