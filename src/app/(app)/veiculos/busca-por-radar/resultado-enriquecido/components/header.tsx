import { format } from 'date-fns'

import { CardDescription, CardHeader } from '@/components/ui/card'
import { useCarRadarSearchParams } from '@/hooks/useParams/useCarRadarSearchParams'
import { dateConfig } from '@/lib/date-config'

export function Header() {
  const { formattedSearchParams } = useCarRadarSearchParams()

  if (!formattedSearchParams) return null

  const radarIds = formattedSearchParams.radarIds
  const from = new Date(formattedSearchParams.date.from).toISOString()
  const to = new Date(formattedSearchParams.date.to).toISOString()
  const plateHint = formattedSearchParams.plate

  return (
    <CardHeader className="text-center">
      {/* <CardTitle>Resultado para</CardTitle> */}
      <CardDescription>
        <span className="block text-sm text-muted-foreground">
          Radares: {radarIds.join(', ')}
        </span>
        <span className="text-sm text-muted-foreground">
          {`De ${format(from, 'dd MMM, y HH:mm', { locale: dateConfig.locale })} a ${format(to, 'dd MMM, y HH:mm', { locale: dateConfig.locale })}`}
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
