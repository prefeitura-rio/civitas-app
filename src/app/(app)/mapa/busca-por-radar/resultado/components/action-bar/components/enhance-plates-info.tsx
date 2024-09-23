'use client'
import { format } from 'date-fns'
import { WandSparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useCortexRemainingCredits } from '@/hooks/use-queries/use-cortex-remaining-credits'
import { useVehiclesNecessaryCredits } from '@/hooks/use-queries/use-vehicles-necessary-credits'

interface EnhancePlatesInfoProps {
  isLoading: boolean
  plates: string[]
}

export function EnhancePlatesInfo({
  isLoading,
  plates,
}: EnhancePlatesInfoProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [resetDate, setResetDate] = useState<Date | null>(null)

  function handleEnhancement() {
    router.push(
      `/mapa/busca-por-radar/resultado-enriquecido?${searchParams.toString()}`,
    )
  }

  const { data: remainingCredits } = useCortexRemainingCredits()
  const { data: creditsRequired } = useVehiclesNecessaryCredits(plates)

  useEffect(() => {
    const date = new Date(
      Date.now() + (remainingCredits?.time_until_reset || 0) * 1000,
    )
    setResetDate(date)
  }, [])

  return (
    <Dialog>
      <Tooltip asChild text="Enriquecer resultado">
        <span tabIndex={0}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="icon" disabled={isLoading}>
              <WandSparkles className="size-4 shrink-0" />
            </Button>
          </DialogTrigger>
        </span>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enriquecer Resultado</DialogTitle>
          <DialogDescription>
            Obtenha informações adicionais sobre as placas, como marca, modelo,
            cor e ano do modelo.
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <div>
            <Label>Crédito restante: </Label>
            <span>{remainingCredits?.remaining_credit}</span>
          </div>
          <div>
            <Label>Crédito necessários: </Label>
            <span>{creditsRequired?.credits}</span>
          </div>
          {resetDate && (
            <div>
              <Label>Reset dos créditos: </Label>
              <span>{format(resetDate, 'HH:mm:ss')}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            disabled={
              (creditsRequired?.credits || Infinity) >
              (remainingCredits?.remaining_credit || 0)
            }
            onClick={handleEnhancement}
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
