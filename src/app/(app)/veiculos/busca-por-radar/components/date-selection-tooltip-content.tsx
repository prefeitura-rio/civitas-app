import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DateSelectionTooltipContent() {
  return (
    <Card className="m-0">
      <CardHeader>
        <CardTitle className="text-center">
          Intervalo de tempo do relatório
        </CardTitle>
      </CardHeader>
      <CardContent className="text-start">
        <p>
          O período de tempo máximo de 5h foi definido devido ao grande volume
          de dados processados pelo sistema, garantindo que os relatórios sejam
          gerados com agilidade e estabilidade.
        </p>
        <p>
          Caso seja necessário um relatório com período superior, entre em
          contato com o{' '}
          <a
            href="mailto:inteligencia.civitas@prefeitura.rio"
            className="text-blue-600 underline"
          >
            inteligencia.civitas@prefeitura.rio
          </a>
          contendo a justificativa do pedido e todos os parâmetros necessários
          para a geração do relatório.
        </p>
      </CardContent>
    </Card>
  )
}
