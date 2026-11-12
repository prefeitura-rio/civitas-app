import {
  INVESTIGATION_NOTICE,
  withoutTerm,
} from '@/modules/vehicle-intelligence/components/groups/group-text'
import type { Methodology } from '@/modules/vehicle-intelligence/types/groups'

/** Os critérios (`terms`: [termo, chave da metodologia]), cada um com o texto sem o "Termo:" do começo, e o aviso. */
export function MethodologyTerms({
  terms,
  methodology,
}: {
  terms: ReadonlyArray<readonly [string, string]>
  methodology: Methodology | undefined
}) {
  return (
    <dl>
      {terms.map(([term, key]) => (
        <div key={key}>
          <dt>{term}</dt>
          <dd>{withoutTerm(methodology?.[key])}</dd>
        </div>
      ))}
      <div>
        <dt>Atenção</dt>
        <dd>{INVESTIGATION_NOTICE}</dd>
      </div>
    </dl>
  )
}
