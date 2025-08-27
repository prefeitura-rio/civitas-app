import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { CardDescription, CardHeader } from '@/components/ui/card'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'

export function Header() {
  const { formattedSearchParams } = useCarRadarSearchParams()

  if (!formattedSearchParams) return null

  const radarIds = formattedSearchParams.radarIds
  const from = new Date(formattedSearchParams.date)
    .addMinutes(formattedSearchParams.duration[0])
    .toISOString()
  const to = new Date(formattedSearchParams.date)
    .addMinutes(formattedSearchParams.duration[1])
    .toISOString()
  const plateHint = formattedSearchParams.plate

  return (
    <CardHeader className="text-center">
      {/* <CardTitle>Resultado para</CardTitle> */}
      <CardDescription>
        <span className="block text-sm text-muted-foreground">
          Radares: {radarIds.join(', ')}
        </span>
        <span className="text-sm text-muted-foreground">
          {`De ${format(from, 'dd MMM, y HH:mm', { locale: ptBR })} a ${format(to, 'dd MMM, y HH:mm', { locale: ptBR })}`}
        </span>
        {plateHint && (
          <span className="block text-sm text-muted-foreground">
            Placa: {plateHint}
          </span>
        )}
      </CardDescription>
    </CardHeader>
  )
}
