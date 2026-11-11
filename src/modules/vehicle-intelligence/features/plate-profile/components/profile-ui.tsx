import { Clock, Radar, ScanSearch, SquareUser } from 'lucide-react'
import { useRef } from 'react'

import {
  PLATE_PATTERN_HINT,
  PlateSearchResults,
  usePlateSearchField,
} from '@/modules/vehicle-intelligence/components/plate/plate-search'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { Input } from '@/modules/vehicle-intelligence/components/ui/input'
import { Label } from '@/modules/vehicle-intelligence/components/ui/label'
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import type { OpenPlate } from '@/modules/vehicle-intelligence/types/navigation'

const SEARCH_SUBJECT = copassagem
  ? 'ocorrências e vítimas'
  : 'os roubos e furtos a transeuntes da área'

export function PlateProfileSearch({
  onOpenPlate,
}: {
  onOpenPlate: OpenPlate
}) {
  const field = usePlateSearchField(onOpenPlate)
  const results = useRef<HTMLDivElement>(null)
  return (
    <div className="grid min-h-[calc(100dvh-10rem)] place-items-center p-6">
      <div className="flex w-full max-w-[680px] flex-col items-center gap-4">
        <form
          className="flex w-full max-w-[520px] flex-col gap-2.5 rounded-[18px] border border-border bg-gradient-to-b from-card to-secondary px-8 pb-7 pt-8 text-center shadow-[0_30px_70px_rgba(0,0,0,.38)]"
          onSubmit={(event) => field.submit(event, results)}
        >
          <div className="grid size-[52px] place-items-center self-center rounded-[14px] border border-primary/25 bg-accent text-primary">
            <SquareUser size={22} />
          </div>
          <span className="text-[9.5px] font-semibold uppercase tracking-[.19em] text-muted-foreground">
            PERFIL DA PLACA · CORRELAÇÕES E TENDÊNCIAS
          </span>
          <h2 className="mt-0.5 text-[21px] font-semibold">Buscar uma placa</h2>
          <p className="mb-1.5 text-[12.5px] leading-relaxed text-secondary-foreground/75">
            Abra primeiro as correlações da placa com {SEARCH_SUBJECT}. A mesma
            página também reúne locais recorrentes, horários, turnos, viagens e
            hiatos de circulação. A busca mostra em quais dos três recortes a
            placa aparece.
          </p>
          <div className="flex flex-col gap-1.5 text-left">
            <Label
              className="text-[10px] font-semibold uppercase tracking-[.08em] text-muted-foreground"
              htmlFor="plate-search-input"
            >
              Placa
            </Label>
            <div className="flex items-center gap-2 rounded-[10px] border border-border bg-background px-3 focus-within:ring-2 focus-within:ring-ring/30">
              <ScanSearch className="text-muted-foreground" size={17} />
              <Input
                id="plate-search-input"
                className="h-[46px] flex-1 border-0 bg-transparent font-mono text-lg tracking-[.12em] shadow-none focus-visible:ring-0"
                value={field.value}
                autoFocus
                maxLength={8}
                autoComplete="off"
                spellCheck={false}
                placeholder="Ex.: ABC1D23 ou RJQ9F9-"
                aria-describedby="plate-search-hint"
                onChange={(event) => field.setValue(event.target.value)}
              />
            </div>
            <small
              className="text-[11px] text-muted-foreground"
              id="plate-search-hint"
            >
              {PLATE_PATTERN_HINT}
            </small>
          </div>
          <Button
            type="submit"
            className="mt-1 h-[46px] gap-2 font-semibold"
            disabled={!field.ready}
          >
            <Radar size={16} />
            {field.ready && !field.exact
              ? 'Ver placas semelhantes'
              : 'Abrir perfil'}
          </Button>
          <p className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock size={13} />
            As correlações abrem primeiro; o histórico completo só é lido ao
            acessar Tendências.
          </p>
        </form>
        {field.showResults && (
          <div className="plate-search-page-results">
            <PlateSearchResults field={field} listRef={results} hint={false} />
          </div>
        )}
      </div>
    </div>
  )
}
