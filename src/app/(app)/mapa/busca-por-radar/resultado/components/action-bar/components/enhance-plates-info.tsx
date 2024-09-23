'use client'
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

  const [timer, setTimer] = useState<number | undefined>(undefined)

  function handleEnhancement() {
    router.push(
      `/mapa/busca-por-radar/resultado-enriquecido?${searchParams.toString()}`,
    )
  }

  const { data: remainingCredits } = useCortexRemainingCredits()
  const { data: creditsRequired } = useVehiclesNecessaryCredits(plates)
  console.log(timer)
  useEffect(() => {
    if (remainingCredits && remainingCredits.remaining_credit < 100) {
      if (!timer) {
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (!prev) {
              return remainingCredits.time_until_reset
            } else {
              return prev - 1
            }
          })
        }, 1000)
        return () => clearInterval(interval)
      } else {
        setTimer(remainingCredits.time_until_reset)
      }
    }
  }, [remainingCredits, remainingCredits?.time_until_reset])

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
          {timer && (
            <div>
              <Label>Tempo até o reestabelecimento do crédito: </Label>
              <span>
                {((timer || 0) / 60).toFixed(0)} min {(timer || 0) % 60} s
              </span>
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
