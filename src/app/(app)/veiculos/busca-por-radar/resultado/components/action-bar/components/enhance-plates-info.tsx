'use client'
import { format } from 'date-fns'
import { WandSparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import { useCortexRemainingCredits } from '@/hooks/use-queries/use-cortex-remaining-credits'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'
import { useVehiclesCreditsRequired } from '@/hooks/use-queries/use-vehicles-credits-required'
import type { UseSearchByRadarResultDynamicFilter } from '@/hooks/use-search-by-radar-result-dynamic-filter'
import { queryClient } from '@/lib/react-query'
import { cortexRequestLimit } from '@/utils/cortex-limit'
import { toQueryParams } from '@/utils/to-query-params'

interface EnhancePlatesInfoProps {
  isLoading: boolean
  plates: string[]
  filters: UseSearchByRadarResultDynamicFilter
  data: DetectionDTO[] | undefined
}

export function EnhancePlatesInfo({
  isLoading,
  plates,
  filters,
  data,
}: EnhancePlatesInfoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { formattedSearchParams } = useCarRadarSearchParams()
  const router = useRouter()

  const [resetDate, setResetDate] = useState<Date | null>(null)

  function handleEnhancement() {
    const { selectedPlate } = filters
    if (!formattedSearchParams)
      throw new Error('formattedSearchParams is required')

    // Get unique radarIds
    const allRadarIds = data?.map((item) => item.cetRioCode)
    const radarIds = [...new Set(allRadarIds)]

    const params = {
      date: {
        from: formattedSearchParams.date.from,
        to: formattedSearchParams.date.to,
      },
      plate: selectedPlate || formattedSearchParams.plate,
      radarIds,
    }
    const query = toQueryParams(params)

    router.push(
      `/veiculos/busca-por-radar/resultado-enriquecido?${query.toString()}`,
    )
  }

  const { data: remainingCredits } = useCortexRemainingCredits()
  const { data: creditsRequired } = useVehiclesCreditsRequired(plates)

  useEffect(() => {
    if ((remainingCredits?.remaining_credit || 0) < cortexRequestLimit) {
      const date = new Date(
        Date.now() + (remainingCredits?.time_until_reset || 0) * 1000,
      )
      setResetDate(date)
    } else {
      setResetDate(null)
    }
  }, [remainingCredits])

  function handleDialogOpen(open: boolean) {
    if (open) {
      queryClient.invalidateQueries({
        queryKey: ['users', 'cortex-remaining-credits'],
      })
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <Tooltip asChild text="Enriquecer resultado">
        <span tabIndex={0}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              disabled={isLoading || plates.length === 0}
            >
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
            <Label>Crédito disponível: </Label>
            <span className="text-muted-foreground">
              {remainingCredits?.remaining_credit} de 90
            </span>
          </div>
          <div>
            <Label>Crédito necessário: </Label>
            <span className="text-muted-foreground">
              {creditsRequired?.credits}
            </span>
          </div>
          {resetDate &&
            remainingCredits &&
            remainingCredits.remaining_credit < cortexRequestLimit && (
              <div>
                <Label>Reposição às </Label>
                <span className="text-muted-foreground">
                  {format(resetDate, 'HH:mm:ss')}
                </span>
              </div>
            )}
          {remainingCredits &&
            creditsRequired &&
            remainingCredits.remaining_credit < creditsRequired.credits &&
            (creditsRequired.credits < 90 ? (
              <div className="mt-4 rounded-lg border-l-2 border-yellow-500 bg-secondary px-3 py-2">
                <p className="pl-6 -indent-6 text-muted-foreground">
                  ⚠️ Você não possui crédito suficiente para enriquecer esse
                  resultado. Restrinja a sua consulta a fim de diminuir o
                  crédito necessário para o enriquecimento ou aguarde o horário
                  de reposição dos seus créditos.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border-l-2 border-yellow-500 bg-secondary px-3 py-2">
                <p className="pl-6 -indent-6 text-muted-foreground">
                  ⚠️ Você não possui crédito suficiente para enriquecer esse
                  resultado. Restrinja a sua consulta a fim de diminuir o
                  crédito necessário para o enriquecimento.
                </p>
              </div>
            ))}
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
