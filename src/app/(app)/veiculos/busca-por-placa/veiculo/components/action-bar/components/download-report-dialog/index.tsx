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

import JointPlatesReportDownloadProgressAlert from './components/joint-plates-report-download-progress-alert'
import { TripsReportDialogContent } from './components/trips-report-dialog-content'

export function DownloadReportDialog() {
  const [open, setOpen] = useState(false)
  const [formType, setFormType] = useState<'viagens' | 'placas conjuntas'>(
    'viagens',
  )
  const [interval, setInterval] = useState(1)
  const [showViagens, setShowViagens] = useState(false)
  const [showPlacasConjuntas, setShowPlacasConjuntas] = useState(false)

  useEffect(() => {
    setFormType('viagens')
    setInterval(1)
    setShowViagens(false)
    setShowPlacasConjuntas(false)
  }, [open])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip asChild text="Relatórios">
          <DialogTrigger asChild>
            <Button variant="secondary" size="icon">
              <Printer className="size-4 shrink-0" />
            </Button>
          </DialogTrigger>
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
                <div className="space-y-2">
                  <Label>Intervalo:</Label>
                  <div className="w-full space-y-2 pl-4 pr-2 pt-6">
                    <Slider
                      value={[interval]}
                      onValueChange={(value) => {
                        setInterval(value[0])
                      }}
                      defaultValue={[interval]}
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
      {showPlacasConjuntas && (
        <JointPlatesReportDownloadProgressAlert
          open={showPlacasConjuntas}
          setOpen={setOpen}
          interval={interval}
        />
      )}
    </>
  )
}