import { Printer } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useRadars } from '@/hooks/use-queries/use-radars'

import JointPlatesReportDownloadProgressAlert from './components/joint-plates-report-download-progress-alert'
import { TripsReportDialogContent } from './components/trips-report-dialog-content'

export function DownloadReportDialog() {
  const {
    layers: {
      trips: { trips, isLoading: isLoadingTrips },
    },
  } = useMap()
  const { data: radars, isLoading: isLoadingRadars } = useRadars()

  const [open, setOpen] = useState(false)
  const [formType, setFormType] = useState<'viagens' | 'placas conjuntas'>(
    'viagens',
  )
  const [nMinutes, setNMinutes] = useState(1)
  const [nPlates, setNPlates] = useState(10)
  const [showViagens, setShowViagens] = useState(false)
  const [showPlacasConjuntas, setShowPlacasConjuntas] = useState(false)

  useEffect(() => {
    setFormType('viagens')
    setNMinutes(1)
    setNPlates(10)
    setShowViagens(false)
    setShowPlacasConjuntas(false)
  }, [open])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip asChild text="Relatórios">
          <span tabIndex={0}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                disabled={
                  !trips || isLoadingTrips || !radars || isLoadingRadars
                }
              >
                <Printer className="size-4 shrink-0" />
              </Button>
            </DialogTrigger>
          </span>
        </Tooltip>
        {!showViagens && !showPlacasConjuntas && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Relatórios</DialogTitle>
              <DialogDescription>Parâmetros do relatório</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo:</Label>
                <RadioGroup
                  defaultValue="viagens"
                  className="pl-4"
                  onValueChange={(value) =>
                    setFormType(value as typeof formType)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="viagens" id="viagens" />
                    <Label htmlFor="viagens">
                      Relatório de Pontos de Detecção (viagens)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="placas conjuntas"
                      id="placas conjuntas"
                    />
                    <Label htmlFor="placas conjuntas">
                      Relatório de Placas Conjuntas
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {formType === 'placas conjuntas' && (
                <>
                  <div className="space-y-2">
                    <Label>
                      Intervalo de interesse ao redor das detecções:
                    </Label>
                    <div className="w-full space-y-2 pl-4 pr-2 pt-6">
                      <Slider
                        value={[nMinutes]}
                        onValueChange={(value) => {
                          setNMinutes(value[0])
                        }}
                        defaultValue={[nMinutes]}
                        max={5}
                        min={1}
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: 1 min</span>
                        <span>Max: 5 min</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Número máximo de placas ao redor das detecções:
                    </Label>
                    <div className="w-full space-y-2 pl-4 pr-2 pt-6">
                      <Slider
                        value={[nPlates]}
                        onValueChange={(value) => {
                          setNPlates(value[0])
                        }}
                        defaultValue={[nPlates]}
                        max={50}
                        min={5}
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: 5</span>
                        <span>Max: 50</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="gap-2">
              <DialogClose>Cancelar</DialogClose>
              <Button
                onClick={() => {
                  if (formType === 'viagens') {
                    setShowViagens(true)
                  } else {
                    setShowPlacasConjuntas(true)
                  }
                }}
              >
                Gerar relatório
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
        {showViagens && <TripsReportDialogContent />}
      </Dialog>
      <JointPlatesReportDownloadProgressAlert
        open={showPlacasConjuntas}
        setOpen={setOpen}
        nMinutes={nMinutes}
        nPlates={nPlates}
      />
    </>
  )
}
