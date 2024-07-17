import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PlateWildcardsHelperInfo() {
  return (
    <Card className="m-0">
      <CardHeader>
        <CardTitle>Informações sobre a busca:</CardTitle>
      </CardHeader>
      <CardContent className="text-start">
        <p>
          Você pode utilizar este campo para pesquisar por uma placa específica
          ou por parte de uma placa utilizando os seguintes{' '}
          <span className="font-bold text-primary">wildcards</span>:
        </p>
        <ul className="list-decoration my-2">
          <li>
            <span className="code-highlight">*</span>: Substitui qualquer
            sequência de caracteres (inclusive nenhum caractere).
          </li>
          <ul>
            <li>
              Exemplo: <span className="code-highlight">ABC*123</span>{' '}
              encontrará todas as placas que começam com "ABC" e terminam com
              "123".
            </li>
          </ul>
          <li>
            <span className="code-highlight">?</span>: Substitui um único
            caractere.
          </li>
          <ul>
            <li>
              Exemplo: <span className="code-highlight">AB?123</span> encontrará
              todas as placas que começam com "AB", seguidas de qualquer
              caractere único, e terminam com "123".
            </li>
          </ul>
        </ul>
        <h4>Exemplos de Pesquisa:</h4>
        <ul className="list-decoration my-2">
          <li>
            <span className="code-highlight">ABC1234</span>: Encontrará a placa
            exata "ABC1234".
          </li>
          <li>
            <span className="code-highlight">ABC*</span>: Encontrará todas as
            placas que começam com "ABC".
          </li>
          <li>
            <span className="code-highlight">*1234</span>: Encontrará todas as
            placas que terminam com "1234".
          </li>
          <li>
            <span className="code-highlight">AB?1234</span>: Encontrará todas as
            placas que começam com "AB", seguidas de qualquer caractere único, e
            terminam com "1234".
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
