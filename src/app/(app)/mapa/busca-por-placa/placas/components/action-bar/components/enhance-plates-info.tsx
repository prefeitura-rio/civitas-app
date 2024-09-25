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
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { useCortexRemainingCredits } from '@/hooks/use-queries/use-cortex-remaining-credits'
import { useVehiclesCreditsRequired } from '@/hooks/use-queries/use-vehicles-credits-required'
import type { UseSearchByPlateResultDynamicFilter } from '@/hooks/use-search-by-plate-result-dynamic-filter'
import { queryClient } from '@/lib/react-query'
import { toQueryParams } from '@/utils/to-query-params'

interface EnhancePlatesInfoProps {
  isLoading: boolean
  plates: string[]
  filters: UseSearchByPlateResultDynamicFilter
}

export function EnhancePlatesInfo({
  isLoading,
  plates,
  filters,
}: EnhancePlatesInfoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { formattedSearchParams } = useCarPathsSearchParams()
  const router = useRouter()

  const [resetDate, setResetDate] = useState<Date | null>(null)

  function handleEnhancement() {
    const { selectedPlate } = filters
    if (!formattedSearchParams)
      throw new Error('formattedSearchParams is required')

    const params = {
      from: formattedSearchParams.from,
      to: formattedSearchParams.to,
      plate: selectedPlate || formattedSearchParams.plate,
    }
    const query = toQueryParams(params)

    router.push(`/mapa/busca-por-placa/veiculos?${query.toString()}`)
  }

  const { data: remainingCredits } = useCortexRemainingCredits()
  const { data: creditsRequired } = useVehiclesCreditsRequired(plates)

  useEffect(() => {
    if ((remainingCredits?.remaining_credit || 0) < 100) {
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