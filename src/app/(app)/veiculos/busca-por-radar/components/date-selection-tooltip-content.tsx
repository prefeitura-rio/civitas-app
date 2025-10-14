import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DateSelectionTooltipContent() {
  return (
    <Card className="m-0">
      <CardHeader>
        <CardTitle className="text-center">
          Instruções para seleção de datas:
        </CardTitle>
      </CardHeader>
      <CardContent className="text-start">
        <p>O intervalo entre as datas deve ser de no máximo 5 horas</p>
      </CardContent>
    </Card>
  )
}
