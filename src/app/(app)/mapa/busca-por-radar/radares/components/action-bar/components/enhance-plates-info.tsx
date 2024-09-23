import { WandSparkles } from 'lucide-react'

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

export function EnhancePlatesInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <Tooltip text="Enriquecer resultado" asChild>
            <Button variant="secondary" size="icon">
              <WandSparkles className="size-4 shrink-0" />
            </Button>
          </Tooltip>
        </div>
      </DialogTrigger>
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
            <span>56 placas</span>
          </div>
          <div>
            <Label>Tempo até o reestabelecimento do crédito: </Label>
            <span>43 min</span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button>Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
