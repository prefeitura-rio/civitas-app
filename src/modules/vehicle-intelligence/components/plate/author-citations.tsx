import type { AuthorCitation } from '@/modules/vehicle-intelligence/types/domain'

/** Texto da etiqueta "CITADA NA DINÂMICA" (ranking e grafo); nulo sem citação. */
export function authorCitationNote(
  citations: AuthorCitation[] | undefined,
): string | null {
  return citations?.length
    ? `Citada na dinâmica como veículo dos autores · RO(s): ${citations.map((item) => item.ro).join(', ')}`
    : null
}

/** ROs que citam a placa no relato como veículo dos autores (classificação da base unificada). */
export function AuthorCitations({
  citations,
}: {
  citations?: AuthorCitation[]
}) {
  if (!citations?.length) return null
  return (
    <details className="author-citations">
      <summary>Citada no relato como veículo dos autores</summary>
      <p>
        Classificação da base unificada. A citação se refere aos ROs abaixo; não
        se estende automaticamente às demais correlações.
      </p>
      <ul>
        {citations.map((item, index) => (
          <li key={`${item.ro}-${index}`}>
            <strong>RO {item.ro}</strong> · confiança da classificação:{' '}
            {item.confidence || 'não informada'} · fonte:{' '}
            {item.source || 'não informada'}
          </li>
        ))}
      </ul>
    </details>
  )
}
